import type { Timestamp } from "firebase-admin/firestore";
import type { Favorite } from "../types";
/**
 * 收藏仓储接口
 */
export interface IFavoriteRepository {
    /**
     * 收藏
     * @param targetCollection 目标集合名
     * @param targetId 目标文档ID
     * @param userId 用户ID
     */
    favorite(targetCollection: string, targetId: string, userId: string): Promise<void>;
    /**
     * 取消收藏
     * @param targetCollection 目标集合名
     * @param targetId 目标文档ID
     * @param userId 用户ID
     */
    unfavorite(targetCollection: string, targetId: string, userId: string): Promise<void>;
    /**
     * 检查是否已收藏
     * @param targetCollection 目标集合名
     * @param targetId 目标文档ID
     * @param userId 用户ID
     */
    isFavorited(targetCollection: string, targetId: string, userId: string): Promise<boolean>;
    /**
     * 获取用户的收藏列表
     * @param userId 用户ID
     * @param targetCollection 目标集合名称
     * @param limit 每页数量
     * @param startAfter 分页游标，上一页最后一条的 createdAt
     */
    getUserFavorites(userId: string, targetCollection: string, limit?: number, startAfter?: Timestamp): Promise<Favorite[]>;
    /**
     * 批量检查是否已收藏
     * @param targetCollection 目标集合名
     * @param targetIds 目标文档ID列表
     * @param userId 用户ID
     * @returns Map<targetId, isFavorited>
     * @throws Error if targetIds.length > 100
     */
    batchIsFavorited(targetCollection: string, targetIds: string[], userId: string): Promise<Map<string, boolean>>;
}
