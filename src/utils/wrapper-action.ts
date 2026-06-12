/** @format */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type z from "zod";
import { getSession } from "./session";

/**
 * Action State Type
 * Represents the result of a server action - either success with data or failure with validation errors
 */
export type ActionState<TInput, TOutput> =
  | {
      success: true;
      data: TOutput;
      message?: string;
    }
  | {
      success: false;
      message?: string;
      errors: Partial<Record<keyof TInput, string[]>>;
    };

/**
 * Configuration options for server actions
 */
interface ActionOptions<TInput, TOutput> {
  // Identifier for logging and debugging
  actionName?: string;
  // Path(s) to revalidate after successful action
  revalidatePath?: string | ((data: TOutput, input: TInput) => string);
  // Redirect target after successful action
  redirectTo?: string | ((data: TOutput, input: TInput) => string);
}

/**
 * Database error with Prisma-specific fields
 */
interface DatabaseError extends Error {
  code?: string;
  digest?: string;
}

/**
 * Checks if error is a Next.js routing error (redirect/notFound)
 * These errors should not be caught as they control routing flow
 * @param error - Unknown error object
 * @returns True if error is Next.js routing related
 */
const isNextjsRoutingError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.message === "NEXT_REDIRECT" ||
      error.message === "NEXT_NOT_FOUND" ||
      (error as DatabaseError).digest?.startsWith("NEXT_REDIRECT") === true
    );
  }
  return false;
};

/**
 * Create a safe server action with validation, error handling, and caching
 *
 * Features:
 * - Zod schema validation with field-level error reporting
 * - Automatic session retrieval and user ID injection
 * - Database error handling with specific conflict detection
 * - Cache revalidation support
 * - Optional redirect on success
 * - Development-only logging to minimize production overhead
 *
 * @param schema - Zod schema for input validation
 * @param handler - Async handler function that processes validated input
 * @param options - Configuration for revalidation and redirect
 * @returns Server action function compatible with useActionState
 *
 * @example
 * const updateAction = createSafeAction(
 *   updateSchema,
 *   async (data, userId) => updateService.update(userId, data),
 *   { revalidatePath: "/dashboard", actionName: "updateItem" }
 * )
 */
export function createSafeAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  handler: (data: TInput, userId: string | undefined) => Promise<TOutput>,
  options?: ActionOptions<TInput, TOutput>,
) {
  return async (
    _prevState: ActionState<TInput, TOutput>,
    formData: FormData,
  ): Promise<ActionState<TInput, TOutput>> => {
    const actionCtx = options?.actionName || "UnnamedAction";
    const isDev = process.env.NODE_ENV === "development";

    if (isDev) console.log(`[ACTION_START] [${actionCtx}] Initialization...`);

    // Parse form data and validate against schema
    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = schema.safeParse(rawData);

    if (!validatedFields.success) {
      const fieldErrors = validatedFields.error.flatten()
        .fieldErrors as Partial<Record<keyof TInput, string[]>>;

      if (isDev) {
        console.warn(`[ACTION_VALIDATION_ERROR] [${actionCtx}]`, {
          input: rawData,
          errors: fieldErrors,
        });
      }

      return {
        success: false,
        message: "Validation error",
        errors: fieldErrors,
      };
    }

    const inputData = validatedFields.data;
    let result: TOutput;

    // Execute handler with session context
    try {
      const session = await getSession();
      result = await handler(inputData, session?.id);

      if (isDev) {
        console.log(`[ACTION_SUCCESS] [${actionCtx}] Completed successfully.`);
      }

      // Revalidate cache if specified
      if (options?.revalidatePath) {
        const path =
          typeof options.revalidatePath === "function"
            ? options.revalidatePath(result, inputData)
            : options.revalidatePath;
        revalidatePath(path);
        if (isDev) {
          console.log(
            `[ACTION_REVALIDATE] [${actionCtx}] Path revalidated: ${path}`,
          );
        }
      }
    } catch (error: unknown) {
      // Let Next.js routing errors propagate
      if (isNextjsRoutingError(error)) {
        if (isDev) {
          console.log(
            `[ACTION_ROUTING] [${actionCtx}] Next.js routing detected (redirect/notFound).`,
          );
        }
        throw error;
      }

      const dbError = error as DatabaseError;

      // Handle database uniqueness constraint violations
      if (dbError.code === "P2002") {
        if (isDev) {
          console.warn(
            `[ACTION_DB_CONFLICT] [${actionCtx}] Uniqueness conflict (P2002):`,
            {
              input: inputData,
              errorMessage: dbError.message,
            },
          );
        }

        // Provide field-specific error messages for common constraints
        let fieldError = "Record with this data already exists";
        if (dbError.message.includes("email")) {
          fieldError = "This email is already registered";
        }

        return {
          success: false,
          message: fieldError,
          errors: {},
        };
      }

      // Handle application-level validation errors (from services)
      if (error instanceof Error && error.message.includes("email")) {
        if (isDev) {
          console.warn(`[ACTION_VALIDATION] [${actionCtx}] Email validation error:`, {
            input: inputData,
            errorMessage: error.message,
          });
        }

        return {
          success: false,
          message: error.message,
          errors: {},
        };
      }

      // Log production errors with minimal context
      console.error(
        `[ACTION_ERROR] [${actionCtx}] ${error instanceof Error ? error.message : "Unexpected error"}`,
      );
      if (isDev) {
        console.error({
          stack: error instanceof Error ? error.stack : error,
          input: inputData,
        });
      }

      // Hide implementation details in production
      const message = isDev && error instanceof Error ? error.message : "An error occurred during processing";

      return {
        success: false,
        message,
        errors: {},
      };
    }

    // Redirect after successful action (outside try/catch to ensure it executes)
    if (options?.redirectTo) {
      const target =
        typeof options.redirectTo === "function"
          ? options.redirectTo(result, inputData)
          : options.redirectTo;

      if (isDev) {
        console.log(
          `[ACTION_REDIRECT] [${actionCtx}] Redirecting to: ${target}`,
        );
      }
      redirect(target);
    }

    return {
      success: true,
      message: "Operation successful",
      data: result,
    };
  };
}
