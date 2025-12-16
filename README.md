# @heart/interaction

通用互动功能包，提供点赞、评论、收藏功能的类型定义和数据库操作。

## 特性

- ✅ 基于 Firestore 子集合设计
- ✅ 类型安全（TypeScript）
- ✅ 支持点赞、评论、收藏
- ✅ 幂等操作（重复点赞/收藏不会重复计数）
- ✅ 事务保证计数器一致性
- ✅ 游标分页（基于 Timestamp）
- ✅ 批量查询支持（batchIsLiked, batchIsFavorited）
- ✅ 评论软删除
- ✅ 可自定义集合名称

## 安装

```bash
# 使用最新 release（推荐）
npm install @heart/interaction@github:hbeatai/heart-interaction#release/latest

# 或锁定到指定版本
npm install @heart/interaction@github:hbeatai/heart-interaction#release/v1.0.0
```

## 使用示例

### 1. 初始化 Repository

```typescript
import {InteractionRepository} from "@heart/interaction";
import {getFirestore} from "firebase-admin/firestore";

const db = getFirestore();
const repo = new InteractionRepository(db);

// 或自定义集合名称
const customRepo = new InteractionRepository(db, {
  likes: "likes",
  comments: "comments",
  favorites: "favorites",
  favoriteSubCollectionPrefix: "favorite_",
});
```

### 2. 点赞功能

```typescript
// 点赞
await repo.like("character_card", cardId, userId);

// 取消点赞
await repo.unlike("character_card", cardId, userId);

// 检查是否已点赞
const isLiked = await repo.isLiked("character_card", cardId, userId);

// 批量检查（最多 100 个）
const likedMap = await repo.batchIsLiked("character_card", [id1, id2, id3], userId);
// Map { "id1" => true, "id2" => false, "id3" => true }

// 获取点赞列表（游标分页）
const likes = await repo.getLikes("character_card", cardId, 20);
const nextPage = await repo.getLikes("character_card", cardId, 20, likes[likes.length - 1].createdAt);
```

### 3. 评论功能

```typescript
// 添加评论
const comment = await repo.addComment("character_card", cardId, userId, "这个角色很棒！");
// { id, userId, targetCollection, targetId, content, createdAt, updatedAt }

// 更新评论
await repo.updateComment("character_card", cardId, comment.id, "修改后的内容");

// 删除评论（软删除，移除 indexedAt 字段）
await repo.deleteComment("character_card", cardId, comment.id);

// 获取评论列表（游标分页，已删除的不会返回）
const comments = await repo.getComments("character_card", cardId, 20);
const nextPage = await repo.getComments("character_card", cardId, 20, comments[comments.length - 1].createdAt);

// 获取单条评论（已删除的返回 null）
const singleComment = await repo.getComment("character_card", cardId, commentId);
```

### 4. 收藏功能

```typescript
// 收藏
await repo.favorite("character_card", cardId, userId);

// 取消收藏
await repo.unfavorite("character_card", cardId, userId);

// 检查是否已收藏
const isFavorited = await repo.isFavorited("character_card", cardId, userId);

// 批量检查（最多 100 个）
const favoritedMap = await repo.batchIsFavorited("character_card", [id1, id2], userId);

// 获取用户的收藏列表（按目标集合分类，游标分页）
const favorites = await repo.getUserFavorites(userId, "character_card", 20);
const nextPage = await repo.getUserFavorites(userId, "character_card", 20, favorites[favorites.length - 1].createdAt);
```

### 5. 在数据模型中使用

```typescript
import type {InteractionStats} from "@heart/interaction";

interface CharacterCard extends InteractionStats {
  id: string;
  name: string;
  // ... 其他字段
  // likeCount, commentCount, favoriteCount 已包含
}
```

### 6. 单独使用子仓储

```typescript
import {LikeRepository, CommentRepository, FavoriteRepository} from "@heart/interaction";

// 只需要点赞功能
const likeRepo = new LikeRepository(db);
await likeRepo.like("posts", postId, userId);

// 只需要评论功能
const commentRepo = new CommentRepository(db);
await commentRepo.addComment("posts", postId, userId, "内容");

// 只需要收藏功能
const favoriteRepo = new FavoriteRepository(db);
await favoriteRepo.favorite("posts", postId, userId);
```

## 数据库结构

### 点赞和评论（目标文档的子集合）

```
{targetCollection}/{targetId}/
  ├── likes/{userId}          # 点赞记录
  └── comments/{commentId}    # 评论记录
```

### 收藏（用户维度的子集合）

```
favorites/{userId}/
  └── favorite_{targetCollection}/{targetId}
```

### 目标文档需要的字段

```typescript
interface InteractionStats {
  likeCount: number;
  commentCount: number;
  favoriteCount: number;
}
```

## 发布流程

本项目使用 GitHub Actions 自动发布。当推送 tag 时，会自动构建并发布到 release 分支。

### 发布新版本

```bash
# 1. 确保代码已提交并推送到 main
git push origin main

# 2. 创建并推送 tag
git tag v1.0.0
git push origin v1.0.0

# 3. GitHub Actions 自动执行：
#    - npm ci && npm run build
#    - 推送到 release/v1.0.0 分支
#    - 同时更新 release/latest 分支
```

### 消费者更新依赖

```bash
# 使用 release/latest 的项目，重新安装即可获取最新版本
npm install @heart/interaction@github:hbeatai/heart-interaction#release/latest
```

### 分支说明

| 分支 | 用途 |
|------|------|
| `main` | 开发分支，不包含 `lib/` 编译产物 |
| `release/latest` | 始终指向最新版本，推荐使用 |
| `release/v*` | 特定版本分支，用于锁定版本 |

## License

MIT
