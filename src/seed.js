import { getDb } from './db.js';
import { id, now } from './util.js';
import { registerSource } from './content.js';

export function seedDemo() {
  const db = getDb();

  if (!db.prepare('SELECT 1 FROM reps LIMIT 1').get()) {
    db.prepare(
      'INSERT INTO reps(id,code,name,email,status,default_rate,created_at) VALUES(?,?,?,?,?,?,?)',
    ).run(
      id('rep'),
      'FOUNDING20',
      'Founding Sales Rep',
      'sales@example.com',
      'active',
      0.2,
      now(),
    );
  }

  if (db.prepare('SELECT COUNT(*) count FROM channels').get().count === 0) {
    const source = registerSource({
      name: 'Watchable Demo Rights-Cleared Fixtures',
      adapterType: 'VOD',
      rightsVerified: true,
      status: 'active',
    });

    const channels = [
      ['news-demo', 'Watchable News Demo', 'News', 0, 0],
      ['sports-demo', 'Watchable Sports Demo', 'Sports', 0, 1],
      ['premium-demo', 'Watchable Premium Demo', 'Premium', 1, 0],
      ['culture-demo', 'Watchable Culture Demo', 'Black / Latino / Asian', 0, 0],
      ['kids-demo', 'Watchable Kids Demo', 'Kids', 0, 0],
      ['stage-demo', 'Watchable Stage Demo', 'Stage & Broadway', 0, 0],
      ['music-demo', 'Watchable Live Demo', 'Music & Concerts', 0, 0],
    ];

    for (const [slug, name, category, premium, sports] of channels) {
      const channelId = id('chn');
      const metadata = {
        demo: true,
        languages: ['en', 'es'],
        subtitleLanguages: ['en', 'es', 'fr', 'pt', 'ko', 'ja', 'zh', 'hi'],
        audioLanguages: ['en', 'es'],
        audience: category === 'Kids' ? 'kids' : 'general',
        categories: [category],
      };

      db.prepare(
        'INSERT INTO channels(id,source_id,slug,name,category,playback_url,playback_type,premium,sports,active,territories,dvr_allowed,metadata_json) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',
      ).run(
        channelId,
        source,
        slug,
        name,
        category,
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        'mp4',
        premium,
        sports,
        1,
        'US',
        1,
        JSON.stringify(metadata),
      );

      for (let index = 0; index < 4; index += 1) {
        const startsAt = new Date(Date.now() + index * 3_600_000);
        const endsAt = new Date(startsAt.getTime() + 3_600_000);
        db.prepare(
          'INSERT INTO programs(id,channel_id,title,description,starts_at,ends_at,rating,metadata_json) VALUES(?,?,?,?,?,?,?,?)',
        ).run(
          id('prg'),
          channelId,
          `${name} — Program ${index + 1}`,
          'Rights-cleared development fixture.',
          startsAt.toISOString(),
          endsAt.toISOString(),
          category === 'Kids' ? 'TV-Y7' : 'TV-PG',
          JSON.stringify(metadata),
        );
      }
    }

    const assets = [
      ['big-buck-bunny', 'Watchable Film Demo', 'movie', 'general'],
      ['watchable-short-demo', 'Watchable Shorts Discovery', 'short', 'general'],
      ['kids-original-demo', 'Watchable Kids Original Demo', 'series', 'kids'],
      ['comedy-special-demo', 'Watchable Comedy Special Demo', 'special', 'adult'],
      ['spanish-premium-demo', 'Watchable Español Premium Demo', 'series', 'general'],
      ['anime-demo', 'Watchable Anime Demo', 'series', 'general'],
      ['hbcu-demo', 'Watchable HBCU Demo', 'documentary', 'general'],
      ['true-crime-demo', 'Watchable True Crime Demo', 'documentary', 'adult'],
    ];

    for (const [slug, title, kind, audience] of assets) {
      const assetId = id('vod');
      const metadata = {
        demo: true,
        shortForm: kind === 'short',
        audience,
        languages: ['en', 'es'],
        subtitleLanguages: ['en', 'es', 'fr', 'pt', 'ko', 'ja', 'zh', 'hi'],
        audioDescription: true,
        signLanguageTrackAvailable: false,
        moods: ['fun', 'discover'],
      };

      db.prepare(
        'INSERT INTO vod_assets(id,source_id,slug,title,description,kind,playback_url,playback_type,premium,active,territories,download_allowed,metadata_json) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',
      ).run(
        assetId,
        source,
        slug,
        title,
        'Rights-cleared development fixture.',
        kind,
        'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        'mp4',
        0,
        1,
        'US',
        1,
        JSON.stringify(metadata),
      );

      for (const language of ['en', 'es', 'fr', 'pt', 'ko', 'ja', 'zh', 'hi']) {
        db.prepare(
          'INSERT INTO media_tracks(id,asset_type,asset_id,track_type,language,label,format,is_default,created_at) VALUES(?,?,?,?,?,?,?,?,?)',
        ).run(
          id('trk'),
          'vod',
          assetId,
          'subtitle',
          language,
          `${language.toUpperCase()} subtitles`,
          'vtt',
          language === 'en' ? 1 : 0,
          now(),
        );
      }
    }
  }

  if (!db.prepare('SELECT 1 FROM creators LIMIT 1').get()) {
    const creatorId = id('crt');
    db.prepare(
      'INSERT INTO creators(id,slug,name,bio,ownership_policy,created_at) VALUES(?,?,?,?,?,?)',
    ).run(
      creatorId,
      'watchable-demo-creator',
      'Watchable Creator Demo',
      'Fixture demonstrating transparent creator economics and creator-friendly ownership.',
      'creator-friendly',
      now(),
    );
    db.prepare(
      'INSERT INTO fan_clubs(id,creator_id,name,monthly_price_cents,benefits_json,created_at) VALUES(?,?,?,?,?,?)',
    ).run(
      id('fan'),
      creatorId,
      'Founding Fans',
      499,
      JSON.stringify({ benefits: ['early access', 'live chats', 'premieres'] }),
      now(),
    );
    db.prepare(
      'INSERT INTO creator_revenue_events(id,creator_id,revenue_type,gross_cents,creator_cents,watchable_cents,reference,created_at) VALUES(?,?,?,?,?,?,?,?)',
    ).run(id('rev'), creatorId, 'advertising', 10_000, 7_000, 3_000, 'DEMO', now());
  }

  if (!db.prepare('SELECT 1 FROM live_events LIMIT 1').get()) {
    db.prepare(
      'INSERT INTO live_events(id,slug,title,event_type,description,starts_at,ppv_price_cents,status,metadata_json) VALUES(?,?,?,?,?,?,?,?,?)',
    ).run(
      id('evt'),
      'watchable-premiere-demo',
      'Watchable Premiere Night',
      'premiere',
      'Countdown, live chat and aftershow development fixture.',
      new Date(Date.now() + 86_400_000).toISOString(),
      0,
      'scheduled',
      JSON.stringify({ chat: true, aftershow: true }),
    );
  }

  if (!db.prepare('SELECT 1 FROM franchises LIMIT 1').get()) {
    const franchiseId = id('fr');
    db.prepare('INSERT INTO franchises(id,name,owner_json,created_at) VALUES(?,?,?,?)').run(
      franchiseId,
      'Watchable Original Demo',
      JSON.stringify({ watchable: 100 }),
      now(),
    );

    for (const rightType of [
      'soundtrack',
      'merchandise',
      'books',
      'games',
      'live_show',
      'licensing',
      'international_remake',
      'spinoff',
      'characters',
    ]) {
      db.prepare(
        'INSERT INTO franchise_rights(id,franchise_id,right_type,territory,owner,status,terms_json) VALUES(?,?,?,?,?,?,?)',
      ).run(id('right'), franchiseId, rightType, 'WORLD', 'Watchable', 'available', '{}');
    }
  }
}
