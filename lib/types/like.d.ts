import type { Timestamp } from "firebase-admin/firestore";
/**
 * 点赞记录
 * 存储路径: {targetCollection}/{targetId}/likes/{userId}
 */
export interface Like {
    userId: string;
    targetCollection: string;
    targetId: string;
    createdAt: Timestamp;
}
