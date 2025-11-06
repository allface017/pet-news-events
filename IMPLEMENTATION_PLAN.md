# Pet News Events API - 実装計画書

**作成日**: 2025-11-05  
**対象設計書**: API_DESIGN.md

---

## 概要
このドキュメントは API_DESIGN.md に基づいた詳細な実装計画をまとめたものです。  
各フェーズごとにタスク、成果物、テスト項目、実装サンプルを定義しています。

---

## Ⅰ. フェーズ構成

```
Phase 1: プロジェクト初期化 (優先度: 必須)
  ├─ Task 1-1: Hono プロジェクト初期化
  ├─ Task 1-2: 開発環境セットアップ
  └─ Task 1-3: TypeScript 型定義ファイル作成

Phase 2: 基本的なルーティング・インフラ (優先度: 必須)
  ├─ Task 2-1: エラーハンドリング基盤構築
  ├─ Task 2-2: ヘルスチェックエンドポイント実装
  └─ Task 2-3: レスポンス形式の標準化

Phase 3: スクレイピング基盤実装 (優先度: 必須)
  ├─ Task 3-1: Web ページ取得ロジック実装
  ├─ Task 3-2: HTML パーサー・抽出ロジック実装
  └─ Task 3-3: イベントデータ正規化処理実装

Phase 4: イベント一覧エンドポイント実装 (優先度: 必須)
  ├─ Task 4-1: キャッシュ管理モジュール実装
  ├─ Task 4-2: GET /api/events エンドポイント実装
  └─ Task 4-3: フィルタリング・ソート機能実装

Phase 5: イベント詳細エンドポイント実装 (優先度: 重要)
  ├─ Task 5-1: GET /api/events/:id エンドポイント実装
  └─ Task 5-2: 詳細データ取得ロジック実装

Phase 6: 手動リフレッシュエンドポイント実装 (優先度: 低)
  ├─ Task 6-1: POST /api/events/refresh エンドポイント実装
  └─ Task 6-2: 認可・レート制限機構実装

Phase 7: 統合テスト・デプロイ準備 (優先度: 重要)
  ├─ Task 7-1: 統合テスト作成・実行
  ├─ Task 7-2: Cloudflare Workers デプロイ設定
  └─ Task 7-3: ドキュメント整備
```

---

## Ⅱ. Phase 1: プロジェクト初期化

### Task 1-1: Hono プロジェクト初期化

**目標**: Hono の基本的なプロジェクト構造をセットアップ

**対象フォルダ**:  
```
pet-news-events/
├── package.json
├── tsconfig.json
├── wrangler.toml
└── src/
    └── index.ts
```

**実装内容**:
1. npm プロジェクト初期化
2. 依存ライブラリのインストール
   - `hono`: v4 以降
   - `cheerio`: HTML パーサー
   - `typescript`: 開発ツール
   - `wrangler`: Cloudflare Workers CLI
3. `tsconfig.json` 設定
4. `wrangler.toml` 設定（Cloudflare Workers）
5. 基本的な `index.ts` 作成

**必要な npm パッケージ**:
```json
{
  "dependencies": {
    "hono": "^4.0.0",
    "cheerio": "^1.0.0-rc.12"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "wrangler": "^3.0.0",
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0"
  }
}
```

**実装サンプル** (`src/index.ts`):
```typescript
import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => {
  return c.json({ message: 'Pet News Events API' });
});

export default app;
```

**成果物**:
- [ ] package.json が作成されている
- [ ] node_modules がインストール完了
- [ ] tsconfig.json が正しく設定されている
- [ ] wrangler.toml が作成されている
- [ ] `npm run dev` で開発サーバーが起動可能

**テスト項目**:
- [ ] `npm run dev` で localhost:8787 で起動確認
- [ ] ルートエンドポイント GET / が 200 で応答確認

---

### Task 1-2: 開発環境セットアップ

**目標**: 開発効率を高めるためのツール・スクリプト整備

