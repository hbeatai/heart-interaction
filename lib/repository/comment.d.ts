import { Firestore, Timestamp } from "firebase-admin/firestore";
import type { Comment } from "../types";
import type { ICommentRepository } from "./comment.interface";
/**
 * 评论仓储实现
 */
export declare class CommentRepository implements ICommentRepository {
    private db;
    private readonly subCollectionName;
    constructor(db: Firestore, subCollectionName?: string);
    addComment(targetCollection: string, targetId: string, userId: string, content: string): Promise<Comment>;
    updateComment(targetCollection: string, targetId: string, commentId: string, userId: string, content: string): Promise<void>;
    deleteComment(targetCollection: string, targetId: string, commentId: string): Promise<void>;
    getComments(targetCollection: string, targetId: string, limit?: number, startAfter?: Timestamp): Promise<Comment[]>;
    getComment(targetCollection: string, targetId: string, commentId: string): Promise<Comment | null>;
    getUserComments(userId: string, targetCollection?: string, limit?: number, startAfter?: Timestamp): Promise<Comment[]>;
}
