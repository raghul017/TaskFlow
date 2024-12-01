export class APIError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
    this.name = "APIError";
  }
}

export const handleAPIError = (
  error: unknown
): { message: string; status?: number } => {
  if (error instanceof APIError) {
    return {
      message: error.message,
      status: error.status,
    };
  }
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: "An unexpected error occurred" };
};

export const isAuthError = (error: unknown): boolean => {
  return error instanceof APIError && error.status === 401;
};
