"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoriteRepository = void 0;
const firestore_1 = require("firebase-admin/firestore");
const config_1 = require("../config");
/**
 * 收藏仓储实现
 * 存储路径: {collectionName}/{userId}/{subCollectionPrefix}{targetCollection}/{targetId}
 */
class FavoriteRepository {
    db;
    collectionName;
    subCollectionPrefix;
    constructor(db, collectionName = config_1.DEFAULT_COLLECTION_NAMES.favorites, subCollectionPrefix = config_1.DEFAULT_COLLECTION_NAMES.favoriteSubCollectionPrefix) {
        this.db = db;
        this.collectionName = collectionName;
        this.subCollectionPrefix = subCollectionPrefix;
    }
    /**
     * 获取子集合名称
     */
    getSubCollectionName(targetCollection) {
        return `${this.subCollectionPrefix}${targetCollection}`;
    }
    async favorite(targetCollection, targetId, userId) {
        const targetRef = this.db
            .collection(targetCollection)
            .doc(targetId);
        const favoriteRef = this.db
            .collection(this.collectionName)
            .doc(userId)
            .collection(this.getSubCollectionName(targetCollection))
            .doc(targetId);
        const favorite = {
            userId,
            targetCollection,
            targetId,
            createdAt: firestore_1.Timestamp.now(),
        };
        const updateTarget = {
            favoriteCount: firestore_1.FieldValue.increment(1),
        };
        await this.db.runTransaction(async (tx) => {
            const favoriteDoc = await tx.get(favoriteRef);
            if (favoriteDoc.exists) {
                return; // 幂等：已收藏则跳过
            }
            tx.set(favoriteRef, favorite);
            tx.update(targetRef, updateTarget);
        });
    }
    async unfavorite(targetCollection, targetId, userId) {
        const targetRef = this.db
            .collection(targetCollection)
            .doc(targetId);
        const favoriteRef = this.db
            .collection(this.collectionName)
            .doc(userId)
            .collection(this.getSubCollectionName(targetCollection))
            .doc(targetId);
        const updateTarget = {
            favoriteCount: firestore_1.FieldValue.increment(-1),
        };
        await this.db.runTransaction(async (tx) => {
            const favoriteDoc = await tx.get(favoriteRef);
            if (!favoriteDoc.exists) {
                return; // 幂等：未收藏则跳过
            }
            tx.delete(favoriteRef);
            tx.update(targetRef, updateTarget);
        });
    }
    async isFavorited(targetCollection, targetId, userId) {
        const favoriteDoc = await this.db
            .collection(this.collectionName)
            .doc(userId)
            .collection(this.getSubCollectionName(targetCollection))
            .doc(targetId)
            .get();
        return favoriteDoc.exists;
    }
    async getUserFavorites(userId, targetCollection, limit = 20, startAfter) {
        let query = this.db
            .collection(this.collectionName)
            .doc(userId)
            .collection(this.getSubCollectionName(targetCollection))
            .orderBy("createdAt", "desc")
            .limit(limit);
        if (startAfter) {
            query = query.startAfter(startAfter);
        }
        const snapshot = await query.get();
        return snapshot.docs.map((doc) => doc.data());
    }
    async batchIsFavorited(targetCollection, targetIds, userId) {
        if (targetIds.length > config_1.BATCH_LIMIT) {
            throw new Error(`targetIds length exceeds limit of ${config_1.BATCH_LIMIT}`);
        }
        const result = new Map();
        if (targetIds.length === 0) {
            return result;
        }
        const subCollectionName = this.getSubCollectionName(targetCollection);
        const refs = targetIds.map((targetId) => this.db
            .collection(this.collectionName)
            .doc(userId)
            .collection(subCollectionName)
            .doc(targetId));
        const docs = await this.db.getAll(...refs);
        targetIds.forEach((targetId, index) => {
            result.set(targetId, docs[index].exists);
        });
        return result;
    }
}
exports.FavoriteRepository = FavoriteRepository;
