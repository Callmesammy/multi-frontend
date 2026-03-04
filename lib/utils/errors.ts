import axios from "axios";

interface ApiErrorPayload {
  detail?: string;
  title?: string;
  message?: string;
  Message?: string;
  errors?: string[] | Record<string, string>;
  Errors?: string[] | Record<string, string>;
  [key: string]: unknown;
}

function firstErrorFromField(errors: string[] | Record<string, string>): string | null {
  if (Array.isArray(errors)) {
    return errors.length > 0 ? errors[0] : null;
  }
  const first = Object.values(errors).find((v) => typeof v === "string" && v.trim().length > 0);
  return first ?? null;
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

      if (payload.errors) {
        const msg = firstErrorFromField(payload.errors as string[] | Record<string, string>);
        if (msg) return msg;
      }

      if (payload.Errors) {
        const msg = firstErrorFromField(payload.Errors as string[] | Record<string, string>);
        if (msg) return msg;
      }

      const objectValue = Object.values(payload).find(
        (v) => typeof v === "string" && v.trim().length > 0,
      ) as string | undefined;
      if (objectValue) return objectValue;
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