**実装内容**:
1. npm スクリプト追加 (`package.json`)
   - `npm run dev`: 開発サーバー起動
   - `npm run build`: ビルド
   - `npm run deploy`: Cloudflare Workers デプロイ
2. `.gitignore` 作成
3. `README.md` 基本構造作成

**実装サンプル** (`package.json` の scripts):
```json
{
  "scripts": {
    "dev": "wrangler dev",
    "build": "tsc && wrangler publish --dry-run",
    "deploy": "wrangler publish",
    "type-check": "tsc --noEmit"
  }
}
```

**成果物**:
- [ ] npm スクリプトが正しく動作
- [ ] .gitignore が作成されている
- [ ] README.md の基本構造が完成

---

### Task 1-3: TypeScript 型定義ファイル作成

**目標**: API 全体で使用する型定義をまとめたファイルを作成

**対象ファイル**: `src/types/index.ts`

**実装内容**:
- Event インターフェース定義
- API レスポンス形式定義
- エラーオブジェクト形式定義
- クエリパラメータ形式定義

**実装サンプル**:
```typescript
// src/types/index.ts

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
    details?: Record<string, any>;
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
  sort?: 'date_desc' | 'date_asc' | 'title';
}

export type ErrorCode = 
  | 'NOT_FOUND'
  | 'SCRAPE_ERROR'
  | 'INVALID_PARAMS'
  | 'RATE_LIMIT'
  | 'INTERNAL_ERROR';
```

**成果物**:
- [ ] `src/types/index.ts` が完成
- [ ] 全型定義が正しく export されている
- [ ] 他のファイルから import 可能

---

## Ⅲ. Phase 2: 基本的なルーティング・インフラ

### Task 2-1: エラーハンドリング基盤構築

**目標**: 統一されたエラーハンドリング仕組みを整備

**対象ファイル**: `src/utils/errors.ts`

**実装内容**:
1. カスタムエラークラス作成
2. エラーミッドルウェア作成
3. エラーレスポンス形式の統一

**実装サンプル**:
```typescript
// src/utils/errors.ts

import type { ErrorCode } from '../types';

export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    public statusCode: number = 500,
    message: string = ''
  ) {
    super(message);
  }
}

export function handleError(err: unknown) {
  if (err instanceof ApiError) {
    return {
      statusCode: err.statusCode,
      response: {
        success: false,
        error: {
          code: err.code,
          message: err.message,
        },
      },
    };
  }

  return {
    statusCode: 500,
    response: {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    },
  };
}
```

**成果物**:
- [ ] `src/utils/errors.ts` が作成されている
- [ ] ApiError クラスが正しく定義されている
- [ ] handleError 関数が実装されている

---

### Task 2-2: ヘルスチェックエンドポイント実装

**目標**: API の稼働状態確認用エンドポイント作成

**対象ファイル**: `src/routes/health.ts`

**実装内容**:
1. GET /health エンドポイント実装
2. 簡単なステータス情報返却

**実装サンプル**:
```typescript
// src/routes/health.ts

import { Hono } from 'hono';
import type { ApiResponse } from '../types';

export const healthRouter = new Hono();

healthRouter.get('/health', (c) => {
  const response: ApiResponse<{ status: string }> = {
    success: true,
    data: { status: 'ok' },
  };
  return c.json(response);
});
```

**成果物**:
- [ ] `src/routes/health.ts` が作成されている
- [ ] GET /health が 200 で応答確認

**テスト項目**:
- [ ] `curl http://localhost:8787/health` で `{"success":true,"data":{"status":"ok"}}` 返却

---

### Task 2-3: レスポンス形式の標準化

**目標**: 全エンドポイントで統一されたレスポンス形式を提供

**対象ファイル**: `src/utils/response.ts`

**実装内容**:
1. レスポンスビルダー関数作成
2. ミッドルウェアの適用

