"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BATCH_LIMIT = exports.DEFAULT_COLLECTION_NAMES = void 0;
/**
 * 默认集合名称配置
 */
exports.DEFAULT_COLLECTION_NAMES = {
    likes: "likes",
    comments: "comments",
    favorites: "favorites",
    favoriteSubCollectionPrefix: "favorite_",
};
/**
 * Firestore getAll 限制
 */
exports.BATCH_LIMIT = 100;
