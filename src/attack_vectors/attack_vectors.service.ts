import {
  BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { AttackVector, AttackVectorStatus } from './entities/attack-vector.entity';
import { Like } from './entities/like.entity';
import { MinioService } from '../minio/minio.service';
import { AttackVectorResponse, serializeAttackVector } from './attack-vector.serializer';
import { UploadedFile } from '../common/uploaded-file';

const PUBLISHED = AttackVectorStatus.PUBLISHED;

@Injectable()
export class AttackVectorsService {
  constructor(
    @InjectRepository(AttackVector) private readonly avRepository: Repository<AttackVector>,
    @InjectRepository(Like) private readonly likeRepository: Repository<Like>,
    private readonly minio: MinioService,
  ) {}

  private async serialize(items: AttackVector[], userId: number): Promise<AttackVectorResponse[]> {
    if (!items.length) return [];
    const ids = items.map((v) => v.id);
    const counts = await this.likeRepository
      .createQueryBuilder('l')
      .select('l.attackVectorId', 'id').addSelect('COUNT(*)', 'cnt')
      .where('l.attackVectorId IN (:...ids)', { ids })
      .groupBy('l.attackVectorId')
      .getRawMany<{ id: number; cnt: string }>();
    const liked = await this.likeRepository.find({ where: { userId, attackVectorId: In(ids) } });
    const countMap = new Map(counts.map((c) => [Number(c.id), Number(c.cnt)]));
    const likedSet = new Set(liked.map((l) => l.attackVectorId));
    return items.map((v) => serializeAttackVector(
      v, countMap.get(v.id) ?? 0, likedSet.has(v.id), userId, (k) => this.minio.getUrl(k)));
  }

  private async serializeOne(v: AttackVector, userId: number) {
    return (await this.serialize([v], userId))[0];
  }

  async findPublished(userId: number, discoveredYear?: number) {
    const qb = this.avRepository.createQueryBuilder('av').where('av.status = :s', { s: PUBLISHED });
    if (discoveredYear !== undefined) qb.andWhere('av.discoveredYear = :y', { y: discoveredYear });
    return this.serialize(await qb.orderBy('av.id', 'ASC').getMany(), userId);
  }

  async findFeed(userId: number, id?: number, next = false) {
    let v: AttackVector | null;
    if (id === undefined) {
      v = await this.avRepository.findOne({ where: { status: PUBLISHED }, order: { id: 'ASC' } });
    } else if (next) {
      v = await this.avRepository.createQueryBuilder('av')
        .where('av.status = :s', { s: PUBLISHED }).andWhere('av.id > :id', { id })
        .orderBy('av.id', 'ASC').limit(1).getOne();
      v ??= await this.avRepository.findOne({ where: { status: PUBLISHED }, order: { id: 'ASC' } });
    } else {
      v = await this.avRepository.findOne({ where: { id, status: PUBLISHED } });
    }
    if (!v) throw new NotFoundException();
    return this.serializeOne(v, userId);
  }

  async findDraft(userId: number) {
    const v = await this.avRepository.findOne({ where: { creatorId: userId, status: AttackVectorStatus.DRAFT } });
    if (!v) throw new NotFoundException();
    return this.serializeOne(v, userId);
  }

  async createDraft(userId: number, title: string, image: UploadedFile, video: UploadedFile) {
    const exists = await this.avRepository.exists({ where: { creatorId: userId, status: AttackVectorStatus.DRAFT } });
    if (exists) throw new ConflictException(); // у пользователя уже есть черновик

    const imageKey = `image_${randomUUID()}${extname(image.originalname).toLowerCase() || '.png'}`;
    const videoKey = `video_${randomUUID()}${extname(video.originalname).toLowerCase() || '.mp4'}`;
    await this.minio.upload(imageKey, image.buffer, image.mimetype);
    await this.minio.upload(videoKey, video.buffer, video.mimetype);

    const draft = await this.avRepository.save(this.avRepository.create({
      title, status: AttackVectorStatus.DRAFT, imageUrl: imageKey, videoUrl: videoKey, creatorId: userId,
    }));
    return this.serializeOne(draft, userId);
  }

  async publishDraft(userId: number, shortDescription: string, severity: number, discoveredYear: number) {
    const v = await this.avRepository.findOne({ where: { creatorId: userId, status: AttackVectorStatus.DRAFT } });
    if (!v) throw new NotFoundException();
    Object.assign(v, { shortDescription, severity, discoveredYear, status: PUBLISHED, publishedAt: new Date() });
    return this.serializeOne(await this.avRepository.save(v), userId);
  }

  async softDelete(userId: number, id: number): Promise<void> {
    const v = await this.avRepository.findOne({ where: { id, status: Not(AttackVectorStatus.DELETED) } });
    if (!v) throw new NotFoundException();
    if (v.creatorId !== userId) throw new ForbiddenException();
    await this.avRepository.update({ id }, { status: AttackVectorStatus.DELETED });
  }

  async setLike(userId: number, id: number, like: 0 | 1) {
    const v = await this.avRepository.findOne({ where: { id, status: PUBLISHED } });
    if (!v) throw new NotFoundException();
    if (like === 1) {
      await this.likeRepository.createQueryBuilder().insert().into(Like)
        .values({ userId, attackVectorId: id }).orIgnore().execute();
    } else {
      await this.likeRepository.delete({ userId, attackVectorId: id });
    }
    return this.serializeOne(v, userId);
  }
}
