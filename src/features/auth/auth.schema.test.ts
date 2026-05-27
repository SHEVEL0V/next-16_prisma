import { loginSchema, registerSchema } from "@/features/auth/schema";

describe("Auth Schemas", () => {
  describe("loginSchema", () => {
    it("should validate valid login credentials", () => {
      const validData = {
        email: "user@example.com",
        password: "password123",
      };
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should fail with invalid email format", () => {
      const invalidData = {
        email: "invalid-email",
        password: "password123",
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should fail when email is empty", () => {
      const invalidData = {
        email: "",
        password: "password123",
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should fail when password is too short", () => {
      const invalidData = {
        email: "user@example.com",
        password: "12345",
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should fail when password is empty", () => {
      const invalidData = {
        email: "user@example.com",
        password: "",
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept valid email formats", () => {
      const validEmails = ["user@example.com", "test.user@example.co.uk", "user+tag@example.com"];

      validEmails.forEach((email) => {
        const result = loginSchema.safeParse({
          email,
          password: "password123",
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe("registerSchema", () => {
    it("should validate valid registration data", () => {
      const validData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
      };
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should fail when name is too short", () => {
      const invalidData = {
        name: "Jo",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should trim whitespace from name", () => {
      const data = {
        name: "  John Doe  ",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("John Doe");
      }
    });

    it("should fail with invalid email", () => {
      const invalidData = {
        name: "John Doe",
        email: "invalid-email",
        password: "password123",
        confirmPassword: "password123",
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should fail when passwords do not match", () => {
      const invalidData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password456",
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success && result.error.issues) {
        const confirmPasswordError = result.error.issues.find(
          (e) => e.path?.[0] === "confirmPassword",
        );
        expect(confirmPasswordError?.message).toContain("do not match");
      }
    });

    it("should fail when password is too short", () => {
      const invalidData = {
        name: "John Doe",
        email: "john@example.com",
        password: "123",
        confirmPassword: "123",
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should fail with missing required fields", () => {
      const incompleteData = {
        name: "John Doe",
        email: "john@example.com",
      };
      const result = registerSchema.safeParse(incompleteData);
      expect(result.success).toBe(false);
    });

    it("should accept passwords of exactly 6 characters", () => {
      const data = {
        name: "John Doe",
        email: "john@example.com",
        password: "123456",
        confirmPassword: "123456",
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should handle special characters in password", () => {
      const data = {
        name: "John Doe",
        email: "john@example.com",
        password: "P@ssw0rd!",
        confirmPassword: "P@ssw0rd!",
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("Error Messages", () => {
    it("should provide Ukrainian error message for invalid email", () => {
      const result = loginSchema.safeParse({
        email: "invalid",
        password: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success && result.error.issues) {
        const emailError = result.error.issues.find((e) => e.path?.[0] === "email");
        expect(emailError?.message).toBeDefined();
      }
    });

    it("should provide Ukrainian error message for short password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "123",
      });
      expect(result.success).toBe(false);
      if (!result.success && result.error.issues) {
        const passwordError = result.error.issues.find((e) => e.path?.[0] === "password");
        expect(passwordError?.message).toBeDefined();
      }
    });
  });
});
