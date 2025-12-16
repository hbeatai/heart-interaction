import type {Timestamp} from "firebase-admin/firestore";
import type {Like} from "../types";

/**
 * 点赞仓储接口
 */
export interface ILikeRepository {
  /**
   * 点赞
   * @param targetCollection 目标集合名，如 "character_card"
   * @param targetId 目标文档ID
   * @param userId 用户ID
   */
  like(targetCollection: string, targetId: string, userId: string): Promise<void>;

  /**
   * 取消点赞
   * @param targetCollection 目标集合名
   * @param targetId 目标文档ID
   * @param userId 用户ID
   */
  unlike(targetCollection: string, targetId: string, userId: string): Promise<void>;

  /**
   * 检查是否已点赞
   * @param targetCollection 目标集合名
   * @param targetId 目标文档ID
   * @param userId 用户ID
   */
  isLiked(targetCollection: string, targetId: string, userId: string): Promise<boolean>;

  /**
   * 获取点赞列表
   * @param targetCollection 目标集合名
   * @param targetId 目标文档ID
   * @param limit 每页数量
   * @param startAfter 分页游标，上一页最后一条的 createdAt
   */
  getLikes(
    targetCollection: string,
    targetId: string,
    limit?: number,
    startAfter?: Timestamp
  ): Promise<Like[]>;

  /**
   * 批量检查是否已点赞
   * @param targetCollection 目标集合名
   * @param targetIds 目标文档ID列表
   * @param userId 用户ID
   * @returns Map<targetId, isLiked>
   * @throws Error if targetIds.length > 100
   */
  batchIsLiked(
    targetCollection: string,
    targetIds: string[],
    userId: string
  ): Promise<Map<string, boolean>>;

  /**
   * 获取用户点赞过的内容列表
   *
   * ⚠️ 需要 Firestore 复合索引，详见 [README](../../README.md#firestore-索引配置)
   *
   * @param userId 用户ID
   * @param targetCollection 可选，筛选特定目标集合
   * @param limit 每页数量
   * @param startAfter 分页游标，上一页最后一条的 createdAt
   */
  getUserLikes(
    userId: string,
    targetCollection?: string,
    limit?: number,
    startAfter?: Timestamp
  ): Promise<Like[]>;
}
