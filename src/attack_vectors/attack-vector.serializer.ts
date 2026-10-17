import { ApiProperty } from '@nestjs/swagger';
import { AttackVector } from './entities/attack-vector.entity';

export class AttackVectorResponse {
  @ApiProperty({ example: 8 }) id: number;
  @ApiProperty({ example: 'Атака посредника (MITM)' }) title: string;
  @ApiProperty({ type: String, nullable: true, example: 'Перехват трафика' }) short_description: string | null;
  @ApiProperty({ example: 'http://localhost:9000/attack-vectors/image_3f9e.png' }) image_url: string;
  @ApiProperty({ example: 'http://localhost:9000/attack-vectors/video_f07b.mp4' }) video_url: string;
  @ApiProperty({ type: Number, nullable: true, example: 7 }) severity: number | null;
  @ApiProperty({ type: Number, nullable: true, example: 2010 }) discovered_year: number | null;
  @ApiProperty({ example: 3 }) likes_count: number;
  @ApiProperty({ enum: [0, 1], description: 'Текущий пользователь поставил лайк' }) is_liked: 0 | 1;
  @ApiProperty({ enum: [0, 1], description: 'Текущий пользователь — создатель услуги' }) is_mine: 0 | 1;
}

export function serializeAttackVector(
  v: AttackVector,
  likesCount: number,
  isLiked: boolean,
  currentUserId: number | null,
  getUrl: (key: string) => string,
): AttackVectorResponse {
  return {
    id: v.id,
    title: v.title,
    short_description: v.shortDescription ?? null,
    image_url: getUrl(v.imageUrl),
    video_url: getUrl(v.videoUrl),
    severity: v.severity ?? null,
    discovered_year: v.discoveredYear ?? null,
    likes_count: likesCount,
    is_liked: isLiked ? 1 : 0,
    is_mine: currentUserId !== null && v.creatorId === currentUserId ? 1 : 0,
  };
}
