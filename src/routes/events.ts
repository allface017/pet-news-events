import { Hono } from "hono";
import type { ApiResponse, Event, EventsListResponse } from "../types/index";
import { cache } from "../services/cache";
import { fetchPageHtml } from "../services/fetcher";
import { parseNewsPage } from "../services/parser";
import { normalizeToEvent } from "../services/normalizer";
import { successResponse, errorResponse } from "../utils/response";
import { ApiError } from "../utils/errors";

export const eventsRouter = new Hono();

let lastScrapedAt = new Date(0);

async function scrapeAndCache(): Promise<Event[]> {
  try {
    const html = await fetchPageHtml("https://wanco.ac.jp/news/");
    const rawNews = parseNewsPage(html);
    const events = rawNews
      .map(normalizeToEvent)
      .filter((e) => e !== null) as Event[];

    cache.set("events", events);
    lastScrapedAt = new Date();
    return events;
  } catch (err) {
    console.error("Scraping error:", err);
    throw new ApiError("SCRAPE_ERROR", 503, "Failed to scrape news");
  }
}

eventsRouter.get("/api/events", async (c) => {
  try {
    let events = cache.get("events");
    if (!events) {
      events = await scrapeAndCache();
    }

    // クエリパラメータの取得と検証
    const pageParam = c.req.query("page") || "1";
    const limitParam = c.req.query("limit") || "10";
    const category = c.req.query("category");
    const sortParam = c.req.query("sort") || "date_desc";

    const page = Math.max(1, parseInt(pageParam, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(limitParam, 10) || 10));

    // フィルタリング
    let filtered = events;
    if (category) {
      filtered = filtered.filter((e) => e.category === category);
    }

    // ソート
    const sortType = sortParam as "date_desc" | "date_asc" | "title";
    switch (sortType) {
      case "date_asc":
        filtered.sort(
          (a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        break;
      case "date_desc":
        filtered.sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        break;
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title, "ja"));
        break;
    }

    // ページネーション
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedEvents = filtered.slice(start, end);

    const cacheAge = Math.round((cache.getAge("events") || 0) / 1000);

    const response: ApiResponse<EventsListResponse> = successResponse(
      {
        total: filtered.length,
        page,
        limit,
        events: paginatedEvents,
      },
      {
        lastScrapedAt: lastScrapedAt.toISOString(),
        cacheAge,
      }
    );

    return c.json(response);
  } catch (err) {
    if (err instanceof ApiError) {
      return c.json(errorResponse(err.code, err.message), err.statusCode);
    }
    return c.json(
      errorResponse("INTERNAL_ERROR", "Internal server error"),
      500
    );
  }
});

// GET /api/events/:id - イベント詳細取得
eventsRouter.get("/api/events/:id", async (c) => {
  try {
    const eventId = c.req.param("id");

    let events = cache.get("events");
    if (!events) {
      events = await scrapeAndCache();
    }

    const event = events.find((e) => e.id === eventId);
    if (!event) {
      return c.json(
        errorResponse("NOT_FOUND", "Event not found"),
        404
      );
    }

    const response: ApiResponse<Event> = successResponse(event);
    return c.json(response);
  } catch (err) {
    if (err instanceof ApiError) {
      return c.json(errorResponse(err.code, err.message), err.statusCode);
    }
    return c.json(
      errorResponse("INTERNAL_ERROR", "Internal server error"),
      500
    );
  }
});

// POST /api/events/refresh - 手動リフレッシュ
eventsRouter.post("/api/events/refresh", async (c) => {
  try {
    const oldCount = cache.get("events")?.length || 0;
    const events = await scrapeAndCache();
    const newCount = events.length;
    const updated = Math.abs(newCount - oldCount);

    const response: ApiResponse<{
      message: string;
      eventsFound: number;
      eventsUpdated: number;
    }> = successResponse({
      message: "Scraping completed",
      eventsFound: newCount,
      eventsUpdated: updated,
    });

    return c.json(response);
  } catch (err) {
    if (err instanceof ApiError) {
      return c.json(errorResponse(err.code, err.message), err.statusCode);
    }
    return c.json(
      errorResponse("INTERNAL_ERROR", "Internal server error"),
      500
    );
  }
});