**実装サンプル**:
```typescript
// src/utils/response.ts

import { Context } from 'hono';
import type { ApiResponse } from '../types';

export function successResponse<T>(
  data: T,
  meta?: Record<string, any>
): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(meta && { meta }),
  };
}

export function errorResponse(
  code: string,
  message: string,
  details?: Record<string, any>
): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
}
```

**成果物**:
- [ ] `src/utils/response.ts` が作成されている
- [ ] successResponse・errorResponse 関数が実装されている

---

## Ⅳ. Phase 3: スクレイピング基盤実装

### Task 3-1: Web ページ取得ロジック実装

**目標**: WANCO ニュースページの HTML を安全に取得

**対象ファイル**: `src/services/fetcher.ts`

**実装内容**:
1. HTTP クライアント実装
2. User-Agent 設定
3. タイムアウト・リトライ機構
4. エラーハンドリング

**実装サンプル**:
```typescript
// src/services/fetcher.ts

const USER_AGENT = 'Pet-News-Events-Bot/1.0 (+https://github.com/allface017/pet-news-events)';
const TIMEOUT_MS = 10000;
const MAX_RETRIES = 3;

export async function fetchPageHtml(url: string, retries = 0): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.text();
  } catch (err) {
    if (retries < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
      return fetchPageHtml(url, retries + 1);
    }
    throw err;
  }
}
```

**成果物**:
- [ ] `src/services/fetcher.ts` が作成されている
- [ ] fetchPageHtml 関数が実装されている
- [ ] リトライ機構が動作確認済み

---

### Task 3-2: HTML パーサー・抽出ロジック実装

**目標**: cheerio を使用して WANCO ニュースから必要な情報を抽出

**対象ファイル**: `src/services/parser.ts`

**実装内容**:
1. 実際の WANCO ニュースページ構造を調査
2. cheerio セレクタ定義
3. 記事要素からのデータ抽出ロジック
4. 日付・時刻のパース処理

**実装サンプル**:
```typescript
// src/services/parser.ts

import * as cheerio from 'cheerio';

interface RawNewsItem {
  title: string;
  url: string;
  date: string;
  description?: string;
  imageUrl?: string;
}

export function parseNewsPage(html: string): RawNewsItem[] {
  const $ = cheerio.load(html);
  const items: RawNewsItem[] = [];

  // セレクタは実際のページ構造に合わせて調整が必要
  $('article, .news-item, .post').each((_, elem) => {
    const $elem = $(elem);
    
    const title = $elem.find('h2, h3, .title').text().trim();
    const url = $elem.find('a').attr('href');
    const date = $elem.find('.date, time, .published').text().trim();
    const description = $elem.find('p, .excerpt').text().trim().slice(0, 200);
    const imageUrl = $elem.find('img').attr('src');

    if (title && url) {
      items.push({
        title,
        url: new URL(url, 'https://wanco.ac.jp').href,
        date,
        description,
        imageUrl: imageUrl ? new URL(imageUrl, 'https://wanco.ac.jp').href : undefined,
      });
    }
  });

  return items;
}
```

**成果物**:
- [ ] `src/services/parser.ts` が作成されている
- [ ] parseNewsPage 関数が実装されている
- [ ] 実ページで動作確認済み（要テスト）

---

### Task 3-3: イベントデータ正規化処理実装

**目標**: 抽出されたニュース情報をイベント形式に正規化

**対象ファイル**: `src/services/normalizer.ts`

**実装内容**:
1. RawNewsItem を Event に変換
2. ID 生成ロジック
3. 日付・時刻パース
4. イベント判定（タイトルからイベント情報を推測）

**実装サンプル**:
```typescript
// src/services/normalizer.ts

import type { Event, EventsListQuery } from '../types';
import crypto from 'crypto';

function generateEventId(title: string, date: string): string {
  const hash = crypto
    .createHash('sha256')
    .update(`${title}${date}`)
    .digest('hex')
    .slice(0, 8);
  return `event_${hash}`;
}

function parseDate(dateStr: string): string | null {
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
}

export function normalizeToEvent(rawNews: {
  title: string;
  url: string;
  date: string;
  description?: string;
  imageUrl?: string;
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
    source: 'wanco',
    scrapedAt: new Date().toISOString(),
  };
}
```

