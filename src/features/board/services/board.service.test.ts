/**
 * @jest-environment node
 */

import { boardService } from "@/features/board/services/board";
import prisma from "@/lib/prisma";

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

const mockUserId = "user-123";

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
    members: [{ id: mockUserId }],
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

      const result = await boardService.get(mockUserId);

      expect(prisma.board.findMany).toHaveBeenCalledWith({
        where: {
          members: {
            some: { id: mockUserId },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      expect(result).toEqual(mockBoards);
      expect(result).toHaveLength(2);
    });

    it("should return empty array when no boards exist", async () => {
      (prisma.board.findMany as jest.Mock).mockResolvedValue([]);

      const result = await boardService.get(mockUserId);

      expect(result).toEqual([]);
    });

    it("should handle database errors", async () => {
      const error = new Error("Database error");
      (prisma.board.findMany as jest.Mock).mockRejectedValue(error);

      await expect(boardService.get(mockUserId)).rejects.toThrow("Database error");
    });
  });

  describe("getById", () => {
    it("should fetch board with columns and tasks", async () => {
      (prisma.board.findUnique as jest.Mock).mockResolvedValue(mockBoardWithColumns);

      const result = await boardService.getById(mockBoardId, mockUserId);

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
          members: {
            where: { id: mockUserId },
          },
        },
      });
      expect(result).toEqual(mockBoardWithColumns);
      expect(result?.columns).toHaveLength(2);
    });

    it("should return null when board does not exist", async () => {
      (prisma.board.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await boardService.getById("non-existent", mockUserId);

      expect(result).toBeNull();
    });

    it("should handle invalid UUID format", async () => {
      (prisma.board.findUnique as jest.Mock).mockRejectedValue(new Error("Invalid UUID"));

      await expect(boardService.getById("invalid-uuid", mockUserId)).rejects.toThrow();
    });
  });

  describe("create", () => {
    it("should create board with default columns", async () => {
      const createData = { title: "New Board" };

      (prisma.board.create as jest.Mock).mockResolvedValue(mockBoardWithColumns);

      const result = await boardService.create(createData, mockUserId);

      expect(prisma.board.create).toHaveBeenCalledWith({
        data: {
          ...createData,
          members: {
            connect: { id: mockUserId },
          },
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

      await expect(boardService.create({ title: "New Board" }, mockUserId)).rejects.toThrow();
    });

    it("should preserve create data with additional fields", async () => {
      const createData = {
        title: "Board",
        description: "A test board",
      };

      (prisma.board.create as jest.Mock).mockResolvedValue(mockBoard);

      await boardService.create(createData, mockUserId);

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
      (prisma.board.findUnique as jest.Mock).mockResolvedValue(mockBoardWithColumns);
      (prisma.board.update as jest.Mock).mockResolvedValue(updatedBoard);

      const result = await boardService.update(mockBoardId, { title: "Updated Title" }, mockUserId);

      expect(prisma.board.update).toHaveBeenCalledWith({
        where: { id: mockBoardId },
        data: { title: "Updated Title" },
      });
      expect(result.title).toBe("Updated Title");
    });

    it("should throw when user is not member", async () => {
      const noMembersBoard = { ...mockBoard, members: [] };
      (prisma.board.findUnique as jest.Mock).mockResolvedValue(noMembersBoard);

      await expect(boardService.update(mockBoardId, { title: "New" }, mockUserId)).rejects.toThrow(
        "Unauthorized"
      );
    });

    it("should handle non-existent board", async () => {
      (prisma.board.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(boardService.update("non-existent", { title: "New" }, mockUserId)).rejects.toThrow();
    });
  });

  describe("delete", () => {
    it("should delete board by ID", async () => {
      (prisma.board.findUnique as jest.Mock).mockResolvedValue(mockBoardWithColumns);
      (prisma.board.delete as jest.Mock).mockResolvedValue(mockBoard);

      const result = await boardService.delete(mockBoardId, mockUserId);

      expect(prisma.board.delete).toHaveBeenCalledWith({
        where: { id: mockBoardId },
      });
      expect(result.id).toBe(mockBoardId);
    });

    it("should throw when user is not member", async () => {
      const noMembersBoard = { ...mockBoard, members: [] };
      (prisma.board.findUnique as jest.Mock).mockResolvedValue(noMembersBoard);

      await expect(boardService.delete(mockBoardId, mockUserId)).rejects.toThrow("Unauthorized");
    });

    it("should handle deletion of non-existent board", async () => {
      (prisma.board.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(boardService.delete("non-existent", mockUserId)).rejects.toThrow();
    });
  });

  describe("Error Handling", () => {
    it("should throw on database connection failure", async () => {
      (prisma.board.findMany as jest.Mock).mockRejectedValue(new Error("Connection refused"));

      await expect(boardService.get(mockUserId)).rejects.toThrow("Connection refused");
    });

    it("should handle timeout errors", async () => {
      (prisma.board.findUnique as jest.Mock).mockRejectedValue(new Error("Query timeout"));

      await expect(boardService.getById(mockBoardId, mockUserId)).rejects.toThrow();
    });
  });
});
