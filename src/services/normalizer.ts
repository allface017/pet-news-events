import type { Event } from "../types/index";

function generateEventId(title: string, date: string): string {
  // 簡易的なID生成（日付とタイトルから一意のIDを生成）
  const timestamp = new Date(date).getTime();
  const titleHash = title
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `event_${timestamp}_${titleHash}`.slice(0, 32);
}

function parseDate(dateStr: string): string | null {
  if (!dateStr) return null;

  // ISO 8601形式で返す
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString().split("T")[0];
}

export function normalizeToEvent(rawNews: {
  title: string;
  url: string;
  date: string;
  description?: string;
  imageUrl?: string;
  category?: string;
}): Event | null {
  const parsedDate = parseDate(rawNews.date);
  if (!parsedDate) return null;

  return {
    id: generateEventId(rawNews.title, rawNews.date),
    title: rawNews.title,
    description: rawNews.description || rawNews.title,
    date: parsedDate,
    url: rawNews.url,
    imageUrl: rawNews.imageUrl,
    category: rawNews.category,  // イベント種別を保持
    source: "wanco",
    scrapedAt: new Date().toISOString(),
  };
}
