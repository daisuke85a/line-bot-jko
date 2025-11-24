import { Client } from '@line/bot-sdk';
import { BlogItem, Channel } from './types';

export class LineNotifier {
  /**
   * キーワードが記事に含まれているかチェック
   */
  static hasKeyword(channel: Channel, item: BlogItem): boolean {
    if (channel.keyword === '*') {
      return true;
    }

    const searchText = item.title + item.text;
    return searchText.includes(channel.keyword);
  }

  /**
   * LINE にブロードキャストメッセージを送信
   */
  static async notify(channel: Channel, item: BlogItem): Promise<void> {
    try {
      const client = new Client({
        channelAccessToken: channel.accessToken,
        channelSecret: channel.channelSecret,
      });

      const message = `${item.title}\n${item.text}`;

      // LINE の broadcast API を使用
      // 注意: broadcast API は Messaging API の有料プランが必要な場合があります
      // 代わりに multicast や push を使う場合は、別途ユーザーIDの管理が必要です
      await client.broadcast({
        type: 'text',
        text: message,
      });

      console.log(`✓ LINE notification sent (keyword: ${channel.keyword})`);
      console.log(`  Title: ${item.title}`);
    } catch (error) {
      console.error('Error sending LINE notification:', error);
      throw error;
    }
  }

  /**
   * 複数のチャネルに対して、キーワードに一致する記事を通知
   */
  static async notifyAll(channels: Channel[], items: BlogItem[]): Promise<void> {
    for (const item of items) {
      console.log(`\nProcessing item: ${item.title}`);

      for (const channel of channels) {
        if (this.hasKeyword(channel, item)) {
          await this.notify(channel, item);
        } else {
          console.log(`  Skipped (keyword mismatch: ${channel.keyword})`);
        }
      }
    }
  }
}
