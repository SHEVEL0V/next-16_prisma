/**
 * @jest-environment node
 */

import { columnService } from '@/features/board/services/column'
import prisma from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    column: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback({
      column: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
    })),
  },
}))

describe('Column Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockColumnId = 'col-123'
  const mockBoardId = 'board-123'
  const mockUserId = 'user-123'

  const mockColumn = {
    id: mockColumnId,
    title: 'To Do',
    order: 1000,
    boardId: mockBoardId,
  }

  const mockColumnWithBoard = {
    ...mockColumn,
    board: {
      id: mockBoardId,
      members: [{ id: mockUserId }],
    },
  }

  describe('getById', () => {
    it('should fetch column by ID', async () => {
      ;(prisma.column.findUnique as jest.Mock).mockResolvedValue(mockColumn)

      const result = await columnService.getById(mockColumnId)

      expect(prisma.column.findUnique).toHaveBeenCalledWith({
        where: { id: mockColumnId },
      })
      expect(result).toEqual(mockColumn)
    })

    it('should return null when column does not exist', async () => {
      ;(prisma.column.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await columnService.getById('non-existent')

      expect(result).toBeNull()
    })

    it('should handle database errors', async () => {
      ;(prisma.column.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      await expect(columnService.getById(mockColumnId)).rejects.toThrow()
    })
  })

  describe('create', () => {
    it('should create column with calculated order', async () => {
      const mockLastColumn = { ...mockColumn, order: 2000 }
      const newColumn = { ...mockColumn, order: 3000 }

      const txMock = {
        board: {
          findUnique: jest.fn().mockResolvedValue({ members: [{ id: mockUserId }] }),
        },
        column: {
          findFirst: jest.fn().mockResolvedValue(mockLastColumn),
          create: jest.fn().mockResolvedValue(newColumn),
        },
      }

      ;(prisma.$transaction as jest.Mock).mockImplementation((callback) =>
        callback(txMock)
      )

      const result = await columnService.create(mockBoardId, 'New Column', mockUserId)

      expect(result).toEqual(newColumn)
      expect(txMock.column.create).toHaveBeenCalledWith({
        data: { title: 'New Column', order: 3000, boardId: mockBoardId },
      })
    })

    it('should set initial order to 1000 when no columns exist', async () => {
      const newColumn = { ...mockColumn, order: 1000 }

      const txMock = {
        board: {
          findUnique: jest.fn().mockResolvedValue({ members: [{ id: mockUserId }] }),
        },
        column: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue(newColumn),
        },
      }

      ;(prisma.$transaction as jest.Mock).mockImplementation((callback) =>
        callback(txMock)
      )

      const result = await columnService.create(mockBoardId, 'First Column', mockUserId)

      expect(result.order).toBe(1000)
      expect(txMock.column.create).toHaveBeenCalledWith({
        data: { title: 'First Column', order: 1000, boardId: mockBoardId },
      })
    })

    it('should throw when user is not a member', async () => {
      const txMock = {
        board: {
          findUnique: jest.fn().mockResolvedValue({ members: [] }),
        },
      }

      ;(prisma.$transaction as jest.Mock).mockImplementation((callback) =>
        callback(txMock)
      )

      await expect(columnService.create(mockBoardId, 'Column', mockUserId)).rejects.toThrow(
        'Unauthorized'
      )
    })
  })

  describe('update', () => {
    it('should update column title', async () => {
      const updatedColumn = { ...mockColumn, title: 'Updated Title' }
      ;(prisma.column.findUnique as jest.Mock).mockResolvedValue(mockColumnWithBoard)
      ;(prisma.column.update as jest.Mock).mockResolvedValue(updatedColumn)

      const result = await columnService.update(mockColumnId, { title: 'Updated Title' }, mockUserId)

      expect(prisma.column.update).toHaveBeenCalledWith({
        where: { id: mockColumnId },
        data: { title: 'Updated Title' },
      })
      expect(result.title).toBe('Updated Title')
    })

    it('should throw when user is not a member', async () => {
      const noMembersBoard = { ...mockColumn, board: { members: [] } }
      ;(prisma.column.findUnique as jest.Mock).mockResolvedValue(noMembersBoard)

      await expect(
        columnService.update(mockColumnId, { title: 'Updated' }, mockUserId)
      ).rejects.toThrow('Unauthorized')
    })
  })

  describe('delete', () => {
    it('should delete empty column', async () => {
      const txMock = {
        column: {
          findUnique: jest.fn().mockResolvedValue({
            ...mockColumn,
            _count: { tasks: 0 },
            board: { members: [{ id: mockUserId }] },
          }),
          delete: jest.fn().mockResolvedValue(mockColumn),
        },
      }

      ;(prisma.$transaction as jest.Mock).mockImplementation((callback) =>
        callback(txMock)
      )

      const result = await columnService.delete(mockColumnId, mockUserId)

      expect(result).toEqual(mockColumn)
      expect(txMock.column.delete).toHaveBeenCalledWith({
        where: { id: mockColumnId },
      })
    })

    it('should fail to delete column with tasks', async () => {
      const txMock = {
        column: {
          findUnique: jest.fn().mockResolvedValue({
            ...mockColumn,
            _count: { tasks: 3 },
            board: { members: [{ id: mockUserId }] },
          }),
          delete: jest.fn(),
        },
      }

      ;(prisma.$transaction as jest.Mock).mockImplementation((callback) =>
        callback(txMock)
      )

      await expect(columnService.delete(mockColumnId, mockUserId)).rejects.toThrow(
        'Cannot delete column with tasks'
      )

      expect(txMock.column.delete).not.toHaveBeenCalled()
    })

    it('should throw when user is not a member', async () => {
      const txMock = {
        column: {
          findUnique: jest.fn().mockResolvedValue({
            ...mockColumn,
            board: { members: [] },
          }),
          delete: jest.fn(),
        },
      }

      ;(prisma.$transaction as jest.Mock).mockImplementation((callback) =>
        callback(txMock)
      )

      await expect(columnService.delete(mockColumnId, mockUserId)).rejects.toThrow(
        'Unauthorized'
      )
    })

    it('should reject multiple tasks', async () => {
      const txMock = {
        column: {
          findUnique: jest.fn().mockResolvedValue({
            ...mockColumn,
            _count: { tasks: 10 },
            board: { members: [{ id: mockUserId }] },
          }),
          delete: jest.fn(),
        },
      }

      ;(prisma.$transaction as jest.Mock).mockImplementation((callback) =>
        callback(txMock)
      )

      await expect(columnService.delete(mockColumnId, mockUserId)).rejects.toThrow(
        'Cannot delete column with tasks'
      )
    })
  })
})
