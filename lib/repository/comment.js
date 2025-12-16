"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentRepository = void 0;
const firestore_1 = require("firebase-admin/firestore");
const config_1 = require("../config");
/**
 * 评论仓储实现
 */
class CommentRepository {
    db;
    subCollectionName;
    constructor(db, subCollectionName = config_1.DEFAULT_COLLECTION_NAMES.comments) {
        this.db = db;
        this.subCollectionName = subCollectionName;
    }
    async addComment(targetCollection, targetId, userId, content) {
        const targetRef = this.db
            .collection(targetCollection)
            .doc(targetId);
        const commentRef = targetRef
            .collection(this.subCollectionName)
            .doc();
        const now = firestore_1.Timestamp.now();
        const commentData = {
            userId,
            targetCollection,
            targetId,
            content,
            createdAt: now,
            updatedAt: now,
            indexedAt: now,
        };
        const updateTarget = {
            commentCount: firestore_1.FieldValue.increment(1),
        };
        await this.db.runTransaction(async (tx) => {
            const targetDoc = await tx.get(targetRef);
            if (!targetDoc.exists) {
                throw new Error(`Target document not found: ${targetCollection}/${targetId}`);
            }
            tx.set(commentRef, commentData);
            tx.update(targetRef, updateTarget);
        });
        const { indexedAt: _, ...rest } = commentData;
        return { id: commentRef.id, ...rest };
    }
    async updateComment(targetCollection, targetId, commentId, userId, content) {
        const commentRef = this.db
            .collection(targetCollection)
            .doc(targetId)
            .collection(this.subCollectionName)
            .doc(commentId);
        const updateComment = {
            content,
            updatedAt: firestore_1.Timestamp.now(),
        };
        await this.db.runTransaction(async (tx) => {
            const commentDoc = await tx.get(commentRef);
            if (!commentDoc.exists) {
                throw new Error(`Comment not found: ${targetCollection}/${targetId}/comments/${commentId}`);
            }
            const data = commentDoc.data();
            if (!data.indexedAt) {
                throw new Error(`Comment already deleted: ${targetCollection}/${targetId}/comments/${commentId}`);
            }
            if (data.userId !== userId) {
                throw new Error(`Permission denied: user ${userId} cannot update comment owned by ${data.userId}`);
            }
            tx.update(commentRef, updateComment);
        });
    }
    async deleteComment(targetCollection, targetId, commentId) {
        const targetRef = this.db
            .collection(targetCollection)
            .doc(targetId);
        const commentRef = targetRef
            .collection(this.subCollectionName)
            .doc(commentId);
        const updateComment = {
            indexedAt: firestore_1.FieldValue.delete(),
            updatedAt: firestore_1.Timestamp.now(),
        };
        const updateTarget = {
            commentCount: firestore_1.FieldValue.increment(-1),
        };
        await this.db.runTransaction(async (tx) => {
            const [targetDoc, commentDoc] = await Promise.all([
                tx.get(targetRef),
                tx.get(commentRef),
            ]);
            if (!targetDoc.exists) {
                throw new Error(`Target document not found: ${targetCollection}/${targetId}`);
            }
            if (!commentDoc.exists) {
                return; // 幂等：不存在则跳过
            }
            const data = commentDoc.data();
            if (!data.indexedAt) {
                return; // 幂等：已删除则跳过
            }
            tx.update(commentRef, updateComment);
            tx.update(targetRef, updateTarget);
        });
    }
    async getComments(targetCollection, targetId, limit = 20, startAfter) {
        let query = this.db
            .collection(targetCollection)
            .doc(targetId)
            .collection(this.subCollectionName)
            .orderBy("indexedAt", "desc")
            .limit(limit);
        if (startAfter) {
            query = query.startAfter(startAfter);
        }
        const snapshot = await query.get();
        return snapshot.docs.map((doc) => {
            const { indexedAt: _, ...rest } = doc.data();
            return { id: doc.id, ...rest };
        });
    }
    async getComment(targetCollection, targetId, commentId) {
        const doc = await this.db
            .collection(targetCollection)
            .doc(targetId)
            .collection(this.subCollectionName)
            .doc(commentId)
            .get();
        if (!doc.exists) {
            return null;
        }
        const data = doc.data();
        if (!data.indexedAt) {
            return null; // 已软删除
        }
        const { indexedAt: _, ...rest } = data;
        return { id: doc.id, ...rest };
    }
    async getUserComments(userId, targetCollection, limit = 20, startAfter) {
        let query = this.db
            .collectionGroup(this.subCollectionName)
            .where("userId", "==", userId)
            .orderBy("indexedAt", "desc")
            .limit(limit);
        if (targetCollection) {
            query = query.where("targetCollection", "==", targetCollection);
        }
        if (startAfter) {
            query = query.startAfter(startAfter);
        }
        const snapshot = await query.get();
        return snapshot.docs.map((doc) => {
            const { indexedAt: _, ...rest } = doc.data();
            return { id: doc.id, ...rest };
        });
    }
}
exports.CommentRepository = CommentRepository;
