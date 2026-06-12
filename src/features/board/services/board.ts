/** @format */

import prisma from "@/lib/prisma";
import type { Prisma } from "@g/prisma/client";

/**
 * Board Service
 * Manages all board-related database operations including creation, retrieval, updates, and deletion
 * All operations enforce user authorization via members relationship
 */
export const boardService = {
	/**
	 * Get all boards for the current user, ordered by creation date (newest first)
	 * @param userId - Current user ID for filtering boards
	 * @returns Array of boards user is member of
	 */
	get: async (userId: string) => {
		return prisma.board.findMany({
			where: {
				members: {
					some: { id: userId },
				},
			},
			orderBy: { createdAt: "desc" },
		});
	},

	/**
	 * Get a single board with all its columns and tasks
	 * Verifies user is member of the board
	 * @param id - Board UUID
	 * @param userId - Current user ID for authorization
	 * @returns Board with nested columns and tasks, or null if not found or unauthorized
	 */
	getById: async (id: string, userId: string) => {
		return prisma.board.findUnique({
			where: { id },
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
					where: { id: userId },
				},
			},
		});
	},

	/**
	 * Create a new board with default columns
	 * Automatically initializes "To Do", "In Progress", "Done" columns and adds creator as member
	 * @param data - Board creation data (title, description)
	 * @param userId - Creator user ID
	 * @returns Newly created board with default columns
	 */
	create: async (data: Omit<Prisma.BoardCreateInput, 'members'>, userId: string) => {
		return prisma.board.create({
			data: {
				...data,
				members: {
					connect: { id: userId },
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
	},

	/**
	 * Update board title
	 * Verifies user is member before updating
	 * @param id - Board UUID
	 * @param data - Update payload with title
	 * @param userId - Current user ID for authorization
	 * @returns Updated board
	 */
	update: async (id: string, data: Prisma.BoardUpdateInput, userId: string) => {
		// Verify user is member of board
		const board = await prisma.board.findUnique({
			where: { id },
			include: { members: { where: { id: userId } } },
		});

		if (!board || board.members.length === 0) {
			throw new Error("Unauthorized: user is not a board member");
		}

		return prisma.board.update({
			where: { id },
			data: { title: data.title },
		});
	},

	/**
	 * Delete board and all cascading data (columns, tasks)
	 * Verifies user is member before deleting
	 * @param id - Board UUID
	 * @param userId - Current user ID for authorization
	 * @returns Deleted board data
	 */
	delete: async (id: string, userId: string) => {
		// Verify user is member of board
		const board = await prisma.board.findUnique({
			where: { id },
			include: { members: { where: { id: userId } } },
		});

		if (!board || board.members.length === 0) {
			throw new Error("Unauthorized: user is not a board member");
		}

		return prisma.board.delete({ where: { id } });
	},
};
