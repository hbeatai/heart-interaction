import {Firestore, Timestamp} from "firebase-admin/firestore";
import {CommentRepository} from "../src";

// Mock Firestore
const createMockFirestore = () => {
  const mockTransaction = {
    get: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockDocRef = {
    id: "comment123",
    get: jest.fn(),
    update: jest.fn(),
    collection: jest.fn(),
  };

  const mockCollectionRef = {
    doc: jest.fn(() => mockDocRef),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    startAfter: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    get: jest.fn(),
  };

  mockDocRef.collection.mockReturnValue(mockCollectionRef);

  const mockDb = {
    collection: jest.fn(() => mockCollectionRef),
    runTransaction: jest.fn((fn) => fn(mockTransaction)),
    collectionGroup: jest.fn(() => mockCollectionRef),
  } as unknown as Firestore;

  return {mockDb, mockTransaction, mockDocRef, mockCollectionRef};
};

describe("CommentRepository", () => {
  describe("addComment", () => {
    it("should create comment and increment counter when target exists", async () => {
      const {mockDb, mockTransaction} = createMockFirestore();
      const repo = new CommentRepository(mockDb);

      mockTransaction.get.mockResolvedValueOnce({exists: true}); // target exists

      const result = await repo.addComment("posts", "post1", "user1", "Great post!");

      expect(mockTransaction.set).toHaveBeenCalled();
      expect(mockTransaction.update).toHaveBeenCalled();
      expect(result.content).toBe("Great post!");
      expect(result.userId).toBe("user1");
    });

    it("should throw error when target document not found", async () => {
      const {mockDb, mockTransaction} = createMockFirestore();
      const repo = new CommentRepository(mockDb);

      mockTransaction.get.mockResolvedValueOnce({exists: false}); // target not exists

      await expect(repo.addComment("posts", "post1", "user1", "Great post!"))
        .rejects.toThrow("Target document not found: posts/post1");
    });
  });

  describe("updateComment", () => {
    it("should update comment when user owns it", async () => {
      const {mockDb, mockTransaction} = createMockFirestore();
      const repo = new CommentRepository(mockDb);

      const now = Timestamp.now();
      mockTransaction.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({userId: "user1", indexedAt: now}),
      });

      await repo.updateComment("posts", "post1", "comment1", "user1", "Updated content");

      expect(mockTransaction.update).toHaveBeenCalled();
    });

    it("should throw error when comment not found", async () => {
      const {mockDb, mockTransaction} = createMockFirestore();
      const repo = new CommentRepository(mockDb);

      mockTransaction.get.mockResolvedValueOnce({exists: false});

      await expect(repo.updateComment("posts", "post1", "comment1", "user1", "Updated"))
        .rejects.toThrow("Comment not found: posts/post1/comments/comment1");
    });

    it("should throw error when comment already deleted", async () => {
      const {mockDb, mockTransaction} = createMockFirestore();
      const repo = new CommentRepository(mockDb);

      mockTransaction.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({userId: "user1", indexedAt: undefined}), // soft deleted
      });

      await expect(repo.updateComment("posts", "post1", "comment1", "user1", "Updated"))
        .rejects.toThrow("Comment already deleted: posts/post1/comments/comment1");
    });

    it("should throw error when user does not own comment", async () => {
      const {mockDb, mockTransaction} = createMockFirestore();
      const repo = new CommentRepository(mockDb);

      const now = Timestamp.now();
      mockTransaction.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({userId: "otherUser", indexedAt: now}),
      });

      await expect(repo.updateComment("posts", "post1", "comment1", "user1", "Updated"))
        .rejects.toThrow("Permission denied: user user1 cannot update comment owned by otherUser");
    });
  });

  describe("deleteComment", () => {
    it("should soft delete comment and decrement counter", async () => {
      const {mockDb, mockTransaction} = createMockFirestore();
      const repo = new CommentRepository(mockDb);

      const now = Timestamp.now();
      mockTransaction.get.mockResolvedValueOnce({exists: true}); // target exists
      mockTransaction.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({indexedAt: now}),
      });

      await repo.deleteComment("posts", "post1", "comment1");

      expect(mockTransaction.update).toHaveBeenCalledTimes(2); // comment + target
    });

    it("should be idempotent - skip if already deleted", async () => {
      const {mockDb, mockTransaction} = createMockFirestore();
      const repo = new CommentRepository(mockDb);

      mockTransaction.get.mockResolvedValueOnce({exists: true}); // target exists
      mockTransaction.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({indexedAt: undefined}), // already deleted
      });

      await repo.deleteComment("posts", "post1", "comment1");

      expect(mockTransaction.update).not.toHaveBeenCalled();
    });

    it("should throw error when target document not found", async () => {
      const {mockDb, mockTransaction} = createMockFirestore();
      const repo = new CommentRepository(mockDb);

      mockTransaction.get.mockResolvedValueOnce({exists: false}); // target not exists
      mockTransaction.get.mockResolvedValueOnce({exists: false}); // comment

      await expect(repo.deleteComment("posts", "post1", "comment1"))
        .rejects.toThrow("Target document not found: posts/post1");
    });
  });
});

