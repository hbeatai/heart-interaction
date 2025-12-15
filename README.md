# @heart/interaction

通用互动功能包，提供点赞、评论、收藏功能的类型定义和数据库操作。

## 特性

- ✅ 基于 Firestore 子集合设计
- ✅ 类型安全（TypeScript）
- ✅ 支持点赞、评论、收藏
- ✅ 自动维护计数器
- ✅ 支持分页查询

## 安装

```bash
# 通过 Git 依赖安装
npm install git+https://github.com/yourname/heart-interaction.git#v1.0.0
```

## 使用示例

### 1. 初始化 Repository

```typescript
import { InteractionRepository } from "@heart/interaction";
import { db } from "./firebase-config";

const interactionRepo = new InteractionRepository(db);
```

### 2. 点赞功能

```typescript
// 点赞
await interactionRepo.like("character_card", cardId, userId);

// 取消点赞
await interactionRepo.unlike("character_card", cardId, userId);

// 检查是否已点赞
const isLiked = await interactionRepo.isLiked("character_card", cardId, userId);
```

### 3. 评论功能

```typescript
// 添加评论
const commentId = await interactionRepo.addComment(
  "character_card",
  cardId,
  userId,
  "这个角色很棒！"
);

// 获取评论列表
const comments = await interactionRepo.getComments("character_card", cardId, 20);

// 删除评论
await interactionRepo.deleteComment("character_card", cardId, commentId);
```

### 4. 收藏功能

```typescript
// 收藏
await interactionRepo.favorite("character_card", cardId, userId);

// 取消收藏
await interactionRepo.unfavorite("character_card", cardId, userId);

// 获取用户的收藏列表
const favorites = await interactionRepo.getUserFavorites(userId, 20);
```

### 5. 在数据模型中使用

```typescript
import type { InteractionStats } from "@heart/interaction";

interface CharacterCard extends InteractionStats {
  id: string;
  name: string;
  // ... 其他字段
  // likeCount, commentCount, favoriteCount 已包含
}
```

## 数据库结构

### 子集合
```
{parentCollection}/{parentId}/
  ├── likes/{userId}
  ├── comments/{commentId}
  └── favorites/{userId}

user_profile/{userId}/
  └── favorites/{targetId}
```

### 父对象需要的字段
```typescript
{
  likeCount: number;
  commentCount: number;
  favoriteCount: number;
}
```

## 版本管理

使用 Git tag 管理版本：

```bash
# 发布新版本
git tag v1.0.0
git push origin v1.0.0

# 在项目中更新到新版本
npm install git+https://github.com/yourname/heart-interaction.git#v1.0.0
```

## License

MIT
