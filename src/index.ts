// 导出类型
export * from "./types";

// 导出子接口
export type {ILikeRepository} from "./repository/like.interface";
export type {ICommentRepository} from "./repository/comment.interface";
export type {IFavoriteRepository} from "./repository/favorite.interface";

// 导出组合接口和配置
export type {IInteractionRepository, InteractionCollectionNames} from "./repository/interaction.interface";
export {BATCH_LIMIT, DEFAULT_COLLECTION_NAMES} from "./config";

// 导出子实现
export {LikeRepository} from "./repository/like";
export {CommentRepository} from "./repository/comment";
export {FavoriteRepository} from "./repository/favorite";

// 导出组合实现
export {InteractionRepository} from "./repository/interaction";
