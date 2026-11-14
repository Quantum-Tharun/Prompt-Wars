export interface ApiErrorPayload {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}

export class ApiError extends Error {
  public status: number;
  public code: string;
  public details?: unknown;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.status = payload.status;
    this.code = payload.code;
    this.details = payload.details;
  }
}