**成果物**:
- [ ] `src/services/normalizer.ts` が作成されている
- [ ] normalizeToEvent 関数が実装されている
- [ ] イベント ID 生成ロジックが正しく動作

---

## Ⅴ. Phase 4: イベント一覧エンドポイント実装

### Task 4-1: キャッシュ管理モジュール実装

**目標**: スクレイピング結果をメモリ・KVストレージにキャッシュ

**対象ファイル**: `src/services/cache.ts`

**実装内容**:
1. メモリキャッシュ実装（開発環境用）
2. KVストレージ用インターフェース（本番環境用）
3. キャッシュTTL管理（3600秒デフォルト）
4. 手動クリア機構

**実装サンプル**:
```typescript
// src/services/cache.ts

import type { Event } from '../types';

interface CacheEntry {
  data: Event[];
  expiresAt: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry> = new Map();
  private ttlMs: number;

  constructor(ttlSeconds = 3600) {
    this.ttlMs = ttlSeconds * 1000;
  }

  set(key: string, value: Event[]): void {
    this.cache.set(key, {
      data: value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  get(key: string): Event[] | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  getAge(key: string): number | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    return this.ttlMs - (entry.expiresAt - Date.now());
  }
}

export const cache = new MemoryCache();
export type { CacheEntry };
```

**成果物**:
- [ ] `src/services/cache.ts` が作成されている
- [ ] MemoryCache クラスが実装されている
- [ ] set/get/clear メソッドが動作確認済み

---

### Task 4-2: GET /api/events エンドポイント実装

**目標**: イベント一覧をキャッシュ・スクレイピング結果から返却

**対象ファイル**: `src/routes/events.ts`

**実装内容**:
1. GET /api/events ルートハンドラ実装
2. スクレイピングの自動実行（キャッシュ失効時）
3. レスポンスフォーマット

**実装サンプル**:
```typescript
// src/routes/events.ts

import { Hono } from 'hono';
import type { ApiResponse, EventsListResponse, EventsListQuery } from '../types';
import { cache } from '../services/cache';
import { fetchPageHtml } from '../services/fetcher';
import { parseNewsPage } from '../services/parser';
import { normalizeToEvent } from '../services/normalizer';
import { successResponse, errorResponse } from '../utils/response';
import { ApiError } from '../utils/errors';

export const eventsRouter = new Hono();
let lastScrapedAt = new Date(0);

async function scrapeAndCache(): Promise<Event[]> {
  try {
    const html = await fetchPageHtml('https://wanco.ac.jp/news/');
    const rawNews = parseNewsPage(html);
    const events = rawNews
      .map(normalizeToEvent)
      .filter((e) => e !== null) as Event[];
    
    cache.set('events', events);
    lastScrapedAt = new Date();
    return events;
  } catch (err) {
    throw new ApiError('SCRAPE_ERROR', 503, 'Failed to scrape news');
  }
}

eventsRouter.get('/api/events', async (c) => {
  try {
    let events = cache.get('events');
    if (!events) {
      events = await scrapeAndCache();
    }

    const page = Math.max(1, parseInt(c.req.query('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(c.req.query('limit') || '10')));
    const start = (page - 1) * limit;
    const end = start + limit;

    const paginatedEvents = events.slice(start, end);
    const cacheAge = cache.getAge('events') ?? 0;

    const response: ApiResponse<EventsListResponse> = successResponse(
      {
        total: events.length,
        page,
        limit,
        events: paginatedEvents,
      },
      {
        lastScrapedAt: lastScrapedAt.toISOString(),
        cacheAge: Math.round(cacheAge / 1000),
      }
    );

    return c.json(response);
  } catch (err) {
    if (err instanceof ApiError) {
      return c.json(errorResponse(err.code, err.message), err.statusCode);
    }
    return c.json(errorResponse('INTERNAL_ERROR', 'Internal server error'), 500);
  }
});
```

