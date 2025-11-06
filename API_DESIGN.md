# Pet News Events API - 設計書

## 概要
和歌山県立大学（WANCO）のニュースページからイベント情報を取得し、REST APIとして提供するサービス。

## スコープ
- **データソース**: https://wanco.ac.jp/news/
- **フレームワーク**: Hono (Cloudflare Workers対応の軽量Webフレームワーク)
- **言語**: TypeScript
- **スクレイピング**: cheerio を使用してHTML解析

---

## 1. APIエンドポイント設計

### 1.1 イベント一覧取得
```
GET /api/events
```

**説明**: 最新のイベント情報を一覧で取得

**クエリパラメータ**:
| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|----------|------|
| page | number | 1 | ページ番号 |
| limit | number | 10 | 1ページあたりの件数（最大50） |
| category | string | - | イベントカテゴリ（例: "学生向け", "公開講座"） |
| sort | string | "date_desc" | ソート順: date_desc, date_asc, title |

**レスポンス (200 OK)**:
```json
{
  "success": true,
  "data": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "events": [
      {
        "id": "event_20251105_001",
        "title": "イベント名",
        "description": "イベントの説明",
        "date": "2025-11-15",
        "endDate": "2025-11-16",
        "time": "14:00",
        "location": "場所",
        "category": "学生向け",
        "url": "https://wanco.ac.jp/news/xxx",
        "imageUrl": "https://...",
        "isFeatured": false,
        "source": "wanco",
        "scrapedAt": "2025-11-05T01:27:25Z"
      }
    ]
  },
  "meta": {
    "lastScrapedAt": "2025-11-05T01:27:25Z",
    "cacheAge": 3600
  }
}
```

**エラーレスポンス (200 OK で失敗情報を返す)**:
```json
{
  "success": false,
  "error": {
    "code": "SCRAPE_ERROR",
    "message": "スクレイピング中にエラーが発生しました"
  }
}
```

---

### 1.2 イベント詳細取得
```
GET /api/events/:id
```

**説明**: 指定したイベントの詳細情報を取得

**レスポンス (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "event_20251105_001",
    "title": "イベント名",
    "description": "詳細説明",
    "fullContent": "HTML形式の全コンテンツ",
    "date": "2025-11-15",
    "endDate": "2025-11-16",
    "time": "14:00",
    "endTime": "16:00",
    "location": "場所",
    "capacity": 100,
    "registration": {
      "required": true,
      "url": "https://..."
    },
    "category": "学生向け",
    "tags": ["tag1", "tag2"],
    "url": "https://wanco.ac.jp/news/xxx",
    "imageUrl": "https://...",
    "contact": {
      "name": "担当者名",
      "email": "email@example.com",
      "phone": "099-285-xxxx"
    },
    "source": "wanco",
    "scrapedAt": "2025-11-05T01:27:25Z"
  }
}
```

---

### 1.3 イベント情報の再スクレイピング
```
POST /api/events/refresh
```

**説明**: 手動でイベント情報を再取得（管理者向け）

**リクエストボディ**:
```json
{
  "force": true
}
```

**レスポンス (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "スクレイピングを開始しました",
    "eventsFound": 25,
    "eventsUpdated": 3
  }
}
```

---

## 2. データモデル

### Event エンティティ
```typescript
interface Event {
  id: string;              // 一意のID (e.g., "event_20251105_001")
  title: string;           // イベント名
  description: string;     // 短い説明
  fullContent?: string;    // HTML形式の全コンテンツ
  date: string;           // 開始日 (ISO 8601)
  endDate?: string;       // 終了日 (ISO 8601)
  time?: string;          // 開始時刻 (HH:mm)
  endTime?: string;       // 終了時刻 (HH:mm)
  location?: string;      // 開催場所
  capacity?: number;      // 収容数
  registration?: {
    required: boolean;
    url?: string;
    deadline?: string;
  };
  category?: string;      // カテゴリ (例: "学生向け", "公開講座")
  tags?: string[];        // タグ
  url: string;           // 元のニュースURL
  imageUrl?: string;     // イメージ画像URL
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  source: "wanco";       // データソース
  scrapedAt: string;     // スクレイピング日時 (ISO 8601)
}
```

