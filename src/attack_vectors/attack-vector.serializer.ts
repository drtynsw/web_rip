import { AttackVector } from './entities/attack-vector.entity';

export interface AttackVectorResponse {
  id: number;
  title: string;
  short_description: string | null;
  image_url: string;
  video_url: string;
  severity: number | null;
  discovered_year: number | null;
  likes_count: number;
  is_liked: 0 | 1; // текущий пользователь поставил лайк
  is_mine: 0 | 1;  // текущий пользователь — создатель услуги
}

export function serializeAttackVector(
  v: AttackVector,
  likesCount: number,
  isLiked: boolean,
  currentUserId: number,
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
    is_mine: v.creatorId === currentUserId ? 1 : 0,
  };
}
