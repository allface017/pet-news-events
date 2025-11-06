import { Hono } from "hono";
import type { ApiResponse } from "../types/index";

export const healthRouter = new Hono();

healthRouter.get("/health", (c) => {
  const response: ApiResponse<{ status: string }> = {
    success: true,
    data: { status: "ok" },
  };
  return c.json(response);
});
