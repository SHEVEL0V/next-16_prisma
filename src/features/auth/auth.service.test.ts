/**
 * @jest-environment node
 */

import { authService } from "@/features/auth/services";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

// Mock dependencies
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("bcrypt");

// Mock session utils to avoid jose import issues
jest.mock("@/utils/session", () => ({
  createSession: jest.fn().mockResolvedValue(undefined),
}));

describe("Auth Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    id: "user-123",
    name: "John Doe",
    email: "john@example.com",
    password: "$2b$10$hashed_password",
    position: "Developer",
    bio: "A developer",
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("login", () => {
    it("should login user with valid credentials", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login({
        email: "john@example.com",
        password: "password123",
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "john@example.com" },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith("password123", mockUser.password);
      expect((result as Record<string, unknown>).password).toBeUndefined();
      expect(result.email).toBe("john@example.com");
    });

    it("should throw error with invalid password", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({
          email: "john@example.com",
          password: "wrongpassword",
        }),
      ).rejects.toThrow("Invalid email or password");
    });

    it("should throw error with non-existent user", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({
          email: "nonexistent@example.com",
          password: "password123",
        }),
      ).rejects.toThrow("Invalid email or password");
    });

    it("should use timing-safe comparison for non-existent users", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await authService
        .login({
          email: "nonexistent@example.com",
          password: "password123",
        })
        .catch(() => {});

      // Should compare with fake hash to prevent user enumeration
      expect(bcrypt.compare).toHaveBeenCalledWith("password123", "fake_hash");
    });

    it("should not return password in response", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login({
        email: "john@example.com",
        password: "password123",
      });

      expect(result).not.toHaveProperty("password");
      expect(Object.keys(result)).toContain("id");
      expect(Object.keys(result)).toContain("email");
    });
  });

  describe("register", () => {
    it("should register new user with valid data", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("$2b$10$hashed_new_password");
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.register({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "john@example.com" },
        select: { id: true },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(prisma.user.create).toHaveBeenCalled();
      expect((result as Record<string, unknown>).password).toBeUndefined();
    });

    it("should throw error if email already exists", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "existing-user",
      });

      await expect(
        authService.register({
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
        }),
      ).rejects.toThrow("User with this email already exists");
    });

    it("should hash password with correct salt rounds", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("$2b$10$hashed");
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      await authService.register({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      });

      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    });

    it("should not return password in response", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("$2b$10$hashed");
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.register({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      });

      expect(result).not.toHaveProperty("password");
      expect(Object.keys(result)).toContain("id");
      expect(Object.keys(result)).toContain("email");
    });

    it("should store hashed password in database", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("$2b$10$hashed_new_password");
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      await authService.register({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: "John Doe",
          email: "john@example.com",
          password: "$2b$10$hashed_new_password",
        },
      });
    });

    it("should handle bcrypt errors", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error("Hash failed"));

      await expect(
        authService.register({
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
        }),
      ).rejects.toThrow("Hash failed");
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors during login", async () => {
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error("Database error"));

      await expect(
        authService.login({
          email: "john@example.com",
          password: "password123",
        }),
      ).rejects.toThrow("Database error");
    });

    it("should handle database errors during registration", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("$2b$10$hashed");
      (prisma.user.create as jest.Mock).mockRejectedValue(new Error("Database error"));

      await expect(
        authService.register({
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
        }),
      ).rejects.toThrow("Database error");
    });
  });
});
