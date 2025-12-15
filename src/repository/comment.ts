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
    content: string
  ): Promise<void> {
    await this.db
      .collection(targetCollection)
      .doc(targetId)
      .collection(this.subCollectionName)
      .doc(commentId)
      .update({
        content,
        updatedAt: Timestamp.now(),
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
    }
    const updateTarget: UpdateData<InteractionStats> = {
      commentCount: FieldValue.increment(-1),
    };

    await this.db.runTransaction(async (tx) => {
      const commentDb = await tx.get(commentRef);
      if (!commentDb.exists) {
        return; // 幂等：不存在则跳过
      }

      const data = commentDb.data() as CommentData;
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
}
