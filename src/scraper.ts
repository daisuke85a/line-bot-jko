import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { BlogItem } from './types';

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
   * 2つの記事が同じかどうかを判定
   */
  static isSameItem(item1: BlogItem, item2: BlogItem): boolean {
    return item1.title === item2.title && item1.text === item2.text;
  }

  /**
   * 記事リストから新しい記事を抽出
   */
  static getNewItems(currentItems: BlogItem[], previousItems: BlogItem[]): BlogItem[] {
    return currentItems.filter(
      (currentItem) =>
        !previousItems.some((previousItem) => this.isSameItem(currentItem, previousItem))
    );
  }
}