**成果物**:
- [ ] `src/routes/events.ts` が作成されている
- [ ] GET /api/events エンドポイントが実装されている
- [ ] 動作確認済み（WANCO ページからスクレイピング成功）

**テスト項目**:
- [ ] `curl http://localhost:8787/api/events` でイベント一覧返却
- [ ] キャッシュの再利用確認（同一リクエストで早い応答）
- [ ] ページネーション動作確認

---

### Task 4-3: フィルタリング・ソート機能実装

**目標**: query パラメータによるフィルタリング・ソート

**対象ファイル**: `src/routes/events.ts` (拡張)

**実装内容**:
1. category フィルタリング
2. sort パラメータ処理 (date_desc, date_asc, title)
3. 入力検証

**実装サンプル** (追加):
```typescript
// src/routes/events.ts に追加

function filterEvents(events: Event[], category?: string): Event[] {
  if (!category) return events;
  return events.filter(e => e.category === category);
}

function sortEvents(
  events: Event[],
  sort: 'date_desc' | 'date_asc' | 'title' = 'date_desc'
): Event[] {
  const sorted = [...events];
  switch (sort) {
    case 'date_asc':
      return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    case 'date_desc':
      return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title, 'ja'));
    default:
      return sorted;
  }
}

// エンドポイントハンドラに組み込む
const category = c.req.query('category');
const sort = (c.req.query('sort') as any) || 'date_desc';

let filtered = filterEvents(events, category);
filtered = sortEvents(filtered, sort);
```

**成果物**:
- [ ] フィルタリング機能が実装されている
- [ ] ソート機能が実装されている
- [ ] クエリパラメータ検証が完了

**テスト項目**:
- [ ] `?sort=date_asc` で昇順ソート確認
- [ ] `?category=学生向け` でカテゴリフィルタ確認
- [ ] 複合クエリ `?page=2&limit=5&sort=title` で正常動作

---

## Ⅵ. Phase 5: イベント詳細エンドポイント実装

### Task 5-1: GET /api/events/:id エンドポイント実装

**目標**: 指定イベント IDの詳細情報を返却

**対象ファイル**: `src/routes/events.ts` (拡張)

**実装内容**:
1. パラメータ抽出・検証
2. イベントID に基づく検索
3. エラーハンドリング (NOT_FOUND)

**実装サンプル**:
```typescript
// src/routes/events.ts に追加

eventsRouter.get('/api/events/:id', async (c) => {
  try {
    const eventId = c.req.param('id');
    
    let events = cache.get('events');
    if (!events) {
      events = await scrapeAndCache();
    }

    const event = events.find(e => e.id === eventId);
    if (!event) {
      return c.json(
        errorResponse('NOT_FOUND', 'Event not found'),
        404
      );
    }

    const response: ApiResponse<Event> = successResponse(event);
    return c.json(response);
  } catch (err) {
    return c.json(errorResponse('INTERNAL_ERROR', 'Internal server error'), 500);
  }
});
```

**成果物**:
- [ ] GET /api/events/:id エンドポイントが実装されている
- [ ] 404 エラーハンドリングが正しく動作

**テスト項目**:
- [ ] `curl http://localhost:8787/api/events/event_xxxxx` で詳細情報返却
- [ ] 存在しないIDでアクセス時に 404 返却

---

### Task 5-2: 詳細データ取得ロジック実装

**目標**: 必要に応じて個別ニュースページから詳細情報を取得

**対象ファイル**: `src/services/parser.ts` (拡張)

**実装内容**:
1. 個別ニュースページのスクレイピング
2. fullContent 抽出
3. 詳細パーサー実装

**実装サンプル**:
```typescript
// src/services/parser.ts に追加

export async function parseNewsDetail(newsUrl: string): Promise<{
  fullContent?: string;
  contact?: any;
  tags?: string[];
} | null> {
  try {
    const html = await fetchPageHtml(newsUrl);
    const $ = cheerio.load(html);

    const fullContent = $('.article-content, .post-content, main').html() || undefined;
    const tags = $('.tag, .badge')
      .map((_, el) => $(el).text().trim())
      .get();

    return {
      fullContent,
      tags,
    };
  } catch {
    return null;
  }
}
```

