"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikeRepository = void 0;
const firestore_1 = require("firebase-admin/firestore");
const config_1 = require("../config");
/**
 * 点赞仓储实现
 */
class LikeRepository {
    db;
    subCollectionName;
    constructor(db, subCollectionName = config_1.DEFAULT_COLLECTION_NAMES.likes) {
        this.db = db;
        this.subCollectionName = subCollectionName;
    }
    async like(targetCollection, targetId, userId) {
        const targetRef = this.db
            .collection(targetCollection)
            .doc(targetId);
        const likeRef = targetRef
            .collection(this.subCollectionName)
            .doc(userId);
        const like = {
            userId,
            targetCollection,
            targetId,
            createdAt: firestore_1.Timestamp.now(),
        };
        const updateTarget = {
            likeCount: firestore_1.FieldValue.increment(1),
        };
        await this.db.runTransaction(async (tx) => {
            const likeDoc = await tx.get(likeRef);
            if (likeDoc.exists) {
                return; // 幂等：已点赞则跳过
            }
            tx.set(likeRef, like);
            tx.update(targetRef, updateTarget);
        });
    }
    async unlike(targetCollection, targetId, userId) {
        const targetRef = this.db
            .collection(targetCollection)
            .doc(targetId);
        const likeRef = targetRef
            .collection(this.subCollectionName)
            .doc(userId);
        const updateTarget = {
            likeCount: firestore_1.FieldValue.increment(-1),
        };
        await this.db.runTransaction(async (tx) => {
            const likeDoc = await tx.get(likeRef);
            if (!likeDoc.exists) {
                return; // 幂等：未点赞则跳过
            }
            tx.delete(likeRef);
            tx.update(targetRef, updateTarget);
        });
    }
    async isLiked(targetCollection, targetId, userId) {
        const likeDoc = await this.db
            .collection(targetCollection)
            .doc(targetId)
            .collection(this.subCollectionName)
            .doc(userId)
            .get();
        return likeDoc.exists;
    }
    async getLikes(targetCollection, targetId, limit = 20, startAfter) {
        let query = this.db
            .collection(targetCollection)
            .doc(targetId)
            .collection(this.subCollectionName)
            .orderBy("createdAt", "desc")
            .limit(limit);
        if (startAfter) {
            query = query.startAfter(startAfter);
        }
        const snapshot = await query.get();
        return snapshot.docs.map((doc) => doc.data());
    }
    async batchIsLiked(targetCollection, targetIds, userId) {
        if (targetIds.length > config_1.BATCH_LIMIT) {
            throw new Error(`targetIds length exceeds limit of ${config_1.BATCH_LIMIT}`);
        }
        const result = new Map();
        if (targetIds.length === 0) {
            return result;
        }
        const refs = targetIds.map((targetId) => this.db
            .collection(targetCollection)
            .doc(targetId)
            .collection(this.subCollectionName)
            .doc(userId));
        const docs = await this.db.getAll(...refs);
        targetIds.forEach((targetId, index) => {
            result.set(targetId, docs[index].exists);
        });
        return result;
    }
}
exports.LikeRepository = LikeRepository;
