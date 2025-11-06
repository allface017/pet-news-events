import type { ErrorCode } from "../types/index";

export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    public statusCode: number = 500,
    message: string = ""
  ) {
    super(message);
    this.name = "ApiError";
  }
}
