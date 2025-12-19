/**
 * 互动统计字段
 * 目标对象继承 InteractionStats 即可
 *
 * @example
 * interface CharacterCard extends InteractionStats {
 *   id: string;
 *   name: string;
 * }
 */
export interface InteractionStats {
  likeCount?: number;
  commentCount?: number;
  favoriteCount?: number;
  // 分享计数（仅提供类型定义，不提供具体实现）
  shareCount?: number;
}
