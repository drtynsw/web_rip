import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttackVector, AttackVectorStatus } from './entities/attack-vector.entity';
import { Like } from './entities/like.entity';

export const DEFAULT_IMAGE_KEY = 'default.png';
export const DEFAULT_VIDEO_KEY = 'default.mp4';

@Injectable()
export class AttackVectorsService {
  constructor(
    @InjectRepository(AttackVector)
    private readonly attackVectorRepository: Repository<AttackVector>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
  ) {}

  async findPublished(discoveredYear?: number): Promise<AttackVector[]> {
    const qb = this.attackVectorRepository
      .createQueryBuilder('av')
      .where('av.status = :status', { status: AttackVectorStatus.PUBLISHED });

    if (discoveredYear !== undefined && !Number.isNaN(discoveredYear)) {
      qb.andWhere('av.discoveredYear = :year', { year: discoveredYear });
    }

    return qb.orderBy('av.id', 'ASC').getMany();
  }

  async findOnePublished(id: number): Promise<AttackVector | null> {
    return this.attackVectorRepository.findOne({
      where: { id, status: AttackVectorStatus.PUBLISHED },
    });
  }

  async findFirstPublished(): Promise<AttackVector | null> {
    return this.attackVectorRepository.findOne({
      where: { status: AttackVectorStatus.PUBLISHED },
      order: { id: 'ASC' },
    });
  }

  async findNextPublished(afterId: number): Promise<AttackVector | null> {
    const next = await this.attackVectorRepository
      .createQueryBuilder('av')
      .where('av.status = :status', { status: AttackVectorStatus.PUBLISHED })
      .andWhere('av.id > :afterId', { afterId })
      .orderBy('av.id', 'ASC')
      .limit(1)
      .getOne();

    return next ?? this.findFirstPublished();
  }

  async findDraftByUser(userId: number): Promise<AttackVector | null> {
    return this.attackVectorRepository.findOne({
      where: { creatorId: userId, status: AttackVectorStatus.DRAFT },
    });
  }

  async createDraft(userId: number, title: string): Promise<AttackVector> {
    const draft = this.attackVectorRepository.create({
      title,
      status: AttackVectorStatus.DRAFT,
      imageUrl: DEFAULT_IMAGE_KEY,
      videoUrl: DEFAULT_VIDEO_KEY,
      creatorId: userId,
    });
    return this.attackVectorRepository.save(draft);
  }

  async publishDraft(
    id: number,
    shortDescription: string,
    severity: number,
    discoveredYear: number,
  ): Promise<void> {
    await this.attackVectorRepository.update(
      { id, status: AttackVectorStatus.DRAFT },
      {
        shortDescription,
        severity,
        discoveredYear,
        status: AttackVectorStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    );
  }

  async softDeleteBySql(id: number): Promise<void> {
    await this.attackVectorRepository.query(
      `UPDATE attack_vectors SET status = $1 WHERE id = $2`,
      [AttackVectorStatus.DELETED, id],
    );
  }

  async likesCount(attackVectorId: number): Promise<number> {
    return this.likeRepository.count({ where: { attackVectorId } });
  }
}
