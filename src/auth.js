import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { getDb } from './db.js';
import { id, now, sha256, timingSafeEqual } from './util.js';

const scrypt = promisify(crypto.scrypt);

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64);
  return `${salt}:${Buffer.from(key).toString('hex')}`;
}

export async function verifyPassword(password, stored) {
  const [salt, expected] = stored.split(':');
  if (!salt || !expected) return false;
  const key = await scrypt(password, salt, 64);
  return timingSafeEqual(Buffer.from(key).toString('hex'), expected);
}

export async function createUser({ email, password, displayName, role = 'customer' }) {
  const db = getDb();
  const userId = id('usr');
  db.prepare('INSERT INTO users (id,email,password_hash,display_name,role,created_at) VALUES (?,?,?,?,?,?)')
    .run(userId, email.trim().toLowerCase(), await hashPassword(password), displayName.trim(), role, now());
  db.prepare('INSERT INTO profiles (id,user_id,name,is_kids,created_at) VALUES (?,?,?,?,?)')
    .run(id('pro'), userId, displayName.trim(), 0, now());
  return getUserById(userId);
}

export function getUserById(userId) {
  return getDb().prepare('SELECT id,email,display_name,role,created_at FROM users WHERE id=?').get(userId) || null;
}

export function getUserAuthByEmail(email) {
  return getDb().prepare('SELECT * FROM users WHERE email=?').get(email.trim().toLowerCase()) || null;
}

export function createSession(userId, days = 30) {
  const token = crypto.randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + days * 86400000).toISOString();
  getDb().prepare('INSERT INTO sessions (token_hash,user_id,expires_at,created_at) VALUES (?,?,?,?)')
    .run(sha256(token), userId, expires, now());
  return { token, expiresAt: expires };
}

export function userFromToken(token) {
  if (!token) return null;
  const row = getDb().prepare(`SELECT u.id,u.email,u.display_name,u.role,u.created_at,s.expires_at
    FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=?`).get(sha256(token));
  if (!row || Date.parse(row.expires_at) <= Date.now()) return null;
  return row;
}

export function revokeSession(token) {
  if (token) getDb().prepare('DELETE FROM sessions WHERE token_hash=?').run(sha256(token));
}
