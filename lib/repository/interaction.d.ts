import { Firestore, Timestamp } from "firebase-admin/firestore";
import type { Comment, Favorite, Like } from "../types";
import type { IInteractionRepository, InteractionCollectionNames } from "./interaction.interface";
/**
 * 互动功能仓储实现（组合三个子仓储）
 */
export declare class InteractionRepository implements IInteractionRepository {
    private readonly likeRepo;
    private readonly commentRepo;
    private readonly favoriteRepo;
    /**
     * @param db Firestore 实例
     * @param collectionNames 可选，自定义集合名称
     */
    constructor(db: Firestore, collectionNames?: InteractionCollectionNames);
    like(targetCollection: string, targetId: string, userId: string): Promise<void>;
    unlike(targetCollection: string, targetId: string, userId: string): Promise<void>;
    isLiked(targetCollection: string, targetId: string, userId: string): Promise<boolean>;
    getLikes(targetCollection: string, targetId: string, limit?: number, startAfter?: Timestamp): Promise<Like[]>;
    batchIsLiked(targetCollection: string, targetIds: string[], userId: string): Promise<Map<string, boolean>>;
    getUserLikes(userId: string, targetCollection?: string, limit?: number, startAfter?: Timestamp): Promise<Like[]>;
    addComment(targetCollection: string, targetId: string, userId: string, content: string): Promise<Comment>;
    updateComment(targetCollection: string, targetId: string, commentId: string, userId: string, content: string): Promise<void>;
    deleteComment(targetCollection: string, targetId: string, commentId: string): Promise<void>;
    getComments(targetCollection: string, targetId: string, limit?: number, startAfter?: Timestamp): Promise<Comment[]>;
    getComment(targetCollection: string, targetId: string, commentId: string): Promise<Comment | null>;
    getUserComments(userId: string, targetCollection?: string, limit?: number, startAfter?: Timestamp): Promise<Comment[]>;
    favorite(targetCollection: string, targetId: string, userId: string): Promise<void>;
    unfavorite(targetCollection: string, targetId: string, userId: string): Promise<void>;
    isFavorited(targetCollection: string, targetId: string, userId: string): Promise<boolean>;
    getUserFavorites(userId: string, targetCollection: string, limit?: number, startAfter?: Timestamp): Promise<Favorite[]>;
    batchIsFavorited(targetCollection: string, targetIds: string[], userId: string): Promise<Map<string, boolean>>;
}
