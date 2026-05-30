/** @format */

/**
 * Global Type Definitions
 * Common types used across the application
 */

/**
 * Action Response Type
 * Represents the result of a server action execution
 * Success state includes data, failure state includes validation errors
 */
export type ActionResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; message?: string; errors: Record<string, string[]> };

/**
 * Server Action Type
 * Signature for server action functions compatible with useActionState hook
 *
 * @template T - Type of data returned on success
 * @param _prevState - Previous action state (used for state updates)
 * @param formData - Form data from client submission
 * @returns Promise with action response (success or failure with errors)
 */
export type ActionType<T> = (
  _prevState: ActionResponse<T>,
  formData: FormData,
) => Promise<ActionResponse<T>>;

/** * Dictionary Type
 * Represents a collection of localized strings for UI components
 * Each key corresponds to a component or feature, containing relevant text
 */
export type Dict = typeof import("@/dictionaries/en.json");
