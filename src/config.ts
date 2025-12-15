/**
 * 默认集合名称配置
 */
export const DEFAULT_COLLECTION_NAMES = {
  likes: "likes",
  comments: "comments",
  favorites: "favorites",
  favoriteSubCollectionPrefix: "favorite_",
} as const;

/**
 * Firestore getAll 限制
 */
export const BATCH_LIMIT = 100;
