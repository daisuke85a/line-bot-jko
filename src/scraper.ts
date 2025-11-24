import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { BlogItem, ScrapedItem } from './types';
import { generateHash } from './hash';

export class BlogScraper {
  constructor(private blogUrl: string) {}

  async scrape(): Promise<BlogItem[]> {
    try {
      console.log(`Fetching blog: ${this.blogUrl}`);
      const response = await fetch(this.blogUrl);
      const html = await response.text();

      const $ = cheerio.load(html);
      const items: BlogItem[] = [];

      $('.entry').each((_, element) => {
        const titleElement = $(element).find('.entry-title a');
        const title = titleElement.text().trim();

        let text = '';
        $(element)
          .find('.entry-content > *')
          .each((_, contentElement) => {
            const elementText = $(contentElement).text().trim();
            if (elementText) {
              text += (text ? '\n\n' : '') + elementText;
            }
          });

        if (title && text) {
          items.push({ title, text });
        }
      });

      console.log(`Found ${items.length} blog entries`);
      return items;
    } catch (error) {
      console.error('Error scraping blog:', error);
      throw error;
    }
  }

  /**
   * 記事リストから新しい記事を抽出（タイトル + 本文ハッシュで比較）
   */
  static getNewItems(currentItems: BlogItem[], previousItems: ScrapedItem[]): BlogItem[] {
    // 既存記事のハッシュセットを作成（高速検索のため）
    const previousHashes = new Set(
      previousItems.map((item) => `${item.title}::${item.hash}`)
    );

    return currentItems.filter((currentItem) => {
      const currentHash = generateHash(currentItem.text);
      const key = `${currentItem.title}::${currentHash}`;
      return !previousHashes.has(key);
    });
  }

  /**
   * BlogItem から ScrapedItem への変換
   */
  static toScrapedItem(item: BlogItem): ScrapedItem {
    return {
      title: item.title,
      hash: generateHash(item.text),
    };
  }
}
