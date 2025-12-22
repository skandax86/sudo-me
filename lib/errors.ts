// Error Codes
export const ERROR_CODES = {
  // Authentication
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID: 'AUTH_INVALID',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Budget
  BUDGET_EXCEEDED: 'BUDGET_EXCEEDED',
  BUDGET_WARNING: 'BUDGET_WARNING',
  
  // LLM
  LLM_RATE_LIMIT: 'LLM_RATE_LIMIT',
  LLM_ERROR: 'LLM_ERROR',
  
  // General
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED'
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// Error Class
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public status?: number,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Error Handler
export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Firebase Auth errors
    if (error.message.includes('auth/')) {
      if (error.message.includes('user-not-found')) {
        return new AppError(ERROR_CODES.AUTH_INVALID, 'User not found', 401);
      }
      if (error.message.includes('wrong-password')) {
        return new AppError(ERROR_CODES.AUTH_INVALID, 'Invalid password', 401);
      }
      if (error.message.includes('email-already-in-use')) {
        return new AppError(ERROR_CODES.AUTH_INVALID, 'Email already in use', 400);
      }
      if (error.message.includes('weak-password')) {
        return new AppError(ERROR_CODES.VALIDATION_ERROR, 'Password is too weak', 400);
      }
      return new AppError(ERROR_CODES.AUTH_INVALID, 'Authentication failed', 401);
    }

    // Firestore errors
    if (error.message.includes('permission-denied')) {
      return new AppError(ERROR_CODES.PERMISSION_DENIED, 'Permission denied', 403);
    }

    // Generic error
    return new AppError(ERROR_CODES.INTERNAL_ERROR, error.message, 500);
  }

  return new AppError(ERROR_CODES.INTERNAL_ERROR, 'An unexpected error occurred', 500);
}

// Format error for display
export function formatError(error: AppError): string {
  return error.message || 'An error occurred';
}




