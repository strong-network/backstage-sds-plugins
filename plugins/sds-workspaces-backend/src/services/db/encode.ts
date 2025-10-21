export function decode<T = unknown>(str: string): T {
  return JSON.parse(Buffer.from(str, 'base64').toString('utf8'));
}
export function encode(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj)).toString('base64');
}
