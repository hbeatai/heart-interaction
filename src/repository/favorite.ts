import {FieldValue, Firestore, Timestamp, UpdateData} from "firebase-admin/firestore";
import {BATCH_LIMIT, DEFAULT_COLLECTION_NAMES} from "../config";
import type {Favorite, InteractionStats} from "../types";
import type {IFavoriteRepository} from "./favorite.interface";

/**
 * 收藏仓储实现
 * 存储路径: {collectionName}/{userId}/{subCollectionPrefix}{targetCollection}/{targetId}
 */
export class FavoriteRepository implements IFavoriteRepository {
  constructor(
    private db: Firestore,
    private readonly collectionName: string = DEFAULT_COLLECTION_NAMES.favorites,
    private readonly subCollectionPrefix: string = DEFAULT_COLLECTION_NAMES.favoriteSubCollectionPrefix
  ) {}

  /**
   * 获取子集合名称
   */
  private getSubCollectionName(targetCollection: string): string {
    return `${this.subCollectionPrefix}${targetCollection}`;
  }

  async favorite(
    targetCollection: string,
    targetId: string,
    userId: string
  ): Promise<void> {
    const targetRef = this.db
      .collection(targetCollection)
      .doc(targetId);
    const favoriteRef = this.db
      .collection(this.collectionName)
      .doc(userId)
      .collection(this.getSubCollectionName(targetCollection))
      .doc(targetId);

    const favorite: Favorite = {
      userId,
      targetCollection,
      targetId,
      createdAt: Timestamp.now(),
    };
    const updateTarget: UpdateData<InteractionStats> = {
      favoriteCount: FieldValue.increment(1),
    };

    await this.db.runTransaction(async (tx) => {
      const [targetDoc, favoriteDoc] = await Promise.all([
        tx.get(targetRef),
        tx.get(favoriteRef),
      ]);

      if (!targetDoc.exists) {
        throw new Error(`Target document not found: ${targetCollection}/${targetId}`);
      }

      if (favoriteDoc.exists) {
        return; // 幂等：已收藏则跳过
      }

      tx.set(favoriteRef, favorite);

      tx.update(targetRef, updateTarget);
    });
  }

  async unfavorite(
    targetCollection: string,
    targetId: string,
    userId: string
  ): Promise<void> {
    const targetRef = this.db
      .collection(targetCollection)
      .doc(targetId);
    const favoriteRef = this.db
      .collection(this.collectionName)
      .doc(userId)
      .collection(this.getSubCollectionName(targetCollection))
      .doc(targetId);

    const updateTarget: UpdateData<InteractionStats> = {
      favoriteCount: FieldValue.increment(-1),
    };

    await this.db.runTransaction(async (tx) => {
      const [targetDoc, favoriteDoc] = await Promise.all([
        tx.get(targetRef),
        tx.get(favoriteRef),
      ]);

      if (!targetDoc.exists) {
        throw new Error(`Target document not found: ${targetCollection}/${targetId}`);
      }

      if (!favoriteDoc.exists) {
        return; // 幂等：未收藏则跳过
      }

      tx.delete(favoriteRef);

      tx.update(targetRef, updateTarget);
    });
  }

  async isFavorited(
    targetCollection: string,
    targetId: string,
    userId: string
  ): Promise<Favorite | null> {
    const favoriteDoc = await this.db
      .collection(this.collectionName)
      .doc(userId)
      .collection(this.getSubCollectionName(targetCollection))
      .doc(targetId)
      .get();
    if (!favoriteDoc.exists) {
      return null;
    }

    return favoriteDoc.data() as Favorite;
  }

  async getUserFavorites(
    userId: string,
    targetCollection: string,
    limit: number = 20,
    startAfter?: Timestamp
  ): Promise<Favorite[]> {
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
    return snapshot.docs.map((doc) => doc.data() as Favorite);
  }

  async batchIsFavorited(
    targetCollection: string,
    targetIds: string[],
    userId: string
  ): Promise<Map<string, Favorite | null>> {
    if (targetIds.length > BATCH_LIMIT) {
      throw new Error(`targetIds length exceeds limit of ${BATCH_LIMIT}`);
    }

    const result = new Map<string, Favorite | null>();

    if (targetIds.length === 0) {
      return result;
    }

    const subCollectionName = this.getSubCollectionName(targetCollection);
    const refs = targetIds.map((targetId) =>
      this.db
        .collection(this.collectionName)
        .doc(userId)
        .collection(subCollectionName)
        .doc(targetId)
    );

    const docs = await this.db.getAll(...refs);

    targetIds.forEach((targetId, index) => {
      const doc = docs[index];
      if (!doc.exists) {
        result.set(targetId, null);
      } else {
        result.set(targetId, doc.data() as Favorite);
      }
    });

    return result;
  }
}
