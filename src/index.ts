import * as dotenv from 'dotenv';
import { BlogScraper } from './scraper';
import { LineNotifier } from './line-notifier';
import { Storage } from './storage';
import { Config } from './types';

// .envファイルから環境変数を読み込む（ローカル実行時）
dotenv.config();

async function main() {
  console.log('=== Blog to LINE Bot ===');
  console.log(`Started at: ${new Date().toISOString()}\n`);

  // 環境変数から設定を読み込む
  const config: Config = {
    blogUrl: process.env.BLOG_URL || 'https://jko.hateblo.jp/',
    channels: JSON.parse(process.env.LINE_CHANNELS || '[]'),
  };

  console.log(`Blog URL: ${config.blogUrl}`);
  console.log(`Channels configured: ${config.channels.length}\n`);

  if (config.channels.length === 0) {
    console.error('Error: No LINE channels configured');
    console.error('Please set LINE_CHANNELS environment variable');
    process.exit(1);
  }

  try {
    // 1. ブログをスクレイピング
    const scraper = new BlogScraper(config.blogUrl);
    const currentItems = await scraper.scrape();

    if (currentItems.length === 0) {
      console.log('No blog entries found');
      return;
    }

    // 2. 既読記事データを読み込む
    const storage = new Storage();
    const previousData = storage.load();

    // 3. 新しい記事を抽出
    const newItems = BlogScraper.getNewItems(currentItems, previousData.items);

    console.log(`\nNew items found: ${newItems.length}`);

    if (newItems.length === 0) {
      console.log('No new blog posts to notify');
      storage.save({
        items: previousData.items,
        lastChecked: new Date().toISOString(),
      });
      return;
    }

    // 4. LINE に通知
    console.log('\n--- Sending LINE notifications ---');
    await LineNotifier.notifyAll(config.channels, newItems);

    // 5. 既読記事データを更新（ハッシュ形式で保存）
    const scrapedItems = newItems.map((item) => BlogScraper.toScrapedItem(item));
    storage.addItems(scrapedItems);

    console.log('\n=== Completed successfully ===');
  } catch (error) {
    console.error('\n=== Error occurred ===');
    console.error(error);
    process.exit(1);
  }
}

// 実行
main();
