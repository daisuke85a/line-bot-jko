# line-bot-jko

ブログ更新を毎朝11時に自動検出してLINEに通知するBot（GitHub Actions版）

## 特徴

- **完全無料**: GitHub Actionsで実行するため、運用費用0円
- **自動実行**: 毎日11時（日本時間）に自動でブログをチェック
- **キーワードフィルタ**: 特定のキーワードを含む記事のみ通知可能
- **複数チャネル対応**: 複数のLINEチャネルに同時配信可能
- **TypeScript実装**: 型安全で保守性の高いコード

## 仕組み

1. GitHub Actionsが毎日11時（日本時間）に起動
2. 指定したブログ（https://jko.hateblo.jp/）をスクレイピング
3. 前回チェック時から新しい記事があるかチェック
   - タイトル + 本文のSHA-256ハッシュで重複判定
   - タイトルが同じで本文だけ変更された場合も検出
4. 新しい記事があれば、キーワードフィルタを適用してLINEに通知
5. 既読記事データをGitHubリポジトリに保存
   - 本文ではなくハッシュのみ保存（最新50件まで）
   - ファイルサイズを大幅に削減（約1KB程度）

## セットアップ

### 1. LINE Messaging API の準備

1. [LINE Developers Console](https://developers.line.biz/console/) にアクセス
2. 新規プロバイダーとチャネルを作成（Messaging API）
3. 以下の情報を取得:
   - Channel Access Token（長期）
   - Channel Secret

### 2. リポジトリのセットアップ

このリポジトリをフォークまたはクローン:

```bash
git clone https://github.com/yourusername/line-bot-jko.git
cd line-bot-jko
npm install
```

### 3. GitHub Secrets の設定

リポジトリの Settings → Secrets and variables → Actions で以下のSecretを追加:

#### `BLOG_URL` (オプション)
監視するブログのURL（デフォルト: https://jko.hateblo.jp/）

```
https://jko.hateblo.jp/
```

#### `LINE_CHANNELS` (必須)
LINE チャネルの設定をJSON配列で指定:

```json
[
  {
    "accessToken": "YOUR_CHANNEL_ACCESS_TOKEN_1",
    "channelSecret": "YOUR_CHANNEL_SECRET_1",
    "keyword": "代行"
  },
  {
    "accessToken": "YOUR_CHANNEL_ACCESS_TOKEN_2",
    "channelSecret": "YOUR_CHANNEL_SECRET_2",
    "keyword": "*"
  }
]
```

**キーワードフィルタの説明:**
- `"keyword": "*"` - すべての記事を通知
- `"keyword": "代行"` - "代行"という文字列を含む記事のみ通知
- `"keyword": "山田"` - "山田"という文字列を含む記事のみ通知

### 4. GitHub Actionsの有効化

1. リポジトリの Settings → Actions → General に移動
2. "Workflow permissions" で "Read and write permissions" を選択
3. リポジトリの Actions タブから "Check Blog and Notify LINE" ワークフローを確認

### 5. 動作確認

手動でワークフローを実行して動作確認:

1. Actions タブを開く
2. "Check Blog and Notify LINE" を選択
3. "Run workflow" ボタンをクリック

## ローカルでの実行

開発・テスト用にローカルで実行することもできます:

```bash
# 環境変数を設定
export BLOG_URL="https://jko.hateblo.jp/"
export LINE_CHANNELS='[{"accessToken":"YOUR_TOKEN","channelSecret":"YOUR_SECRET","keyword":"*"}]'

# ビルドして実行
npm run build
npm start

# または開発モードで実行
npm run dev
```

## プロジェクト構成

```
line-bot-jko/
├── .github/
│   └── workflows/
│       └── check-blog.yml    # GitHub Actions ワークフロー
├── src/
│   ├── index.ts              # メイン処理
│   ├── scraper.ts            # ブログスクレイピング
│   ├── line-notifier.ts      # LINE通知
│   ├── storage.ts            # データ保存
│   └── types.ts              # 型定義
├── package.json
├── tsconfig.json
└── README.md
```

## 技術スタック

- **TypeScript**: 型安全な開発
- **Node.js**: ランタイム
- **cheerio**: HTMLパース・スクレイピング
- **@line/bot-sdk**: LINE Messaging API
- **GitHub Actions**: 自動実行・無料ホスティング

## カスタマイズ

### ブログURLの変更

環境変数 `BLOG_URL` を変更するか、`src/index.ts` のデフォルト値を変更してください。

### スクレイピングロジックの変更

異なるブログ構造に対応する場合は、`src/scraper.ts` のセレクタを変更してください:

```typescript
// はてなブログの例（現在の設定）
$('.entry').each((_, element) => {
  const title = $(element).find('.entry-title a').text().trim();
  const text = $(element).find('.entry-content > *').text().trim();
  // ...
});
```

### 実行時間の変更

`.github/workflows/check-blog.yml` のcron設定を変更:

```yaml
schedule:
  # 毎日11時（日本時間）= UTC 2:00
  - cron: '0 2 * * *'
```

## トラブルシューティング

### 通知が届かない

1. LINE Developers Console でチャネルの設定を確認
2. GitHub Actions のログを確認（Actions タブ）
3. `LINE_CHANNELS` の JSON フォーマットが正しいか確認

### GitHub Actions が実行されない

1. リポジトリの Settings → Actions で Workflow permissions を確認
2. `.github/workflows/check-blog.yml` が正しく配置されているか確認

### 既読記事データが保存されない

1. GitHub Actions の Write permissions が有効か確認
2. `scraped-items.json` がコミットされているか確認

## ライセンス

MIT

## クレジット

元の実装: [blogPushLine](https://github.com/daisuke85a/blogPushLine) (Laravel版)
