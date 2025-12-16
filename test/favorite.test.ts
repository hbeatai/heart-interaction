import {Firestore} from "firebase-admin/firestore";
import {FavoriteRepository} from "../src";

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
  } as unknown as Firestore;

  return {mockDb, mockTransaction, mockDocRef, mockCollectionRef};
};

describe("FavoriteRepository", () => {
  describe("favorite", () => {
    it("should create favorite and increment counter when target exists", async () => {
      const {mockDb, mockTransaction} = createMockFirestore();
      const repo = new FavoriteRepository(mockDb);

      mockTransaction.get.mockResolvedValueOnce({exists: true}); // target exists
      mockTransaction.get.mockResolvedValueOnce({exists: false}); // not favorited yet

      await repo.favorite("posts", "post1", "user1");

      expect(mockTransaction.set).toHaveBeenCalled();
      expect(mockTransaction.update).toHaveBeenCalled();
    });

    it("should be idempotent - skip if already favorited", async () => {
      const {mockDb, mockTransaction} = createMockFirestore();
      const repo = new FavoriteRepository(mockDb);

      mockTransaction.get.mockResolvedValueOnce({exists: true}); // target exists
      mockTransaction.get.mockResolvedValueOnce({exists: true}); // already favorited

      await repo.favorite("posts", "post1", "user1");

      expect(mockTransaction.set).not.toHaveBeenCalled();
      expect(mockTransaction.update).not.toHaveBeenCalled();
    });

    it("should throw error when target document not found", async () => {
      const {mockDb, mockTransaction} = createMockFirestore();
      const repo = new FavoriteRepository(mockDb);

      mockTransaction.get.mockResolvedValueOnce({exists: false}); // target not exists
      mockTransaction.get.mockResolvedValueOnce({exists: false}); // favorite doc

      await expect(repo.favorite("posts", "post1", "user1"))
        .rejects.toThrow("Target document not found: posts/post1");
    });
  });

  describe("unfavorite", () => {
    it("should delete favorite and decrement counter when favorited", async () => {
      const {mockDb, mockTransaction} = createMockFirestore();
      const repo = new FavoriteRepository(mockDb);

      mockTransaction.get.mockResolvedValueOnce({exists: true}); // target exists
      mockTransaction.get.mockResolvedValueOnce({exists: true}); // is favorited

      await repo.unfavorite("posts", "post1", "user1");

      expect(mockTransaction.delete).toHaveBeenCalled();
      expect(mockTransaction.update).toHaveBeenCalled();
    });

    it("should be idempotent - skip if not favorited", async () => {
      const {mockDb, mockTransaction} = createMockFirestore();
      const repo = new FavoriteRepository(mockDb);

      mockTransaction.get.mockResolvedValueOnce({exists: true}); // target exists
      mockTransaction.get.mockResolvedValueOnce({exists: false}); // not favorited

      await repo.unfavorite("posts", "post1", "user1");

      expect(mockTransaction.delete).not.toHaveBeenCalled();
      expect(mockTransaction.update).not.toHaveBeenCalled();
    });

    it("should throw error when target document not found", async () => {
      const {mockDb, mockTransaction} = createMockFirestore();
      const repo = new FavoriteRepository(mockDb);

      mockTransaction.get.mockResolvedValueOnce({exists: false}); // target not exists
      mockTransaction.get.mockResolvedValueOnce({exists: false}); // favorite doc

      await expect(repo.unfavorite("posts", "post1", "user1"))
        .rejects.toThrow("Target document not found: posts/post1");
    });
  });

  describe("isFavorited", () => {
    it("should return true when favorited", async () => {
      const {mockDb, mockDocRef} = createMockFirestore();
      const repo = new FavoriteRepository(mockDb);

      mockDocRef.get.mockResolvedValueOnce({exists: true});

      const result = await repo.isFavorited("posts", "post1", "user1");
      expect(result).toBe(true);
    });

    it("should return false when not favorited", async () => {
      const {mockDb, mockDocRef} = createMockFirestore();
      const repo = new FavoriteRepository(mockDb);

      mockDocRef.get.mockResolvedValueOnce({exists: false});

      const result = await repo.isFavorited("posts", "post1", "user1");
      expect(result).toBe(false);
    });
  });

  describe("batchIsFavorited", () => {
    it("should return map of favorited status", async () => {
      const {mockDb} = createMockFirestore();
      const repo = new FavoriteRepository(mockDb);

      (mockDb.getAll as jest.Mock).mockResolvedValueOnce([
        {exists: true},
        {exists: false},
      ]);

      const result = await repo.batchIsFavorited("posts", ["p1", "p2"], "user1");

      expect(result.get("p1")).toBe(true);
      expect(result.get("p2")).toBe(false);
    });

    it("should throw error when exceeding batch limit", async () => {
      const {mockDb} = createMockFirestore();
      const repo = new FavoriteRepository(mockDb);

      const ids = Array.from({length: 101}, (_, i) => `id${i}`);

      await expect(repo.batchIsFavorited("posts", ids, "user1"))
        .rejects.toThrow("targetIds length exceeds limit of 100");
    });
  });
});