**成vara物**:
- [ ] parseNewsDetail 関数が実装されている
- [ ] fullContent 抽出ロジックが動作確認済み

---

## Ⅶ. Phase 6: 手動リフレッシュエンドポイント実装

### Task 6-1: POST /api/events/refresh エンドポイント実装

**目標**: 管理者が手動でスクレイピングを実行できるエンドポイント

**対象ファイル**: `src/routes/events.ts` (拡張)

**実装内容**:
1. POST ハンドラ実装
2. force パラメータ処理
3. 実行結果返却

**実装サンプル**:
```typescript
// src/routes/events.ts に追加

eventsRouter.post('/api/events/refresh', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const force = body.force === true;

    const oldCount = cache.get('events')?.length || 0;
    const events = await scrapeAndCache();
    const newCount = events.length;
    const updated = Math.abs(newCount - oldCount);

    const response: ApiResponse<any> = successResponse({
      message: 'Scraping completed',
      eventsFound: newCount,
      eventsUpdated: updated,
    });

    return c.json(response);
  } catch (err) {
    if (err instanceof ApiError) {
      return c.json(errorResponse(err.code, err.message), err.statusCode);
    }
    return c.json(errorResponse('INTERNAL_ERROR', 'Internal server error'), 500);
  }
});
```

**成果物**:
- [ ] POST /api/events/refresh エンドポイントが実装されている
- [ ] 手動リフレッシュが動作確認済み

---

### Task 6-2: 認可・レート制限機構実装

**目標**: refresh エンドポイントへのアクセス制限

**対象ファイル**: `src/middleware/auth.ts`

**実装内容**:
1. API キー認証（簡易版）
2. レート制限ミッドルウェア
3. 環境変数で API キー管理

**実装サンプル**:
```typescript
// src/middleware/auth.ts

import { Context, Next } from 'hono';
import { ApiError } from '../utils/errors';

export async function authMiddleware(c: Context, next: Next) {
  const allowedKey = process.env.ADMIN_API_KEY;
  
  if (!allowedKey) {
    // 本番環境では必須
    console.warn('ADMIN_API_KEY not set');
  }

  const authHeader = c.req.header('Authorization');
  const providedKey = authHeader?.replace('Bearer ', '');

  if (allowedKey && providedKey !== allowedKey) {
    throw new ApiError('UNAUTHORIZED', 401, 'Invalid API key');
  }

  await next();
}

export function rateLimitMiddleware() {
  const requests = new Map<string, number[]>();

  return async (c: Context, next: Next) => {
    const ip = c.req.header('cf-connecting-ip') || 'unknown';
    const now = Date.now();
    const windowMs = 60000; // 1分
    const maxRequests = 10; // 1分間に10リクエスト

    if (!requests.has(ip)) {
      requests.set(ip, []);
    }

    const timestamps = requests.get(ip)!;
    const recentRequests = timestamps.filter(t => now - t < windowMs);

    if (recentRequests.length >= maxRequests) {
      throw new ApiError('RATE_LIMIT', 429, 'Too many requests');
    }

    recentRequests.push(now);
    requests.set(ip, recentRequests);

    await next();
  };
}
```

**成果物**:
- [ ] 認証ミッドルウェアが実装されている
- [ ] レート制限機構が実装されている
- [ ] wrangler.toml に ADMIN_API_KEY 設定済み

---

## Ⅷ. Phase 7: 統合テスト・デプロイ準備

### Task 7-1: 統合テスト作成・実行

**目標**: 全エンドポイント・機能の統合テスト

**対象ファイル**: `tests/integration.test.ts`

**実装内容**:
1. テストスイート構成 (Jest/Vitest)
2. 各エンドポイントのテストケース
3. エラーケースのテスト

