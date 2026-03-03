import axios from "axios";

interface ProblemDetails {
  detail?: string;
  title?: string;
}

export function handleApiError(error: unknown): string {
  if (axios.isAxiosError<ProblemDetails>(error)) {
    const data = error.response?.data;

    if (data?.detail) {
      return data.detail;
    }

    if (data?.title) {
      return data.title;
    }

    if (error.code === "ERR_NETWORK") {
      return "Network error. Check your connection.";
    }
  }

  return "An unexpected error occurred.";
}
