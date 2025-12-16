import {Firestore} from "firebase-admin/firestore";
import {LikeRepository} from "../src";

// Mock Firestore
const createMockFirestore = () => {
  const mockTransaction = {
    get: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockDocRef = {
    get: jest.fn(),
    collection: jest.fn(),
  };

  const mockCollectionRef = {
    doc: jest.fn(() => mockDocRef),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    startAfter: jest.fn().mockReturnThis(),
    get: jest.fn(),
  };

  mockDocRef.collection.mockReturnValue(mockCollectionRef);

  const mockDb = {
    collection: jest.fn(() => mockCollectionRef),
    runTransaction: jest.fn((fn) => fn(mockTransaction)),
    getAll: jest.fn(),
    collectionGroup: jest.fn(() => mockCollectionRef),
  } as unknown as Firestore;

  return {mockDb, mockTransaction, mockDocRef, mockCollectionRef};
};

describe("LikeRepository", () => {
  describe("like", () => {
    it("should create like and increment counter when target exists and not liked", async () => {
      const {mockDb, mockTransaction} = createMockFirestore();
      const repo = new LikeRepository(mockDb);

      mockTransaction.get.mockResolvedValueOnce({exists: true}); // target exists
      mockTransaction.get.mockResolvedValueOnce({exists: false}); // not liked yet

      await repo.like("posts", "post1", "user1");

      expect(mockTransaction.set).toHaveBeenCalled();
      expect(mockTransaction.update).toHaveBeenCalled();
    });

    it("should be idempotent - skip if already liked", async () => {
      const {mockDb, mockTransaction} = createMockFirestore();
      const repo = new LikeRepository(mockDb);

      mockTransaction.get.mockResolvedValueOnce({exists: true}); // target exists
      mockTransaction.get.mockResolvedValueOnce({exists: true}); // already liked

      await repo.like("posts", "post1", "user1");

      expect(mockTransaction.set).not.toHaveBeenCalled();
      expect(mockTransaction.update).not.toHaveBeenCalled();
    });

    it("should throw error when target document not found", async () => {
      const {mockDb, mockTransaction} = createMockFirestore();
      const repo = new LikeRepository(mockDb);

      mockTransaction.get.mockResolvedValueOnce({exists: false}); // target not exists
      mockTransaction.get.mockResolvedValueOnce({exists: false}); // like doc

      await expect(repo.like("posts", "post1", "user1"))
        .rejects.toThrow("Target document not found: posts/post1");
    });
  });

  describe("unlike", () => {
    it("should delete like and decrement counter when liked", async () => {
      const {mockDb, mockTransaction} = createMockFirestore();
      const repo = new LikeRepository(mockDb);

      mockTransaction.get.mockResolvedValueOnce({exists: true}); // target exists
      mockTransaction.get.mockResolvedValueOnce({exists: true}); // is liked

      await repo.unlike("posts", "post1", "user1");

      expect(mockTransaction.delete).toHaveBeenCalled();
      expect(mockTransaction.update).toHaveBeenCalled();
    });

    it("should be idempotent - skip if not liked", async () => {
      const {mockDb, mockTransaction} = createMockFirestore();
      const repo = new LikeRepository(mockDb);

      mockTransaction.get.mockResolvedValueOnce({exists: true}); // target exists
      mockTransaction.get.mockResolvedValueOnce({exists: false}); // not liked

      await repo.unlike("posts", "post1", "user1");

      expect(mockTransaction.delete).not.toHaveBeenCalled();
      expect(mockTransaction.update).not.toHaveBeenCalled();
    });

    it("should throw error when target document not found", async () => {
      const {mockDb, mockTransaction} = createMockFirestore();
      const repo = new LikeRepository(mockDb);

      mockTransaction.get.mockResolvedValueOnce({exists: false}); // target not exists
      mockTransaction.get.mockResolvedValueOnce({exists: false}); // like doc

      await expect(repo.unlike("posts", "post1", "user1"))
        .rejects.toThrow("Target document not found: posts/post1");
    });
  });

  describe("isLiked", () => {
    it("should return true when liked", async () => {
      const {mockDb, mockDocRef} = createMockFirestore();
      const repo = new LikeRepository(mockDb);

      mockDocRef.get.mockResolvedValueOnce({exists: true});

      const result = await repo.isLiked("posts", "post1", "user1");
      expect(result).toBe(true);
    });

    it("should return false when not liked", async () => {
      const {mockDb, mockDocRef} = createMockFirestore();
      const repo = new LikeRepository(mockDb);

      mockDocRef.get.mockResolvedValueOnce({exists: false});

      const result = await repo.isLiked("posts", "post1", "user1");
      expect(result).toBe(false);
    });
  });

  describe("batchIsLiked", () => {
    it("should return map of liked status", async () => {
      const {mockDb} = createMockFirestore();
      const repo = new LikeRepository(mockDb);

      (mockDb.getAll as jest.Mock).mockResolvedValueOnce([
        {exists: true},
        {exists: false},
        {exists: true},
      ]);

      const result = await repo.batchIsLiked("posts", ["p1", "p2", "p3"], "user1");

      expect(result.get("p1")).toBe(true);
      expect(result.get("p2")).toBe(false);
      expect(result.get("p3")).toBe(true);
    });

    it("should throw error when exceeding batch limit", async () => {
      const {mockDb} = createMockFirestore();
      const repo = new LikeRepository(mockDb);

      const ids = Array.from({length: 101}, (_, i) => `id${i}`);

      await expect(repo.batchIsLiked("posts", ids, "user1"))
        .rejects.toThrow("targetIds length exceeds limit of 100");
    });

    it("should return empty map for empty input", async () => {
      const {mockDb} = createMockFirestore();
      const repo = new LikeRepository(mockDb);

      const result = await repo.batchIsLiked("posts", [], "user1");
      expect(result.size).toBe(0);
    });
  });
});

