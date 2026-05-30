/**
 * Tests for FormErrorAlert component
 * Verifies form submission error and success message display
 */

import { render, screen } from "@testing-library/react";

// Mock the Alert component to avoid dependency issues
jest.mock("@mui/material", () => ({
  ...jest.requireActual("@mui/material"),
  Alert: ({ children, severity }: { children: React.ReactNode; severity: string }) => (
    <div role="alert" data-severity={severity}>
      {children}
    </div>
  ),
}));

import FormErrorAlert from "@/features/form/components/form-error-alert";
import type { ActionResponse } from "@/types";

describe("FormErrorAlert Component", () => {
  describe("rendering", () => {
    it("should not render when no message", () => {
      const state: ActionResponse<Record<string, unknown>> = {
        success: false,
        errors: {},
        message: "",
      };

      const { container } = render(<FormErrorAlert state={state} />);
      expect(container.firstChild).toBeNull();
    });

    it("should render error alert on failure", () => {
      const state: ActionResponse<Record<string, unknown>> = {
        success: false,
        errors: {},
        message: "Operation failed",
      };

      render(<FormErrorAlert state={state} />);

      expect(screen.getByText("Operation failed")).toBeInTheDocument();
      const alert = screen.getByRole("alert");
      expect(alert).toHaveAttribute("data-severity", "error");
    });

    it("should render success alert on success", () => {
      const state: ActionResponse<Record<string, unknown>> = {
        success: true,
        data: {},
        message: "Operation successful",
      };

      render(<FormErrorAlert state={state} />);

      expect(screen.getByText("Operation successful")).toBeInTheDocument();
      const alert = screen.getByRole("alert");
      expect(alert).toHaveAttribute("data-severity", "success");
    });
  });

  describe("custom message override", () => {
    it("should use custom message over state message", () => {
      const state: ActionResponse<Record<string, unknown>> = {
        success: false,
        errors: {},
        message: "Original message",
      };

      render(<FormErrorAlert state={state} message="Custom message" />);

      expect(screen.getByText("Custom message")).toBeInTheDocument();
      expect(screen.queryByText("Original message")).not.toBeInTheDocument();
    });
  });

  describe("message types", () => {
    it("should handle error state message", () => {
      const state: ActionResponse<Record<string, unknown>> = {
        success: false,
        errors: { email: ["Invalid email"] },
        message: "Validation failed",
      };

      render(<FormErrorAlert state={state} />);
      expect(screen.getByText("Validation failed")).toBeInTheDocument();
    });

    it("should handle success state message", () => {
      const state: ActionResponse<Record<string, unknown>> = {
        success: true,
        data: {},
        message: "Changes saved successfully",
      };

      render(<FormErrorAlert state={state} />);
      expect(screen.getByText("Changes saved successfully")).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("should handle empty message string", () => {
      const state: ActionResponse<Record<string, unknown>> = {
        success: false,
        errors: {},
        message: "",
      };

      const { container } = render(<FormErrorAlert state={state} />);
      expect(container.firstChild).toBeNull();
    });

    it("should handle undefined message", () => {
      const state: ActionResponse<Record<string, unknown>> = {
        success: false,
        errors: {},
      };

      const { container } = render(<FormErrorAlert state={state} />);
      expect(container.firstChild).toBeNull();
    });

    it("should handle long messages", () => {
      const longMessage = "A".repeat(500);
      const state: ActionResponse<Record<string, unknown>> = {
        success: false,
        errors: {},
        message: longMessage,
      };

      render(<FormErrorAlert state={state} />);
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });
  });
});
