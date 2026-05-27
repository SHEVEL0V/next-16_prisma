/** @format */

/**
 * Board Feature Validation Schemas
 * Zod schemas for all board-related operations
 * Provides type-safe validation and English error messages
 */

import z from "zod";

/**
 * Board creation schema
 * Used when creating new boards
 */
export const boardSchema = z.object({
  title: z.string().min(1, "Title is required").max(50),
  description: z.string().max(255).optional(),
});

/**
 * Column creation schema
 * Requires parent board ID and column title
 */
export const columnSchema = z.object({
  title: z.string().min(1, "Title is required"),
  boardId: z.uuid(),
});

/**
 * Column title update schema
 * For inline column title editing
 */
export const updateColumnTitleSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1, "Task cannot be empty"),
});

/**
 * Drag-and-drop reorder schema
 * Handles both column and task reordering
 * columnId is required when type is "task"
 */
export const reorderSchema = z.object({
  id: z.uuid(),
  type: z.enum(["column", "task"]),
  order: z.string(),
  columnId: z.uuid().optional(),
});

/**
 * Task creation schema
 * Requires title and parent column ID
 */
export const createTaskSchema = z.object({
  title: z.string().min(1, "Task cannot be empty"),
  columnId: z.uuid(),
  boardId: z.uuid().optional(),
});

/**
 * Task title update schema
 * For quick title editing
 */
export const updateTaskSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1, "Task cannot be empty"),
});

/**
 * Task priority update schema
 * Priority can be LOW, MEDIUM, HIGH, or URGENT
 */
export const updateTaskPrioritySchema = z.object({
  id: z.uuid(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

/**
 * Task details update schema
 * Comprehensive task editing including title and description
 */
export const updateTaskDetailsSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(1000).optional(),
});

/**
 * Board update schema
 * For board title modifications
 */
export const updateBoardSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1, "Title is required"),
});

/**
 * Task deletion schema
 * Validates task ID for deletion
 */
export const deleteTaskSchema = z.object({ id: z.uuid() });

/**
 * Column deletion schema
 * Validates column ID for deletion (column must be empty)
 */
export const deleteColumnSchema = z.object({ id: z.uuid() });

/**
 * Board deletion schema
 * Validates board ID for deletion (cascades to columns and tasks)
 */
export const deleteBoardSchema = z.object({ id: z.uuid() });
