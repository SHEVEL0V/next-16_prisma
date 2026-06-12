/** @format */
"use server";
import { createSafeAction } from "@/utils/wrapper-action";

import { boardService } from "./services/board";
import { columnService } from "./services/column";
import { taskService } from "./services/task";
import {
	boardSchema,
	columnSchema,
	reorderSchema,
	deleteTaskSchema,
	deleteBoardSchema,
	updateBoardSchema,
	updateTaskSchema,
	createTaskSchema,
	updateColumnTitleSchema,
	updateTaskPrioritySchema,
	updateTaskDetailsSchema,
	deleteColumnSchema,
} from "./schema";

/**
 * Board Server Actions
 * Form-based mutations with automatic validation and error handling
 * All actions use createSafeAction wrapper for consistency
 * All mutations enforce user authorization via userId injection
 */

// ========== BOARD ACTIONS ==========

/**
 * Create new Kanban board
 * Automatically initializes three default columns (To Do, In Progress, Done)
 *
 * @action
 * @schema boardSchema - Requires { title, description? }
 * @returns Newly created board with default columns
 * @revalidate Revalidates root path to update board list
 */
export const createBoardAction = createSafeAction(
	boardSchema,
	async (data, userId) => {
		if (!userId) throw new Error("Unauthorized: user ID required");
		return await boardService.create(data, userId);
	},
	{ revalidatePath: "/" },
);

/**
 * Update board properties (title)
 *
 * @action
 * @schema updateBoardSchema - Requires { id, title }
 * @returns Updated board
 * @revalidate Revalidates root path
 */
export const updateBoardAction = createSafeAction(
	updateBoardSchema,
	async ({ id, ...data }, userId) => {
		if (!userId) throw new Error("Unauthorized: user ID required");
		return await boardService.update(id, data, userId);
	},
	{ revalidatePath: "/" },
);

/**
 * Delete board and all cascading data (columns, tasks)
 *
 * @action
 * @schema deleteBoardSchema - Requires { id }
 * @returns Deleted board data
 * @revalidate Revalidates root path
 */
export const deleteBoardAction = createSafeAction(
	deleteBoardSchema,
	async ({ id }, userId) => {
		if (!userId) throw new Error("Unauthorized: user ID required");
		return await boardService.delete(id, userId);
	},
	{ revalidatePath: "/" },
);

// ========== COLUMN ACTIONS ==========

/**
 * Create new column in board
 * Automatically calculates order value (1000 units higher than last column)
 *
 * @action
 * @schema columnSchema - Requires { boardId, title }
 * @returns Newly created column
 * @revalidate Revalidates board-specific path
 */
export const createColumnAction = createSafeAction(
	columnSchema,
	async ({ boardId, title }, userId) => {
		if (!userId) throw new Error("Unauthorized: user ID required");
		return await columnService.create(boardId, title, userId);
	},
	{ revalidatePath: (data) => `/board/${data.boardId}` },
);

/**
 * Update column title
 *
 * @action
 * @schema updateColumnTitleSchema - Requires { id, title }
 * @returns Updated column
 * @revalidate Revalidates root path
 */
export const updateColumnAction = createSafeAction(
	updateColumnTitleSchema,
	async ({ id, title }, userId) => {
		if (!userId) throw new Error("Unauthorized: user ID required");
		return await columnService.update(id, { title }, userId);
	},
	{ revalidatePath: "/" },
);

/**
 * Delete column (only if empty)
 * Prevents deletion if column contains tasks
 *
 * @action
 * @schema deleteColumnSchema - Requires { id }
 * @returns Deleted column data
 * @revalidate Revalidates root path
 * @throws Error if column contains tasks
 */
export const deleteColumnAction = createSafeAction(
	deleteColumnSchema,
	async ({ id }, userId) => {
		if (!userId) throw new Error("Unauthorized: user ID required");
		return await columnService.delete(id, userId);
	},
	{ revalidatePath: "/" },
);

/**
 * Reorder column or task via drag-and-drop
 * Handles both column and task reordering with proper order calculation
 *
 * @action
 * @schema reorderSchema - Requires { id, type ("column"|"task"), order, columnId? }
 * @returns Reordered item (Column or Task)
 * @revalidate Revalidates root path
 * @throws Error if task reorder missing columnId
 */
export const reorderAction = createSafeAction(
	reorderSchema,
	async ({ id, type, order, columnId }, userId) => {
		if (!userId) throw new Error("Unauthorized: user ID required");

		if (type === "column") {
			return await columnService.update(id, { order: parseInt(order) }, userId);
		} else if (type === "task") {
			if (!columnId) throw new Error("Invalid request: columnId required for task reordering");
			return await taskService.reorder(id, parseInt(order), columnId, userId);
		}

		throw new Error("Invalid reorder type");
	},
	{ revalidatePath: "/" },
);

// ========== TASK ACTIONS ==========

/**
 * Create new task in column
 * Automatically calculates order value (1000 units higher than last task)
 *
 * @action
 * @schema createTaskSchema - Requires { title, columnId, boardId? }
 * @returns Newly created task
 * @revalidate Revalidates root path
 */
export const createTaskAction = createSafeAction(
	createTaskSchema,
	async ({ columnId, title }, userId) => {
		if (!userId) throw new Error("Unauthorized: user ID required");
		return await taskService.create(columnId, title, userId);
	},
	{ revalidatePath: "/" },
);

/**
 * Update task title
 *
 * @action
 * @schema updateTaskSchema - Requires { id, title }
 * @returns Updated task
 * @revalidate Revalidates root path
 */
export const updateTaskAction = createSafeAction(
	updateTaskSchema,
	async ({ id, title }, userId) => {
		if (!userId) throw new Error("Unauthorized: user ID required");
		return await taskService.update(id, { title }, userId);
	},
	{ revalidatePath: "/" },
);

/**
 * Update task priority level
 *
 * @action
 * @schema updateTaskPrioritySchema - Requires { id, priority ("LOW"|"MEDIUM"|"HIGH"|"URGENT") }
 * @returns Updated task
 * @revalidate Revalidates root path
 */
export const updateTaskPriorityAction = createSafeAction(
	updateTaskPrioritySchema,
	async ({ id, priority }, userId) => {
		if (!userId) throw new Error("Unauthorized: user ID required");
		return await taskService.update(id, { priority }, userId);
	},
	{ revalidatePath: "/" },
);

/**
 * Update task details (title and description)
 * Full task update for detailed editing
 *
 * @action
 * @schema updateTaskDetailsSchema - Requires { id, title, description? }
 * @returns Updated task
 * @revalidate Revalidates root path
 */
export const updateTaskDetailsAction = createSafeAction(
	updateTaskDetailsSchema,
	async ({ id, title, description }, userId) => {
		if (!userId) throw new Error("Unauthorized: user ID required");
		return await taskService.update(id, { title, description }, userId);
	},
	{ revalidatePath: "/" },
);

/**
 * Delete task by ID
 *
 * @action
 * @schema deleteTaskSchema - Requires { id }
 * @returns Deleted task data
 * @revalidate Revalidates root path
 */
export const deleteTaskAction = createSafeAction(
	deleteTaskSchema,
	async ({ id }, userId) => {
		if (!userId) throw new Error("Unauthorized: user ID required");
		return await taskService.delete(id, userId);
	},
	{ revalidatePath: "/" },
);
