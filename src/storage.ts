import * as fs from 'fs';
import * as path from 'path';
import { ScrapedData, BlogItem } from './types';

export class Storage {
  private dataFile: string;

  constructor(dataFile: string = 'scraped-items.json') {
    this.dataFile = path.resolve(process.cwd(), dataFile);
  }

  /**
   * 既読記事データを読み込む
   */
  load(): ScrapedData {
    try {
      if (!fs.existsSync(this.dataFile)) {
        console.log('No previous data found, starting fresh');
        return { items: [], lastChecked: new Date().toISOString() };
      }

      const data = fs.readFileSync(this.dataFile, 'utf-8');
      const parsed = JSON.parse(data) as ScrapedData;
      console.log(`Loaded ${parsed.items.length} previous items from ${this.dataFile}`);
      return parsed;
    } catch (error) {
      console.error('Error loading data:', error);
      return { items: [], lastChecked: new Date().toISOString() };
    }
  }

  /**
   * 既読記事データを保存する
   */
  save(data: ScrapedData): void {
    try {
      const json = JSON.stringify(data, null, 2);
      fs.writeFileSync(this.dataFile, json, 'utf-8');
      console.log(`Saved ${data.items.length} items to ${this.dataFile}`);
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  }

  /**
   * 新しい記事を追加して保存
   */
  addItems(newItems: BlogItem[]): void {
    const data = this.load();
    data.items.push(...newItems);
    data.lastChecked = new Date().toISOString();

    // 古いデータを削除（最新100件のみ保持）
    if (data.items.length > 100) {
      data.items = data.items.slice(-100);
    }

    this.save(data);
  }
}
