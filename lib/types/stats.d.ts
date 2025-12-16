/**
 * 互动统计字段
 * 目标对象继承 InteractionStats 即可
 *
 * @example
 * interface CharacterCard extends InteractionStats {
 *   id: string;
 *   name: string;
 *   // likeCount, commentCount, favoriteCount 已包含
 * }
 */
export interface InteractionStats {
    likeCount: number;
    commentCount: number;
    favoriteCount: number;
}
