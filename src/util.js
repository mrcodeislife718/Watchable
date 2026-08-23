import crypto from 'node:crypto';

export const now = () => new Date().toISOString();
export const id = (prefix = 'id') => `${prefix}_${crypto.randomUUID()}`;
export const json = (value) => JSON.stringify(value ?? {});
export const parseJson = (value, fallback = {}) => { try { return JSON.parse(value); } catch { return fallback; } };
export const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
export const timingSafeEqual = (a, b) => {
  const aa = Buffer.from(a); const bb = Buffer.from(b);
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
};
export function sign(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}
