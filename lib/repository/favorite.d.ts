import { Firestore, Timestamp } from "firebase-admin/firestore";
import type { Favorite } from "../types";
import type { IFavoriteRepository } from "./favorite.interface";
/**
 * 收藏仓储实现
 * 存储路径: {collectionName}/{userId}/{subCollectionPrefix}{targetCollection}/{targetId}
 */
export declare class FavoriteRepository implements IFavoriteRepository {
    private db;
    private readonly collectionName;
    private readonly subCollectionPrefix;
    constructor(db: Firestore, collectionName?: string, subCollectionPrefix?: string);
    /**
     * 获取子集合名称
     */
    private getSubCollectionName;
    favorite(targetCollection: string, targetId: string, userId: string): Promise<void>;
    unfavorite(targetCollection: string, targetId: string, userId: string): Promise<void>;
    isFavorited(targetCollection: string, targetId: string, userId: string): Promise<Favorite | null>;
    getUserFavorites(userId: string, targetCollection: string, limit?: number, startAfter?: Timestamp): Promise<Favorite[]>;
    batchIsFavorited(targetCollection: string, targetIds: string[], userId: string): Promise<Map<string, Favorite | null>>;
}
