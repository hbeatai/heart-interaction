import type { Timestamp } from "firebase-admin/firestore";
/**
 * 评论文档（数据库真实结构）
 * 存储路径: {targetCollection}/{targetId}/comments/{commentId}
 */
export interface CommentData {
    userId: string;
    targetCollection: string;
    targetId: string;
    content: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    /** 排序/索引字段，删除此字段即为软删除 */
    indexedAt?: Timestamp;
}
/**
 * 评论（接口返回结构）
 */
export interface Comment {
    id: string;
    userId: string;
    targetCollection: string;
    targetId: string;
    content: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
