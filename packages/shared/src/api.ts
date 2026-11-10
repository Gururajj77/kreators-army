/** GET /api/health */
export interface HealthResponse {
  ok: true;
  app: string;
}

/** The body of every API error. */
export interface ApiErrorBody {
  error: string;
  requestId?: string;
}
