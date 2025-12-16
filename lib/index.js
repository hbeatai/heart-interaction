"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionRepository = exports.FavoriteRepository = exports.CommentRepository = exports.LikeRepository = exports.DEFAULT_COLLECTION_NAMES = exports.BATCH_LIMIT = void 0;
// 导出类型
__exportStar(require("./types"), exports);
var config_1 = require("./config");
Object.defineProperty(exports, "BATCH_LIMIT", { enumerable: true, get: function () { return config_1.BATCH_LIMIT; } });
Object.defineProperty(exports, "DEFAULT_COLLECTION_NAMES", { enumerable: true, get: function () { return config_1.DEFAULT_COLLECTION_NAMES; } });
// 导出子实现
var like_1 = require("./repository/like");
Object.defineProperty(exports, "LikeRepository", { enumerable: true, get: function () { return like_1.LikeRepository; } });
var comment_1 = require("./repository/comment");
Object.defineProperty(exports, "CommentRepository", { enumerable: true, get: function () { return comment_1.CommentRepository; } });
var favorite_1 = require("./repository/favorite");
Object.defineProperty(exports, "FavoriteRepository", { enumerable: true, get: function () { return favorite_1.FavoriteRepository; } });
// 导出组合实现
var interaction_1 = require("./repository/interaction");
Object.defineProperty(exports, "InteractionRepository", { enumerable: true, get: function () { return interaction_1.InteractionRepository; } });
