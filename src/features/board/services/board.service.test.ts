/**
 * @jest-environment node
 */

import { boardService } from "@/features/board/services/board";
import prisma from "@/lib/prisma";
import type { Prisma } from "@g/prisma/client";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    board: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe("Board Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockBoardId = "board-123";
  const mockBoard = {
    id: mockBoardId,
    title: "Test Board",
    userId: "user-123",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBoardWithColumns = {
    ...mockBoard,
    columns: [
      {
        id: "col-1",
        title: "To Do",
        order: 1000,
        boardId: mockBoardId,
        tasks: [
          {
            id: "task-1",
            title: "Task 1",
            order: 1000,
            columnId: "col-1",
            assignees: [],
          },
        ],
      },
      {
        id: "col-2",
        title: "In Progress",
        order: 2000,
        boardId: mockBoardId,
        tasks: [],
      },
    ],
  };

  describe("get", () => {
    it("should fetch all boards for user", async () => {
      const mockBoards = [mockBoard, { ...mockBoard, id: "board-456" }];
      (prisma.board.findMany as jest.Mock).mockResolvedValue(mockBoards);

      const result = await boardService.get();

      expect(prisma.board.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
      });
      expect(result).toEqual(mockBoards);
      expect(result).toHaveLength(2);
    });

    it("should return empty array when no boards exist", async () => {
      (prisma.board.findMany as jest.Mock).mockResolvedValue([]);

      const result = await boardService.get();

      expect(result).toEqual([]);
    });

    it("should handle database errors", async () => {
      const error = new Error("Database error");
      (prisma.board.findMany as jest.Mock).mockRejectedValue(error);

      await expect(boardService.get()).rejects.toThrow("Database error");
    });
  });

  describe("getById", () => {
    it("should fetch board with columns and tasks", async () => {
      (prisma.board.findUnique as jest.Mock).mockResolvedValue(mockBoardWithColumns);

      const result = await boardService.getById(mockBoardId);

      expect(prisma.board.findUnique).toHaveBeenCalledWith({
        where: { id: mockBoardId },
        include: {
          columns: {
            orderBy: { order: "asc" },
            include: {
              tasks: {
                orderBy: { order: "asc" },
                include: { assignees: true },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockBoardWithColumns);
      expect(result?.columns).toHaveLength(2);
    });

    it("should return null when board does not exist", async () => {
      (prisma.board.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await boardService.getById("non-existent");

      expect(result).toBeNull();
    });

    it("should handle invalid UUID format", async () => {
      (prisma.board.findUnique as jest.Mock).mockRejectedValue(new Error("Invalid UUID"));

      await expect(boardService.getById("invalid-uuid")).rejects.toThrow();
    });
  });

  describe("create", () => {
    it("should create board with default columns", async () => {
      const createData = { title: "New Board", userId: "user-123" };

      (prisma.board.create as jest.Mock).mockResolvedValue(mockBoardWithColumns);

      const result = await boardService.create(createData as unknown as Prisma.BoardCreateInput);

      expect(prisma.board.create).toHaveBeenCalledWith({
        data: {
          ...createData,
          columns: {
            create: [
              { title: "To Do", order: 1000 },
              { title: "In Progress", order: 2000 },
              { title: "Done", order: 3000 },
            ],
          },
        },
      });
      expect((result as unknown as { columns: unknown[] }).columns).toHaveLength(2);
    });

    it("should handle database constraint violations", async () => {
      const error = new Error("Unique constraint violation");
      (prisma.board.create as jest.Mock).mockRejectedValue(error);

      await expect(
        boardService.create({
          title: "New Board",
          userId: "user-123",
        } as unknown as Prisma.BoardCreateInput),
      ).rejects.toThrow();
    });

    it("should preserve create data with additional fields", async () => {
      const createData = {
        title: "Board",
        userId: "user-123",
        description: "A test board",
      };

      (prisma.board.create as jest.Mock).mockResolvedValue(mockBoard);

      await boardService.create(createData as Prisma.BoardCreateInput);

      expect(prisma.board.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining(createData),
        }),
      );
    });
  });

  describe("update", () => {
    it("should update board title", async () => {
      const updatedBoard = { ...mockBoard, title: "Updated Title" };
      (prisma.board.update as jest.Mock).mockResolvedValue(updatedBoard);

      const result = await boardService.update(mockBoardId, {
        title: "Updated Title",
      });

      expect(prisma.board.update).toHaveBeenCalledWith({
        where: { id: mockBoardId },
        data: { title: "Updated Title" },
      });
      expect(result.title).toBe("Updated Title");
    });

    it("should handle non-existent board", async () => {
      const error = new Error("Board not found");
      (prisma.board.update as jest.Mock).mockRejectedValue(error);

      await expect(boardService.update("non-existent", { title: "New" })).rejects.toThrow();
    });

    it("should only update title field", async () => {
      (prisma.board.update as jest.Mock).mockResolvedValue(mockBoard);

      await boardService.update(mockBoardId, {
        title: "New Title",
        description: "Should be ignored",
      } as Prisma.BoardUpdateInput);

      expect(prisma.board.update).toHaveBeenCalledWith({
        where: { id: mockBoardId },
        data: { title: "New Title" },
      });
    });
  });

  describe("delete", () => {
    it("should delete board by ID", async () => {
      (prisma.board.delete as jest.Mock).mockResolvedValue(mockBoard);

      const result = await boardService.delete(mockBoardId);

      expect(prisma.board.delete).toHaveBeenCalledWith({
        where: { id: mockBoardId },
      });
      expect(result.id).toBe(mockBoardId);
    });

    it("should handle deletion of non-existent board", async () => {
      const error = new Error("Board not found");
      (prisma.board.delete as jest.Mock).mockRejectedValue(error);

      await expect(boardService.delete("non-existent")).rejects.toThrow();
    });

    it("should cascade delete columns and tasks", async () => {
      (prisma.board.delete as jest.Mock).mockResolvedValue(mockBoard);

      await boardService.delete(mockBoardId);

      // Prisma handles cascade deletes automatically
      expect(prisma.board.delete).toHaveBeenCalledWith({
        where: { id: mockBoardId },
      });
    });
  });

  describe("Error Handling", () => {
    it("should throw on database connection failure", async () => {
      (prisma.board.findMany as jest.Mock).mockRejectedValue(new Error("Connection refused"));

      await expect(boardService.get()).rejects.toThrow("Connection refused");
    });

    it("should handle timeout errors", async () => {
      (prisma.board.findUnique as jest.Mock).mockRejectedValue(new Error("Query timeout"));

      await expect(boardService.getById(mockBoardId)).rejects.toThrow();
    });
  });
});
