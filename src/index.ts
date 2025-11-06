import { Hono } from "hono";
import { cors } from "hono/cors";
import { healthRouter } from "./routes/health";
import { eventsRouter } from "./routes/events";

const app = new Hono();

app.use("*", cors());

app.get("/", (c) => {
  return c.json({ message: "Pet News Events API" });
});

app.route("/", healthRouter);
app.route("/", eventsRouter);

export default app;
