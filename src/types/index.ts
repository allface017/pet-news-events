export interface Event {
  id: string;
  title: string;
  description: string;
  fullContent?: string;
  date: string;
  endDate?: string;
  time?: string;
  endTime?: string;
  location?: string;
  capacity?: number;
  registration?: {
    required: boolean;
    url?: string;
    deadline?: string;
  };
  category?: string;
  tags?: string[];
  url: string;
  imageUrl?: string;
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  source: "wanco";
  scrapedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    lastScrapedAt?: string;
    cacheAge?: number;
  };
}

export interface EventsListResponse {
  total: number;
  page: number;
  limit: number;
  events: Event[];
}

export interface EventsListQuery {
  page?: number;
  limit?: number;
  category?: string;
  sort?: "date_desc" | "date_asc" | "title";
}

export type ErrorCode =
  | "NOT_FOUND"
  | "SCRAPE_ERROR"
  | "INVALID_PARAMS"
  | "RATE_LIMIT"
  | "INTERNAL_ERROR";
