/**
 * Tests for ModalActions component
 * Verifies modal action buttons and form handling
 */

import { render, screen, fireEvent } from "@testing-library/react";

// Mock the Button component to avoid dependency issues
jest.mock("@/components/ui/buttons", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    loading,
    type,
    form,
    variant,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    type?: "button" | "submit" | "reset";
    form?: string;
    variant?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      type={type || "button"}
      form={form}
      data-variant={variant}
    >
      {children}
    </button>
  ),
}));

import ModalActions from "@/features/modal/components/modal-actions";

describe("ModalActions Component", () => {
  describe("rendering", () => {
    it("should render cancel and primary buttons by default", () => {
      render(<ModalActions primaryLabel="Save" cancelLabel="Cancel" onCancel={jest.fn()} />);

      expect(screen.getByText("Save")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    it("should render only primary button when showCancel is false", () => {
      render(<ModalActions primaryLabel="Confirm" onCancel={jest.fn()} showCancel={false} />);

      expect(screen.getByText("Confirm")).toBeInTheDocument();
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(1);
    });

    it("should use custom labels", () => {
      render(<ModalActions primaryLabel="Create" cancelLabel="Close" onCancel={jest.fn()} />);

      expect(screen.getByText("Create")).toBeInTheDocument();
      expect(screen.getByText("Close")).toBeInTheDocument();
    });
  });

  describe("button functionality", () => {
    it("should call onCancel when cancel button clicked", () => {
      const handleCancel = jest.fn();
      render(<ModalActions primaryLabel="Save" cancelLabel="Cancel" onCancel={handleCancel} />);

      const buttons = screen.getAllByRole("button");
      fireEvent.click(buttons[0]); // Cancel button

      expect(handleCancel).toHaveBeenCalledTimes(1);
    });

    it("should call onPrimary when button type is button", () => {
      const handlePrimary = jest.fn();
      render(
        <ModalActions
          primaryLabel="Click Me"
          cancelLabel="Cancel"
          primaryType="button"
          onPrimary={handlePrimary}
          onCancel={jest.fn()}
        />,
      );

      const primaryButton = screen.getByText("Click Me");
      fireEvent.click(primaryButton);

      expect(handlePrimary).toHaveBeenCalledTimes(1);
    });
  });

  describe("form submission", () => {
    it("should render submit button with form attribute", () => {
      render(
        <ModalActions
          primaryLabel="Submit"
          cancelLabel="Cancel"
          primaryType="submit"
          formId="test-form"
          onCancel={jest.fn()}
        />,
      );

      const buttons = screen.getAllByRole("button");
      const submitButton = buttons.find((btn) => btn.getAttribute("type") === "submit");
      expect(submitButton).toHaveAttribute("form", "test-form");
    });

    it("should apply loading state", () => {
      render(
        <ModalActions
          primaryLabel="Save"
          cancelLabel="Cancel"
          loading={true}
          onCancel={jest.fn()}
        />,
      );

      const buttons = screen.getAllByRole("button");
      buttons.forEach((btn) => expect(btn).toBeDisabled());
    });
  });

  describe("disabled state", () => {
    it("should disable buttons when disabled is true", () => {
      render(
        <ModalActions
          primaryLabel="Save"
          cancelLabel="Cancel"
          onCancel={jest.fn()}
          disabled={true}
        />,
      );

      const buttons = screen.getAllByRole("button");
      buttons.forEach((btn) => expect(btn).toBeDisabled());
    });

    it("should disable buttons during loading", () => {
      render(
        <ModalActions
          primaryLabel="Save"
          cancelLabel="Cancel"
          onCancel={jest.fn()}
          loading={true}
        />,
      );

      const buttons = screen.getAllByRole("button");
      buttons.forEach((btn) => expect(btn).toBeDisabled());
    });

    it("should not call handlers when disabled", () => {
      const handleCancel = jest.fn();
      const handlePrimary = jest.fn();

      render(
        <ModalActions
          primaryLabel="Save"
          cancelLabel="Cancel"
          primaryType="button"
          onPrimary={handlePrimary}
          onCancel={handleCancel}
          disabled={true}
        />,
      );

      const buttons = screen.getAllByRole("button");
      buttons.forEach((btn) => fireEvent.click(btn));

      expect(handleCancel).not.toHaveBeenCalled();
      expect(handlePrimary).not.toHaveBeenCalled();
    });
  });

  describe("layout", () => {
    it("should render in DialogActions container", () => {
      const { container } = render(
        <ModalActions primaryLabel="Save" cancelLabel="Cancel" onCancel={jest.fn()} />,
      );

      const dialogActions = container.querySelector(".MuiDialogActions-root");
      expect(dialogActions).toBeInTheDocument();
    });
  });
});
