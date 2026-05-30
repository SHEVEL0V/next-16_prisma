// /**
//  * UI Messages
//  * Centralized localization strings for UI components
//  */

export const MESSAGES = {
  // Common actions
  save: "Save",
  cancel: "Cancel",
  delete: "Delete",
  edit: "Edit",
  add: "Add",
  close: "Close",
  back: "Back",
  next: "Next",
  previous: "Previous",
  submit: "Submit",

  // Loading states
  loading: "Loading...",
  saving: "Saving...",
  deleting: "Deleting...",
  updating: "Updating...",

  // States
  success: "Success!",
  error: "Error!",
  warning: "Warning!",
  info: "Information",

  // Form messages
  fillRequiredFields: "Please fill in required fields",
  invalidEmail: "Invalid email address",
  passwordTooShort: "Password is too short",
  passwordMismatch: "Passwords do not match",

  // Dialog titles
  confirmDelete: "Confirm deletion",
  editItem: "Edit",
  createItem: "Create",
  settings: "Settings",

  // Tooltips
  addNew: "Add new item",
  goBack: "Go back",
  toggleTheme: "Toggle theme",
  toggleMenu: "Toggle menu",
  userSettings: "User settings",

  // Notifications
  savedSuccessfully: "Saved successfully",
  deletedSuccessfully: "Deleted successfully",
  updatedSuccessfully: "Updated successfully",
  operationFailed: "Operation failed",

  // Validation
  required: "Required field",
  minLength: "Minimum length",
  maxLength: "Maximum length",

  // Auth
  loginTitle: "Sign In",
  registerTitle: "Sign Up",
  logout: "Sign Out",
  login: "Log In",
  register: "Register",

  // Board
  createBoard: "Create board",
  editBoard: "Edit board",
  deleteBoard: "Delete board",
  newColumn: "New column",
  newTask: "New task",
  taskDetails: "Task details",

  // Empty states
  noItems: "No items",
  emptyBoard: "Empty board",
  startCreating: "Start creating",
} as const;

/**
 * Type for message keys
 */
export type MessageKey = keyof typeof MESSAGES;

/**
 * Get message by key with type safety
 */
export function getMessage(key: MessageKey): string {
  return MESSAGES[key];
}
