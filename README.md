# Pet News Events API

WANCOのニュースページからイベント情報を取得し、REST APIとして提供するサービスです。

## クイックスタート

### インストール

```bash
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

`http://localhost:8787` でアクセス可能です。

### ビルド

```bash
npm run build
```

### Cloudflare Workers へのデプロイ

```bash
npm run deploy
```

## API エンドポイント

- `GET /` - ルートエンドポイント
- `GET /health` - ヘルスチェック
- `GET /api/events` - イベント一覧取得
- `GET /api/events/:id` - イベント詳細取得
- `POST /api/events/refresh` - 手動リフレッシュ

## ドキュメント

- [API設計書](API_DESIGN.md)
- [実装計画書](IMPLEMENTATION_PLAN.md)

## 環境変数

- `ADMIN_API_KEY` - 管理者向けエンドポイントのAPIキー（本番環境）

## 開発

TypeScript を使用しており、型安全な開発ができます。

```bash
npm run type-check  # 型チェック
```

## ライセンス

MIT
