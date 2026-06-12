/**
 * @jest-environment node
 */

import { taskService } from '@/features/board/services/task'
import prisma from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    task: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback({
      task: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    })),
  },
}))

describe('Task Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockTaskId = 'task-123'
  const mockColumnId = 'col-123'
  const mockUserId = 'user-123'

  const mockTask = {
    id: mockTaskId,
    title: 'Test Task',
    description: null,
    order: 1000,
    columnId: mockColumnId,
    priority: 'MEDIUM',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockTaskWithBoard = {
    ...mockTask,
    column: {
      boardId: 'board-123',
      board: {
        members: [{ id: mockUserId }],
      },
    },
  }

  describe('getById', () => {
    it('should fetch task by ID', async () => {
      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask)

      const result = await taskService.getById(mockTaskId)

      expect(prisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: mockTaskId },
      })
      expect(result).toEqual(mockTask)
    })

    it('should return null when task does not exist', async () => {
      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await taskService.getById('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('create', () => {
    it('should create task with calculated order', async () => {
      const mockLastTask = { ...mockTask, order: 2000 }
      const newTask = { ...mockTask, order: 3000 }

      const txMock = {
        column: {
          findUnique: jest.fn().mockResolvedValue({
            board: { members: [{ id: mockUserId }] },
          }),
        },
        task: {
          findFirst: jest.fn().mockResolvedValue(mockLastTask),
          create: jest.fn().mockResolvedValue(newTask),
        },
      }

      ;(prisma.$transaction as jest.Mock).mockImplementation((callback) =>
        callback(txMock)
      )

      const result = await taskService.create(mockColumnId, 'New Task', mockUserId)

      expect(result).toEqual(newTask)
      expect(txMock.task.create).toHaveBeenCalledWith({
        data: { title: 'New Task', columnId: mockColumnId, order: 3000 },
      })
    })

    it('should set initial order to 1000 when no tasks exist', async () => {
      const newTask = { ...mockTask, order: 1000 }

      const txMock = {
        column: {
          findUnique: jest.fn().mockResolvedValue({
            board: { members: [{ id: mockUserId }] },
          }),
        },
        task: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue(newTask),
        },
      }

      ;(prisma.$transaction as jest.Mock).mockImplementation((callback) =>
        callback(txMock)
      )

      const result = await taskService.create(mockColumnId, 'First Task', mockUserId)

      expect(result.order).toBe(1000)
    })

    it('should throw when user is not a member', async () => {
      const txMock = {
        column: {
          findUnique: jest.fn().mockResolvedValue({
            board: { members: [] },
          }),
        },
      }

      ;(prisma.$transaction as jest.Mock).mockImplementation((callback) =>
        callback(txMock)
      )

      await expect(taskService.create(mockColumnId, 'Task', mockUserId)).rejects.toThrow(
        'Unauthorized'
      )
    })
  })

  describe('update', () => {
    it('should update task title', async () => {
      const updatedTask = { ...mockTask, title: 'Updated Title' }
      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTaskWithBoard)
      ;(prisma.task.update as jest.Mock).mockResolvedValue(updatedTask)

      const result = await taskService.update(mockTaskId, { title: 'Updated Title' }, mockUserId)

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: mockTaskId },
        data: { title: 'Updated Title' },
      })
      expect(result.title).toBe('Updated Title')
    })

    it('should throw when user is not a member', async () => {
      const noMembersTask = {
        ...mockTask,
        column: { board: { members: [] } },
      }
      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(noMembersTask)

      await expect(taskService.update(mockTaskId, { title: 'Updated' }, mockUserId)).rejects.toThrow(
        'Unauthorized'
      )
    })
  })

  describe('delete', () => {
    it('should delete task by ID', async () => {
      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTaskWithBoard)
      ;(prisma.task.delete as jest.Mock).mockResolvedValue(mockTask)

      const result = await taskService.delete(mockTaskId, mockUserId)

      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: mockTaskId },
      })
      expect(result).toEqual(mockTask)
    })

    it('should throw when user is not a member', async () => {
      const noMembersTask = {
        ...mockTask,
        column: { board: { members: [] } },
      }
      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(noMembersTask)

      await expect(taskService.delete(mockTaskId, mockUserId)).rejects.toThrow('Unauthorized')
    })
  })

  describe('reorder', () => {
    it('should reorder task in same column', async () => {
      const reorderedTask = { ...mockTask, order: 2500 }
      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTaskWithBoard)
      ;(prisma.task.update as jest.Mock).mockResolvedValue(reorderedTask)

      const result = await taskService.reorder(mockTaskId, 2500, mockColumnId, mockUserId)

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: mockTaskId },
        data: { order: 2500, columnId: mockColumnId },
      })
      expect(result.order).toBe(2500)
    })

    it('should move task to different column', async () => {
      const newColumnId = 'col-456'
      const movedTask = {
        ...mockTask,
        columnId: newColumnId,
        order: 1000,
      }
      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTaskWithBoard)
      ;(prisma.task.update as jest.Mock).mockResolvedValue(movedTask)

      const result = await taskService.reorder(mockTaskId, 1000, newColumnId, mockUserId)

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: mockTaskId },
        data: { order: 1000, columnId: newColumnId },
      })
      expect(result.columnId).toBe(newColumnId)
    })

    it('should throw when user is not a member', async () => {
      const noMembersTask = {
        ...mockTask,
        column: { board: { members: [] } },
      }
      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(noMembersTask)

      await expect(taskService.reorder(mockTaskId, 2500, mockColumnId, mockUserId)).rejects.toThrow(
        'Unauthorized'
      )
    })
  })

  describe('getAllInfo', () => {
    it('should fetch all tasks with relationships', async () => {
      const mockTasks = [
        {
          ...mockTask,
          column: {
            id: mockColumnId,
            title: 'Column',
            board: { id: 'board-123', title: 'Board' },
          },
        },
      ]

      ;(prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks)

      const result = await taskService.getAllInfo()

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        include: {
          column: {
            include: {
              board: true,
            },
          },
        },
      })
      expect(result).toEqual(mockTasks)
      expect(result[0].column.board).toBeDefined()
    })

    it('should return empty array when no tasks exist', async () => {
      ;(prisma.task.findMany as jest.Mock).mockResolvedValue([])

      const result = await taskService.getAllInfo()

      expect(result).toEqual([])
    })

    it('should include nested board data', async () => {
      const mockTasks = [
        {
          ...mockTask,
          column: {
            id: mockColumnId,
            title: 'To Do',
            board: {
              id: 'board-456',
              title: 'My Board',
              userId: 'user-123',
            },
          },
        },
      ]

      ;(prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks)

      const result = await taskService.getAllInfo()

      expect(result[0].column.board.title).toBe('My Board')
    })
  })
})
