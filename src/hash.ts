import * as crypto from 'crypto';

/**
 * 文字列からSHA-256ハッシュを生成
 */
export function generateHash(text: string): string {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}
