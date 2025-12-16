import type { Timestamp } from "firebase-admin/firestore";
/**
 * 收藏记录
 * 存储路径: favorites/{userId}/favorite_{targetCollection}/{targetId}
 */
export interface Favorite {
    userId: string;
    targetCollection: string;
    targetId: string;
    createdAt: Timestamp;
}
