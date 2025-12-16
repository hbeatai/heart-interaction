import {FieldValue, Firestore, Timestamp, UpdateData} from "firebase-admin/firestore";
import {BATCH_LIMIT, DEFAULT_COLLECTION_NAMES} from "../config";
import type {InteractionStats, Like} from "../types";
import type {ILikeRepository} from "./like.interface";

/**
 * 点赞仓储实现
 */
export class LikeRepository implements ILikeRepository {
  constructor(
    private db: Firestore,
    private readonly subCollectionName: string = DEFAULT_COLLECTION_NAMES.likes
  ) {}

  async like(
    targetCollection: string,
    targetId: string,
    userId: string
  ): Promise<void> {
    const targetRef = this.db
      .collection(targetCollection)
      .doc(targetId);
    const likeRef = targetRef
      .collection(this.subCollectionName)
      .doc(userId);

    const like: Like = {
      userId,
      targetCollection,
      targetId,
      createdAt: Timestamp.now(),
    };
    const updateTarget: UpdateData<InteractionStats> = {
      likeCount: FieldValue.increment(1),
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

  async unlike(
    targetCollection: string,
    targetId: string,
    userId: string
  ): Promise<void> {
    const targetRef = this.db
      .collection(targetCollection)
      .doc(targetId);
    const likeRef = targetRef
      .collection(this.subCollectionName)
      .doc(userId);

    const updateTarget: UpdateData<InteractionStats> = {
      likeCount: FieldValue.increment(-1),
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

  async isLiked(
    targetCollection: string,
    targetId: string,
    userId: string
  ): Promise<boolean> {
    const likeDoc = await this.db
      .collection(targetCollection)
      .doc(targetId)
      .collection(this.subCollectionName)
      .doc(userId)
      .get();
    return likeDoc.exists;
  }

  async getLikes(
    targetCollection: string,
    targetId: string,
    limit: number = 20,
    startAfter?: Timestamp
  ): Promise<Like[]> {
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
    return snapshot.docs.map((doc) => doc.data() as Like);
  }

  async batchIsLiked(
    targetCollection: string,
    targetIds: string[],
    userId: string
  ): Promise<Map<string, boolean>> {
    if (targetIds.length > BATCH_LIMIT) {
      throw new Error(`targetIds length exceeds limit of ${BATCH_LIMIT}`);
    }

    const result = new Map<string, boolean>();

    if (targetIds.length === 0) {
      return result;
    }

    const refs = targetIds.map((targetId) =>
      this.db
        .collection(targetCollection)
        .doc(targetId)
        .collection(this.subCollectionName)
        .doc(userId)
    );

    const docs = await this.db.getAll(...refs);

    targetIds.forEach((targetId, index) => {
      result.set(targetId, docs[index].exists);
    });

    return result;
  }

  async getUserLikes(
    userId: string,
    targetCollection?: string,
    limit: number = 20,
    startAfter?: Timestamp
  ): Promise<Like[]> {
    let query = this.db
      .collectionGroup(this.subCollectionName)
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit);

    if (targetCollection) {
      query = query.where("targetCollection", "==", targetCollection);
    }

    if (startAfter) {
      query = query.startAfter(startAfter);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data() as Like);
  }
}
