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
   * @param content 评论内容
   */
  updateComment(
    targetCollection: string,
    targetId: string,
    commentId: string,
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
}