**実装サンプル**:
```typescript
// tests/integration.test.ts

import app from '../src/index';

describe('Events API Integration Tests', () => {
  it('GET /health should return ok', async () => {
    const response = await app.request(new Request('http://localhost/health'));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it('GET /api/events should return event list', async () => {
    const response = await app.request(new Request('http://localhost/api/events'));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data.events)).toBe(true);
  });

  it('GET /api/events with pagination', async () => {
    const response = await app.request(
      new Request('http://localhost/api/events?page=1&limit=5')
    );
    const data = await response.json();
    expect(data.data.limit).toBe(5);
  });

  it('GET /api/events/:id should return 404 for invalid id', async () => {
    const response = await app.request(
      new Request('http://localhost/api/events/invalid_id')
    );
    expect(response.status).toBe(404);
  });
});
```

**成果物**:
- [ ] `tests/` ディレクトリが作成されている
- [ ] 統合テストが全て PASS
- [ ] テストカバレッジ > 80%

---

### Task 7-2: Cloudflare Workers デプロイ設定

**目標**: 本番環境へのデプロイ準備

**対象ファイル**: `wrangler.toml`

**実装内容**:
1. wrangler.toml 設定確認
2. 環境変数設定
3. デプロイ前チェックリスト

**実装サンプル** (`wrangler.toml`):
```toml
name = "pet-news-events"
main = "src/index.ts"
compatibility_date = "2025-11-05"
workers_dev = true

[env.production]
routes = [
  { pattern = "api.wanco.example.com/*", zone_name = "example.com" }
]

[[env.production.vars]]
name = "ADMIN_API_KEY"
# Set via CLI: wrangler secret put ADMIN_API_KEY
```

**デプロイコマンド**:
```bash
# 開発環境でテスト
npm run dev

# ドライラン
npm run build

# 本番デプロイ
wrangler secret put ADMIN_API_KEY <key>
npm run deploy
```

**成果物**:
- [ ] wrangler.toml が正しく設定されている
- [ ] `npm run deploy` で正常にデプロイ可能
- [ ] CloudflareダッシュボードでWorker確認済み

---

### Task 7-3: ドキュメント整備

**目標**: ユーザー向け・開発者向けドキュメント完成

**対象ファイル**:
- `README.md` - プロジェクト概要・セットアップ方法
- `docs/API.md` - API リファレンス
- `docs/DEVELOPMENT.md` - 開発ガイド

**実装サンプル** (`README.md`):
```markdown
# Pet News Events API

WANCO のニュースページからイベント情報を取得する REST API

## クイックスタート

### インストール
\`\`\`bash
npm install
npm run dev
\`\`\`

### API の使用
\`\`\`bash
# イベント一覧取得
curl http://localhost:8787/api/events

# イベント詳細取得
curl http://localhost:8787/api/events/event_xxxxx
\`\`\`

## 環境変数
- `ADMIN_API_KEY` - 管理者向けエンドポイントのAPI キー

## デプロイ
\`\`\`bash
npm run deploy
\`\`\`

## ドキュメント
- [API リファレンス](docs/API.md)
- [開発ガイド](docs/DEVELOPMENT.md)
```

**成果物**:
- [ ] `README.md` が完成している
- [ ] `docs/` ディレクトリにドキュメント配置
- [ ] セットアップ・デプロイ手順が明確

---

## Ⅸ. 実装優先度マトリックス

