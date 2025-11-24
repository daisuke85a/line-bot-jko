export interface BlogItem {
  title: string;
  text: string;
}

export interface Channel {
  accessToken: string;
  channelSecret: string;
  keyword: string; // キーワードフィルタ。"*"の場合は全ての記事を通知
}

export interface Config {
  blogUrl: string;
  channels: Channel[];
}

export interface ScrapedItem {
  title: string;
  hash: string; // 本文のSHA-256ハッシュ
}

export interface ScrapedData {
  items: ScrapedItem[]; // タイトル + ハッシュで重複チェック（ファイルサイズ削減）
  lastChecked: string;
}
