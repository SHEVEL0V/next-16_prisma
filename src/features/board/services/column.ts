/** @format */

import prisma from "@/lib/prisma";

/**
 * Column Service
 * Handles column operations within boards (create, read, update, delete, reorder)
 * All operations enforce user authorization via board membership
 */
export const columnService = {
	/**
	 * Get column by ID
	 * @param id - Column UUID
	 * @returns Column data without tasks
	 */
	getById: async (id: string) =>
		await prisma.column.findUnique({ where: { id } }),

	/**
	 * Create new column with automatic ordering
	 * Assigns order value 1000 units higher than last column
	 * Verifies user is member of the board
	 * @param boardId - Parent board UUID
	 * @param title - Column title
	 * @param userId - Current user ID for authorization
	 * @returns Newly created column with calculated order
	 */
	create: async (boardId: string, title: string, userId: string) => {
		return await prisma.$transaction(async (tx) => {
			// Verify user is member of board
			const board = await tx.board.findUnique({
				where: { id: boardId },
				include: { members: { where: { id: userId } } },
			});

			if (!board || board.members.length === 0) {
				throw new Error("Unauthorized: user is not a board member");
			}

			const lastColumn = await tx.column.findFirst({
				where: { boardId },
				orderBy: { order: "desc" },
			});

			const newOrder = lastColumn ? lastColumn.order + 1000 : 1000;

			return tx.column.create({
				data: { title, order: newOrder, boardId },
			});
		});
	},

	/**
	 * Update column title or order
	 * Verifies user is member of the board
	 * @param id - Column UUID
	 * @param data - Update payload (title, order)
	 * @param userId - Current user ID for authorization
	 * @returns Updated column
	 */
	update: async (id: string, data: { title?: string; order?: number }, userId: string) => {
		const column = await prisma.column.findUnique({
			where: { id },
			include: {
				board: {
					include: { members: { where: { id: userId } } },
				},
			},
		});

		if (!column || column.board.members.length === 0) {
			throw new Error("Unauthorized: user is not a board member");
		}

		return prisma.column.update({
			where: { id },
			data,
		});
	},

	/**
	 * Delete column with validation
	 * Prevents deletion if column contains tasks
	 * Verifies user is member of the board
	 * @param id - Column UUID
	 * @param userId - Current user ID for authorization
	 * @throws Error if column has tasks or user unauthorized
	 * @returns Deleted column data
	 */
	delete: async (id: string, userId: string) => {
		return await prisma.$transaction(async (tx) => {
			const column = await tx.column.findUnique({
				where: { id },
				include: {
					_count: { select: { tasks: true } },
					board: {
						include: { members: { where: { id: userId } } },
					},
				},
			});

			if (!column || column.board.members.length === 0) {
				throw new Error("Unauthorized: user is not a board member");
			}

			if (column._count.tasks > 0) {
				throw new Error("Cannot delete column with tasks");
			}

			return tx.column.delete({ where: { id } });
		});
	},
};
