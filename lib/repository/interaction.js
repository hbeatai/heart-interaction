"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionRepository = void 0;
const config_1 = require("../config");
const comment_1 = require("./comment");
const favorite_1 = require("./favorite");
const like_1 = require("./like");
/**
 * 互动功能仓储实现（组合三个子仓储）
 */
class InteractionRepository {
    likeRepo;
    commentRepo;
    favoriteRepo;
    /**
     * @param db Firestore 实例
     * @param collectionNames 可选，自定义集合名称
     */
    constructor(db, collectionNames) {
        const names = { ...config_1.DEFAULT_COLLECTION_NAMES, ...collectionNames };
        this.likeRepo = new like_1.LikeRepository(db, names.likes);
        this.commentRepo = new comment_1.CommentRepository(db, names.comments);
        this.favoriteRepo = new favorite_1.FavoriteRepository(db, names.favorites, names.favoriteSubCollectionPrefix);
    }
    // ==================== 点赞 ====================
    like(targetCollection, targetId, userId) {
        return this.likeRepo.like(targetCollection, targetId, userId);
    }
    unlike(targetCollection, targetId, userId) {
        return this.likeRepo.unlike(targetCollection, targetId, userId);
    }
    isLiked(targetCollection, targetId, userId) {
        return this.likeRepo.isLiked(targetCollection, targetId, userId);
    }
    getLikes(targetCollection, targetId, limit, startAfter) {
        return this.likeRepo.getLikes(targetCollection, targetId, limit, startAfter);
    }
    batchIsLiked(targetCollection, targetIds, userId) {
        return this.likeRepo.batchIsLiked(targetCollection, targetIds, userId);
    }
    getUserLikes(userId, targetCollection, limit, startAfter) {
        return this.likeRepo.getUserLikes(userId, targetCollection, limit, startAfter);
    }
    // ==================== 评论 ====================
    addComment(targetCollection, targetId, userId, content) {
        return this.commentRepo.addComment(targetCollection, targetId, userId, content);
    }
    updateComment(targetCollection, targetId, commentId, userId, content) {
        return this.commentRepo.updateComment(targetCollection, targetId, commentId, userId, content);
    }
    deleteComment(targetCollection, targetId, commentId) {
        return this.commentRepo.deleteComment(targetCollection, targetId, commentId);
    }
    getComments(targetCollection, targetId, limit, startAfter) {
        return this.commentRepo.getComments(targetCollection, targetId, limit, startAfter);
    }
    getComment(targetCollection, targetId, commentId) {
        return this.commentRepo.getComment(targetCollection, targetId, commentId);
    }
    getUserComments(userId, targetCollection, limit, startAfter) {
        return this.commentRepo.getUserComments(userId, targetCollection, limit, startAfter);
    }
    // ==================== 收藏 ====================
    favorite(targetCollection, targetId, userId) {
        return this.favoriteRepo.favorite(targetCollection, targetId, userId);
    }
    unfavorite(targetCollection, targetId, userId) {
        return this.favoriteRepo.unfavorite(targetCollection, targetId, userId);
    }
    isFavorited(targetCollection, targetId, userId) {
        return this.favoriteRepo.isFavorited(targetCollection, targetId, userId);
    }
    getUserFavorites(userId, targetCollection, limit, startAfter) {
        return this.favoriteRepo.getUserFavorites(userId, targetCollection, limit, startAfter);
    }
    batchIsFavorited(targetCollection, targetIds, userId) {
        return this.favoriteRepo.batchIsFavorited(targetCollection, targetIds, userId);
    }
}
exports.InteractionRepository = InteractionRepository;
