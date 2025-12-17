import type { ICommentRepository } from "./comment.interface";
import type { IFavoriteRepository } from "./favorite.interface";
import type { ILikeRepository } from "./like.interface";
/**
 * 互动功能仓储接口（组合接口）
 * 继承点赞、评论、收藏三个子接口
 */
export interface IInteractionRepository extends ILikeRepository, ICommentRepository, IFavoriteRepository {
}
/**
 * 集合名称配置
 */
export interface InteractionCollectionNames {
    /** 点赞子集合名，默认 "likes" */
    likes?: string;
    /** 评论子集合名，默认 "comments" */
    comments?: string;
    /** 收藏顶层集合名，默认 "favorites" */
    favorites?: string;
    /** 收藏子集合前缀，默认 "favorite_" */
    favoriteSubCollectionPrefix?: string;
}
