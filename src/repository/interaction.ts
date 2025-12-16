import {Firestore, Timestamp} from "firebase-admin/firestore";
import {DEFAULT_COLLECTION_NAMES} from "../config";
import type {Comment, Favorite, Like} from "../types";
import {CommentRepository} from "./comment";
import {FavoriteRepository} from "./favorite";
import type {IInteractionRepository, InteractionCollectionNames} from "./interaction.interface";
import {LikeRepository} from "./like";

/**
 * 互动功能仓储实现（组合三个子仓储）
 */
export class InteractionRepository implements IInteractionRepository {
  private readonly likeRepo: LikeRepository;
  private readonly commentRepo: CommentRepository;
  private readonly favoriteRepo: FavoriteRepository;

  /**
   * @param db Firestore 实例
   * @param collectionNames 可选，自定义集合名称
   */
  constructor(db: Firestore, collectionNames?: InteractionCollectionNames) {
    const names = {...DEFAULT_COLLECTION_NAMES, ...collectionNames};
    this.likeRepo = new LikeRepository(db, names.likes);
    this.commentRepo = new CommentRepository(db, names.comments);
    this.favoriteRepo = new FavoriteRepository(db, names.favorites, names.favoriteSubCollectionPrefix);
  }

  // ==================== 点赞 ====================

  like(
    targetCollection: string,
    targetId: string,
    userId: string
  ): Promise<void> {
    return this.likeRepo.like(targetCollection, targetId, userId);
  }

  unlike(
    targetCollection: string,
    targetId: string,
    userId: string
  ): Promise<void> {
    return this.likeRepo.unlike(targetCollection, targetId, userId);
  }

  isLiked(
    targetCollection: string,
    targetId: string,
    userId: string
  ): Promise<boolean> {
    return this.likeRepo.isLiked(targetCollection, targetId, userId);
  }

  getLikes(
    targetCollection: string,
    targetId: string,
    limit?: number,
    startAfter?: Timestamp
  ): Promise<Like[]> {
    return this.likeRepo.getLikes(targetCollection, targetId, limit, startAfter);
  }

  batchIsLiked(
    targetCollection: string,
    targetIds: string[],
    userId: string
  ): Promise<Map<string, boolean>> {
    return this.likeRepo.batchIsLiked(targetCollection, targetIds, userId);
  }

  getUserLikes(
    userId: string,
    targetCollection?: string,
    limit?: number,
    startAfter?: Timestamp
  ): Promise<Like[]> {
    return this.likeRepo.getUserLikes(userId, targetCollection, limit, startAfter);
  }

  // ==================== 评论 ====================

  addComment(
    targetCollection: string,
    targetId: string,
    userId: string,
    content: string
  ): Promise<Comment> {
    return this.commentRepo.addComment(targetCollection, targetId, userId, content);
  }

  updateComment(
    targetCollection: string,
    targetId: string,
    commentId: string,
    userId: string,
    content: string
  ): Promise<void> {
    return this.commentRepo.updateComment(targetCollection, targetId, commentId, userId, content);
  }

  deleteComment(
    targetCollection: string,
    targetId: string,
    commentId: string
  ): Promise<void> {
    return this.commentRepo.deleteComment(targetCollection, targetId, commentId);
  }

  getComments(
    targetCollection: string,
    targetId: string,
    limit?: number,
    startAfter?: Timestamp
  ): Promise<Comment[]> {
    return this.commentRepo.getComments(targetCollection, targetId, limit, startAfter);
  }

  getComment(
    targetCollection: string,
    targetId: string,
    commentId: string
  ): Promise<Comment | null> {
    return this.commentRepo.getComment(targetCollection, targetId, commentId);
  }

  getUserComments(
    userId: string,
    targetCollection?: string,
    limit?: number,
    startAfter?: Timestamp
  ): Promise<Comment[]> {
    return this.commentRepo.getUserComments(userId, targetCollection, limit, startAfter);
  }

  // ==================== 收藏 ====================

  favorite(
    targetCollection: string,
    targetId: string,
    userId: string
  ): Promise<void> {
    return this.favoriteRepo.favorite(targetCollection, targetId, userId);
  }

  unfavorite(
    targetCollection: string,
    targetId: string,
    userId: string
  ): Promise<void> {
    return this.favoriteRepo.unfavorite(targetCollection, targetId, userId);
  }

  isFavorited(
    targetCollection: string,
    targetId: string,
    userId: string
  ): Promise<boolean> {
    return this.favoriteRepo.isFavorited(targetCollection, targetId, userId);
  }

  getUserFavorites(
    userId: string,
    targetCollection: string,
    limit?: number,
    startAfter?: Timestamp
  ): Promise<Favorite[]> {
    return this.favoriteRepo.getUserFavorites(userId, targetCollection, limit, startAfter);
  }

  batchIsFavorited(
    targetCollection: string,
    targetIds: string[],
    userId: string
  ): Promise<Map<string, boolean>> {
    return this.favoriteRepo.batchIsFavorited(targetCollection, targetIds, userId);
  }
}
