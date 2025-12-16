import { Firestore, Timestamp } from "firebase-admin/firestore";
import type { Like } from "../types";
import type { ILikeRepository } from "./like.interface";
/**
 * 点赞仓储实现
 */
export declare class LikeRepository implements ILikeRepository {
    private db;
    private readonly subCollectionName;
    constructor(db: Firestore, subCollectionName?: string);
    like(targetCollection: string, targetId: string, userId: string): Promise<void>;
    unlike(targetCollection: string, targetId: string, userId: string): Promise<void>;
    isLiked(targetCollection: string, targetId: string, userId: string): Promise<boolean>;
    getLikes(targetCollection: string, targetId: string, limit?: number, startAfter?: Timestamp): Promise<Like[]>;
    batchIsLiked(targetCollection: string, targetIds: string[], userId: string): Promise<Map<string, boolean>>;
    getUserLikes(userId: string, targetCollection?: string, limit?: number, startAfter?: Timestamp): Promise<Like[]>;
}
