/** @format */

/**
 * Authentication Validation Schemas
 * Zod schemas for login and registration
 * Provides client-side and server-side validation with English error messages
 */

import { z } from "zod";

import type { AuthInput, RegisterInput } from "./services";

export interface RegisterInputT extends RegisterInput {
  confirmPassword: string;
}

/**
 * Name validation
 * Minimum 3 characters, whitespace trimmed
 */
const name = z.string().trim().min(3, "Name is too short");

/**
 * Email validation
 * Must be valid email format
 */
const email = z.email("Invalid email format").min(1, "Email is required");

/**
 * Password validation
 * Minimum 6 characters for basic security
 * In production, consider 12+ characters and complexity requirements
 */
const password = z.string().min(6, "Password must be at least 6 characters");

/**
 * Password confirmation field
 * Used to verify password match during registration
 */
const confirmPassword = z.string().min(6, "Password must be at least 6 characters");

/**
 * Login schema
 * Used for sign-in form validation
 * Validates email and password format
 */
export const loginSchema: z.ZodType<AuthInput> = z.object({
  email,
  password,
});

/**
 * Registration schema
 * Used for sign-up form validation
 * Includes all-required fields with password matching check
 */
export const registerSchema: z.ZodType<RegisterInput> = z
  .object({
    name,
    email,
    password,
    confirmPassword,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
