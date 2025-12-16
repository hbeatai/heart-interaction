import type {Timestamp} from "firebase-admin/firestore";
import type {Comment} from "../types";

/**
 * 评论仓储接口
 */
export interface ICommentRepository {
  /**
   * 添加评论
   * @param targetCollection 目标集合名
   * @param targetId 目标文档ID
   * @param userId 用户ID
   * @param content 评论内容
   */
  addComment(
    targetCollection: string,
    targetId: string,
    userId: string,
    content: string
  ): Promise<Comment>;

  /**
   * 更新评论
   * @param targetCollection 目标集合名
   * @param targetId 目标文档ID
   * @param commentId 评论ID
   * @param userId 用户ID（用于权限校验）
   * @param content 评论内容
   * @throws Error 评论不存在、已删除或无权限时抛出错误
   */
  updateComment(
    targetCollection: string,
    targetId: string,
    commentId: string,
    userId: string,
    content: string
  ): Promise<void>;

  /**
   * 删除评论
   * @param targetCollection 目标集合名
   * @param targetId 目标文档ID
   * @param commentId 评论ID
   */
  deleteComment(
    targetCollection: string,
    targetId: string,
    commentId: string
  ): Promise<void>;

  /**
   * 获取评论列表
   * @param targetCollection 目标集合名
   * @param targetId 目标文档ID
   * @param limit 每页数量
   * @param startAfter 分页游标，上一页最后一条的 indexedAt
   */
  getComments(
    targetCollection: string,
    targetId: string,
    limit?: number,
    startAfter?: Timestamp
  ): Promise<Comment[]>;

  /**
   * 获取单条评论
   * @param targetCollection 目标集合名
   * @param targetId 目标文档ID
   * @param commentId 评论ID
   */
  getComment(
    targetCollection: string,
    targetId: string,
    commentId: string
  ): Promise<Comment | null>;

  /**
   * 获取用户发表过的评论列表
   *
   * ⚠️ 需要 Firestore 复合索引，详见 [README](../../README.md#firestore-索引配置)
   *
   * @param userId 用户ID
   * @param targetCollection 可选，筛选特定目标集合
   * @param limit 每页数量
   * @param startAfter 分页游标，上一页最后一条的 indexedAt
   */
  getUserComments(
    userId: string,
    targetCollection?: string,
    limit?: number,
    startAfter?: Timestamp
  ): Promise<Comment[]>;
}
