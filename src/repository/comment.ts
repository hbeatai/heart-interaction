import {FieldValue, Firestore, Timestamp, UpdateData} from "firebase-admin/firestore";
import {DEFAULT_COLLECTION_NAMES} from "../config";
import type {Comment, CommentData, InteractionStats} from "../types";
import type {ICommentRepository} from "./comment.interface";

/**
 * 评论仓储实现
 */
export class CommentRepository implements ICommentRepository {
  constructor(
    private db: Firestore,
    private readonly subCollectionName: string = DEFAULT_COLLECTION_NAMES.comments
  ) {}

  async addComment(
    targetCollection: string,
    targetId: string,
    userId: string,
    content: string
  ): Promise<Comment> {
    const targetRef = this.db
      .collection(targetCollection)
      .doc(targetId);
    const commentRef = targetRef
      .collection(this.subCollectionName)
      .doc();

    const now = Timestamp.now();
    const commentData: CommentData = {
      userId,
      targetCollection,
      targetId,
      content,
      createdAt: now,
      updatedAt: now,
      indexedAt: now,
    };

    const updateTarget: UpdateData<InteractionStats> = {
      commentCount: FieldValue.increment(1),
    };

    await this.db.runTransaction(async (tx) => {
      const targetDoc = await tx.get(targetRef);
      if (!targetDoc.exists) {
        throw new Error(`Target document not found: ${targetCollection}/${targetId}`);
      }

      tx.set(commentRef, commentData);

      tx.update(targetRef, updateTarget);
    });

    const {indexedAt: _, ...rest} = commentData;
    return {id: commentRef.id, ...rest} as Comment;
  }

  async updateComment(
    targetCollection: string,
    targetId: string,
    commentId: string,
    userId: string,
    content: string
  ): Promise<void> {
    const commentRef = this.db
      .collection(targetCollection)
      .doc(targetId)
      .collection(this.subCollectionName)
      .doc(commentId);

    const updateComment: UpdateData<CommentData> = {
      content,
      updatedAt: Timestamp.now(),
    };

    await this.db.runTransaction(async (tx) => {
      const commentDoc = await tx.get(commentRef);
      if (!commentDoc.exists) {
        throw new Error(`Comment not found: ${targetCollection}/${targetId}/comments/${commentId}`);
      }

      const data = commentDoc.data() as CommentData;
      if (!data.indexedAt) {
        throw new Error(`Comment already deleted: ${targetCollection}/${targetId}/comments/${commentId}`);
      }

      if (data.userId !== userId) {
        throw new Error(`Permission denied: user ${userId} cannot update comment owned by ${data.userId}`);
      }

      tx.update(commentRef, updateComment);
    });
  }

  async deleteComment(
    targetCollection: string,
    targetId: string,
    commentId: string
  ): Promise<void> {
    const targetRef = this.db
      .collection(targetCollection)
      .doc(targetId);
    const commentRef = targetRef
      .collection(this.subCollectionName)
      .doc(commentId);

    const updateComment: UpdateData<CommentData> = {
      indexedAt: FieldValue.delete(),
      updatedAt: Timestamp.now(),
    };
    const updateTarget: UpdateData<InteractionStats> = {
      commentCount: FieldValue.increment(-1),
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

      const data = commentDoc.data() as CommentData;
      if (!data.indexedAt) {
        return; // 幂等：已删除则跳过
      }

      tx.update(commentRef, updateComment);

      tx.update(targetRef, updateTarget);
    });
  }

  async getComments(
    targetCollection: string,
    targetId: string,
    limit: number = 20,
    startAfter?: Timestamp
  ): Promise<Comment[]> {
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
      const {indexedAt: _, ...rest} = doc.data() as CommentData;
      return {id: doc.id, ...rest} as Comment;
    });
  }

  async getComment(
    targetCollection: string,
    targetId: string,
    commentId: string
  ): Promise<Comment | null> {
    const doc = await this.db
      .collection(targetCollection)
      .doc(targetId)
      .collection(this.subCollectionName)
      .doc(commentId)
      .get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data() as CommentData;
    if (!data.indexedAt) {
      return null; // 已软删除
    }

    const {indexedAt: _, ...rest} = data;
    return {id: doc.id, ...rest} as Comment;
  }

  async getUserComments(
    userId: string,
    targetCollection?: string,
    limit: number = 20,
    startAfter?: Timestamp
  ): Promise<Comment[]> {
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
      const {indexedAt: _, ...rest} = doc.data() as CommentData;
      return {id: doc.id, ...rest} as Comment;
    });
  }
}
