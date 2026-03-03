import axios from "axios";

interface ApiErrorPayload {
  detail?: string;
  title?: string;
  message?: string;
  Message?: string;
  errors?: string[];
  Errors?: string[];
  [key: string]: unknown;
}

function firstStringFromObject(record: Record<string, unknown>): string | null {
  for (const value of Object.values(record)) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return null;
}

export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data;

    if (typeof data === "string" && data.trim().length > 0) {
      return data;
    }

    if (data && typeof data === "object") {
      const payload = data as ApiErrorPayload;

      if (payload.detail) {
        return payload.detail;
      }

      if (payload.title) {
        return payload.title;
      }

      if (payload.message) {
        return payload.message;
      }

      if (payload.Message) {
        return payload.Message;
      }

      if (Array.isArray(payload.errors) && payload.errors.length > 0) {
        return payload.errors[0];
      }

      if (Array.isArray(payload.Errors) && payload.Errors.length > 0) {
        return payload.Errors[0];
      }

      const objectValue = firstStringFromObject(payload as Record<string, unknown>);
      if (objectValue) {
        return objectValue;
      }
    }

    if (error.code === "ERR_NETWORK") {
      return "Network error. Check backend URL/CORS configuration and your connection.";
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "An unexpected error occurred.";
}
