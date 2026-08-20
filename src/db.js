import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { config } from './config.js';

let db;

export function getDb() {
  if (db) return db;
  fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });
  db = new DatabaseSync(config.databasePath);
  db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');
  migrate(db);
  return db;
}

function migrate(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan_id TEXT NOT NULL,
      status TEXT NOT NULL,
      billing_provider TEXT NOT NULL,
      provider_customer_id TEXT,
      provider_subscription_id TEXT,
      current_period_end TEXT,
      originating_rep_id TEXT,
      commission_rate REAL NOT NULL DEFAULT 0.20,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS reps (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      default_rate REAL NOT NULL DEFAULT 0.20,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS commission_events (
      id TEXT PRIMARY KEY,
      rep_id TEXT NOT NULL REFERENCES reps(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      subscription_id TEXT NOT NULL REFERENCES subscriptions(id),
      payment_reference TEXT UNIQUE NOT NULL,
      gross_cents INTEGER NOT NULL,
      rate REAL NOT NULL,
      commission_cents INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'earned',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      platform TEXT NOT NULL,
      last_seen_at TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      is_kids INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS content_sources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      adapter_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'inactive',
      rights_verified INTEGER NOT NULL DEFAULT 0,
      config_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS channels (
      id TEXT PRIMARY KEY,
      source_id TEXT REFERENCES content_sources(id),
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      logo_url TEXT,
      playback_url TEXT,
      playback_type TEXT NOT NULL DEFAULT 'mp4',
      premium INTEGER NOT NULL DEFAULT 0,
      sports INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      rights_start TEXT,
      rights_end TEXT,
      territories TEXT NOT NULL DEFAULT 'US',
      dvr_allowed INTEGER NOT NULL DEFAULT 0,
      metadata_json TEXT NOT NULL DEFAULT '{}'
    );
    CREATE TABLE IF NOT EXISTS programs (
      id TEXT PRIMARY KEY,
      channel_id TEXT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      starts_at TEXT NOT NULL,
      ends_at TEXT NOT NULL,
      rating TEXT,
      image_url TEXT
    );
    CREATE TABLE IF NOT EXISTS vod_assets (
      id TEXT PRIMARY KEY,
      source_id TEXT REFERENCES content_sources(id),
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      kind TEXT NOT NULL,
      playback_url TEXT,
      playback_type TEXT NOT NULL DEFAULT 'mp4',
      premium INTEGER NOT NULL DEFAULT 0,
      image_url TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      rights_start TEXT,
      rights_end TEXT,
      territories TEXT NOT NULL DEFAULT 'US',
      download_allowed INTEGER NOT NULL DEFAULT 0,
      metadata_json TEXT NOT NULL DEFAULT '{}'
    );
    CREATE TABLE IF NOT EXISTS playback_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      asset_type TEXT NOT NULL,
      asset_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS dvr_recordings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      program_id TEXT NOT NULL REFERENCES programs(id),
      status TEXT NOT NULL DEFAULT 'scheduled',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS favorites (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      asset_type TEXT NOT NULL,
      asset_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY(user_id,asset_type,asset_id)
    );
    CREATE TABLE IF NOT EXISTS watch_events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      profile_id TEXT,
      asset_type TEXT NOT NULL,
      asset_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      position_seconds REAL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ad_campaigns (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      creative_url TEXT NOT NULL,
      click_url TEXT,
      starts_at TEXT,
      ends_at TEXT,
      target_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ad_impressions (
      id TEXT PRIMARY KEY,
      campaign_id TEXT NOT NULL REFERENCES ad_campaigns(id),
      user_id TEXT REFERENCES users(id),
      asset_type TEXT,
      asset_id TEXT,
      event_type TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      actor_user_id TEXT,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      detail_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL
    );
  `);
}

export function closeDb() {
  if (db) db.close();
  db = undefined;
}
