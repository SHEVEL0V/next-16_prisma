/** @format */

import prisma from "@/lib/prisma";
import type { Prisma } from "@g/prisma/client";

/**
 * Task Service
 * Manages task CRUD operations, ordering, and relationships with columns
 * All operations enforce user authorization via board membership
 */
export const taskService = {
	/**
	 * Get task by ID
	 * @param id - Task UUID
	 * @returns Task data
	 */
	getById: async (id: string) =>
		await prisma.task.findUnique({ where: { id } }),

	/**
	 * Create new task in column with automatic ordering
	 * Verifies user is member of the board
	 * @param columnId - Target column UUID
	 * @param title - Task title
	 * @param userId - Current user ID for authorization
	 * @returns Newly created task with calculated order
	 */
	create: async (columnId: string, title: string, userId: string) => {
		return await prisma.$transaction(async (tx) => {
			// Verify user is member of board
			const column = await tx.column.findUnique({
				where: { columnId },
				include: {
					board: {
						include: { members: { where: { id: userId } } },
					},
				},
			});

			if (!column || column.board.members.length === 0) {
				throw new Error("Unauthorized: user is not a board member");
			}

			const lastTask = await tx.task.findFirst({
				where: { columnId },
				orderBy: { order: "desc" },
			});
			const order = lastTask ? lastTask.order + 1000 : 1000;

			return tx.task.create({
				data: { title, columnId, order },
			});
		});
	},

	/**
	 * Update task properties
	 * Verifies user is member of the board
	 * @param taskId - Task UUID
	 * @param data - Update payload (title, description, priority, etc.)
	 * @param userId - Current user ID for authorization
	 * @returns Updated task
	 */
	update: async (taskId: string, data: Partial<Prisma.TaskUpdateInput>, userId: string) => {
		const task = await prisma.task.findUnique({
			where: { id: taskId },
			include: {
				column: {
					include: {
						board: {
							include: { members: { where: { id: userId } } },
						},
					},
				},
			},
		});

		if (!task || task.column.board.members.length === 0) {
			throw new Error("Unauthorized: user is not a board member");
		}

		return prisma.task.update({
			where: { id: taskId },
			data,
		});
	},

	/**
	 * Delete task by ID
	 * Verifies user is member of the board
	 * @param id - Task UUID
	 * @param userId - Current user ID for authorization
	 * @returns Deleted task data
	 */
	delete: async (id: string, userId: string) => {
		const task = await prisma.task.findUnique({
			where: { id },
			include: {
				column: {
					include: {
						board: {
							include: { members: { where: { id: userId } } },
						},
					},
				},
			},
		});

		if (!task || task.column.board.members.length === 0) {
			throw new Error("Unauthorized: user is not a board member");
		}

		return prisma.task.delete({ where: { id } });
	},

	/**
	 * Reorder task to different position/column
	 * Updates both order and columnId for drag-and-drop operations
	 * Verifies user is member of the board
	 * @param id - Task UUID
	 * @param order - New order value
	 * @param columnId - Target column UUID
	 * @param userId - Current user ID for authorization
	 * @returns Updated task with new position
	 */
	reorder: async (id: string, order: number, columnId: string, userId: string) => {
		const task = await prisma.task.findUnique({
			where: { id },
			include: {
				column: {
					include: {
						board: {
							include: { members: { where: { id: userId } } },
						},
					},
				},
			},
		});

		if (!task || task.column.board.members.length === 0) {
			throw new Error("Unauthorized: user is not a board member");
		}

		return prisma.task.update({
			where: { id },
			data: {
				order,
				columnId,
			},
		});
	},
};
