import { client } from "@/lib/api/client";
import { unwrapApiResponse, type ApiResponse } from "@/lib/api/response";
import type { HealthCheckResponse } from "@/types/health";

export async function getHealth(): Promise<HealthCheckResponse> {
  const response = await client.get<ApiResponse<HealthCheckResponse>>("/api/Health");
  return unwrapApiResponse(response.data);
}
