import { UploadedFile } from '../common/uploaded-file';

export interface ListQuery {
  discovered_year?: string;
}

export interface FeedQuery {
  id?: string;
  next?: string;
}

export interface CreateRequest {
  title: string;
  image: UploadedFile;
  video: UploadedFile;
}

export interface PublishRequest {
  short_description: string;
  severity: number;
  discovered_year: number;
}

export interface LikeRequest {
  like: 0 | 1;
}
