export interface ApiResponse<T> {
  success: boolean;
  message?: string | null;
  data?: T | null;
  errors?: Record<string, string> | null;
}

function firstError(errors?: Record<string, string> | null): string | null {
  if (!errors) return null;

  for (const value of Object.values(errors)) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return null;
}

export function unwrapApiResponse<T>(payload: ApiResponse<T>): T {
  if (payload.success && payload.data != null) {
    return payload.data;
  }

  const message = payload.message?.trim();
  const error = firstError(payload.errors);

  throw new Error(message || error || "Request failed.");
}