---

## 3. スクレイピング設計

### 3.1 スクレイピング処理の流れ
1. https://wanco.ac.jp/news/ のHTML取得
2. cheerioでHTMLをパース
3. イベント情報を抽出（title, date, description等）
4. イベントデータを正規化
5. メモリまたはDBに保存
6. 過去のイベントはフィルタリング（オプション）

### 3.2 スクレイピング対象要素
- ニュースのタイトル
- 公開日時
- 記事本文からのイベント情報抽出
- 画像URL
- 記事へのリンク

### 3.3 キャッシング戦略
- イベント情報はメモリ/KVストレージにキャッシュ
- キャッシュTTL: デフォルト1時間（3600秒）
- 手動リフレッシュ: `/api/events/refresh` で強制更新

---

## 4. エラーハンドリング

### エラーコード
| コード | HTTPステータス | 説明 |
|-------|----------------|------|
| NOT_FOUND | 404 | イベントが見つかりません |
| SCRAPE_ERROR | 503 | スクレイピング中にエラーが発生 |
| INVALID_PARAMS | 400 | 無効なクエリパラメータ |
| RATE_LIMIT | 429 | レート制限に達しました |
| INTERNAL_ERROR | 500 | サーバー内部エラー |

**エラーレスポンス形式**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ",
    "details": {}
  }
}
```

---

## 5. 技術スタック

| 項目 | 選択 | 理由 |
|-----|------|------|
| フレームワーク | Hono | 軽量、TypeScript対応、Cloudflare Workers対応 |
| HTML解析 | cheerio | jQuery風の記法で使いやすい |
| HTTP Client | fetch (標準) | Cloudflare Workers対応 |
| 言語 | TypeScript | 型安全性、開発体験 |
| スクレイピング | 手動 | 柔軟な抽出ルール適用可能 |

---

## 6. デプロイ構成

### 開発環境
- ローカル環境で Hono の開発サーバーを起動
- `npm run dev`

### 本番環境
- Cloudflare Workers へのデプロイ
- `wrangler publish`

---

## 7. セキュリティ考慮事項

- ✅ XSS対策: HTMLコンテンツは必ずエスケープ
- ✅ レート制限: 1IPアドレスあたり分/秒単位での制限
- ✅ CORS設定: 必要に応じて設定
- ✅ 入力検証: クエリパラメータの検証
- ✅ スクレイピング: User-Agent設定、robots.txt確認

---

## 8. 今後の拡張

- [ ] 複数データソース対応（他大学など）
- [ ] イベント検索機能（全文検索）
- [ ] ユーザー登録・通知機能
- [ ] WebhookによるリアルタイムPush
- [ ] GraphQL APIの提供
- [ ] 自動スクレイピングスケジューラー

---

## 9. ファイル構成案

```
pet-news-events/
├── src/
│   ├── index.ts              # エントリーポイント
│   ├── routes/
│   │   ├── events.ts         # イベントエンドポイント
│   │   └── health.ts         # ヘルスチェック
│   ├── services/
│   │   ├── scraper.ts        # スクレイピングロジック
│   │   └── cache.ts          # キャッシュ管理
│   ├── utils/
│   │   ├── parser.ts         # HTML解析ユーティリティ
│   │   ├── validators.ts     # バリデーション
│   │   └── errors.ts         # カスタムエラー
│   └── types/
│       └── index.ts          # TypeScript型定義
├── wrangler.toml            # Cloudflare Workers設定
├── package.json
├── tsconfig.json
└── README.md
```

---

## 10. 初期タスク優先順位

1. **必須**: Hono プロジェクト初期化、基本的なルーティング
2. **必須**: スクレイピング実装（データ抽出ロジック）
3. **必須**: `/api/events` エンドポイント実装
4. **重要**: キャッシング機構
5. **重要**: エラーハンドリング
6. **低優先**: 詳細取得エンドポイント、手動リフレッシュエンドポイント