| Phase | Task | 優先度 | 見積り時間 | 依存タスク |
|-------|------|-------|----------|----------|
| 1-1 | Hono初期化 | 🔴 必須 | 30分 | - |
| 1-2 | 開発環境セットアップ | 🔴 必須 | 20分 | 1-1 |
| 1-3 | 型定義 | 🔴 必須 | 40分 | 1-1 |
| 2-1 | エラーハンドリング | 🔴 必須 | 30分 | 1-3 |
| 2-2 | ヘルスチェック | 🟡 重要 | 15分 | 2-1 |
| 2-3 | レスポンス標準化 | 🟡 重要 | 20分 | 2-1 |
| 3-1 | Web 取得 | 🔴 必須 | 30分 | 1-3 |
| 3-2 | HTML パーサー | 🔴 必須 | 60分 | 3-1 |
| 3-3 | 正規化処理 | 🔴 必須 | 45分 | 3-2 |
| 4-1 | キャッシュ実装 | 🟡 重要 | 40分 | 1-3 |
| 4-2 | GET /api/events | 🔴 必須 | 50分 | 4-1,3-3 |
| 4-3 | フィルタリング | 🟡 重要 | 30分 | 4-2 |
| 5-1 | GET /api/events/:id | 🟡 重要 | 30分 | 4-2 |
| 5-2 | 詳細取得 | 🟢 低 | 40分 | 5-1 |
| 6-1 | POST refresh | 🟢 低 | 25分 | 4-2 |
| 6-2 | 認可・レート制限 | 🟢 低 | 35分 | 6-1 |
| 7-1 | 統合テスト | 🟡 重要 | 60分 | 全フェーズ |
| 7-2 | デプロイ設定 | 🟡 重要 | 30分 | 1-1 |
| 7-3 | ドキュメント | 🟡 重要 | 40分 | 全フェーズ |

**合計見積り時間**: 約 32 時間

---

## Ⅹ. 実装完了チェックリスト

### Phase 1
- [ ] `package.json` 完成
- [ ] `tsconfig.json` 完成
- [ ] `wrangler.toml` 完成
- [ ] `src/types/index.ts` 完成
- [ ] `npm run dev` で起動確認

### Phase 2
- [ ] `src/utils/errors.ts` 完成
- [ ] `src/utils/response.ts` 完成
- [ ] `src/routes/health.ts` 完成
- [ ] GET /health エンドポイント動作確認

### Phase 3
- [ ] `src/services/fetcher.ts` 完成
- [ ] `src/services/parser.ts` 完成
- [ ] `src/services/normalizer.ts` 完成
- [ ] WANCO ニュースページからのスクレイピング成功

### Phase 4
- [ ] `src/services/cache.ts` 完成
- [ ] `src/routes/events.ts` 完成
- [ ] GET /api/events エンドポイント動作確認
- [ ] ページネーション・フィルタリング・ソート動作確認

### Phase 5
- [ ] GET /api/events/:id エンドポイント動作確認
- [ ] 404 エラーハンドリング確認

### Phase 6
- [ ] POST /api/events/refresh エンドポイント動作確認
- [ ] API キー認証動作確認

### Phase 7
- [ ] 統合テスト作成・全 PASS
- [ ] Cloudflare Workers デプロイ成功
- [ ] `README.md`, `docs/` 完成

---

## XI. リスク管理

| リスク | 影響度 | 発生確度 | 対応策 |
|--------|--------|--------|--------|
| WANCO ページ構造変更 | 高 | 中 | セレクタの動的調整、フォールバック処理 |
| スクレイピング遅延 | 中 | 中 | タイムアウト設定、非同期処理の最適化 |
| Cloudflare Workers の制限超過 | 中 | 低 | キャッシング戦略の改善、キャパプランニング |
| セキュリティ脆弱性 | 高 | 低 | 入力検証、HTML エスケープ、セキュリティ監査 |

---

## XII. 今後のメンテナンス・拡張

実装完了後の推奨アクション:

1. **週1回の監視**
   - スクレイピングの成功率確認
   - エラーログ確認
   - API のレスポンスタイム確認

2. **月1回の確認**
   - WANCO ページ構造変更チェック
   - セレクタ の更新必要性判定
   - ユーザーフィードバック収集

3. **第2段階（3ヶ月後）の拡張検討**
   - [ ] 複数大学対応
   - [ ] 全文検索機能
   - [ ] ユーザー通知機能
   - [ ] GraphQL API

---

**作成日**: 2025-11-05  
**対応範囲**: API_DESIGN.md v1.0
