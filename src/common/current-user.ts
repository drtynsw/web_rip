const CREATOR_ID = 1;

export interface CurrentUser {
  readonly id: number;
}

let instance: CurrentUser | null = null;

export function getCurrentUser(): CurrentUser {
  if (instance === null) {
    instance = Object.freeze({ id: CREATOR_ID });
  }
  return instance;
}
