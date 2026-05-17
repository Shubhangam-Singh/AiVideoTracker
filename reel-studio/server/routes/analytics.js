import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../auth.js';

const r = Router();

const YT_CLIENT_ID     = process.env.YOUTUBE_CLIENT_ID;
const YT_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const IG_APP_ID        = process.env.INSTAGRAM_APP_ID;
const IG_APP_SECRET    = process.env.INSTAGRAM_APP_SECRET;
const BASE_URL         = process.env.APP_BASE_URL || 'http://localhost:3001';
const CACHE_TTL_MS     = 4 * 60 * 60 * 1000; // 4 hours

// ── DB helpers ────────────────────────────────────────────────────────────────

function getToken(platform) {
  return db.prepare('SELECT * FROM platform_tokens WHERE platform = ?').get(platform);
}

function saveToken(platform, data) {
  db.prepare(`
    INSERT INTO platform_tokens (id, platform, access_token, refresh_token, expires_at, account_id, account_name, connected_at, connected_by)
    VALUES (@id, @platform, @access_token, @refresh_token, @expires_at, @account_id, @account_name, @connected_at, @connected_by)
    ON CONFLICT(platform) DO UPDATE SET
      access_token  = excluded.access_token,
      refresh_token = coalesce(excluded.refresh_token, platform_tokens.refresh_token),
      expires_at    = excluded.expires_at,
      account_id    = coalesce(excluded.account_id, platform_tokens.account_id),
      account_name  = coalesce(excluded.account_name, platform_tokens.account_name),
      connected_at  = excluded.connected_at,
      connected_by  = excluded.connected_by
  `).run({ id: platform + '-token', platform, ...data });
}

function getCache(key) {
  const row = db.prepare('SELECT * FROM analytics_cache WHERE key = ?').get(key);
  if (!row) return null;
  if (Date.now() - row.fetched_at > CACHE_TTL_MS) return null;
  try { return JSON.parse(row.data_json); } catch { return null; }
}

function setCache(key, data) {
  db.prepare(`
    INSERT INTO analytics_cache (key, data_json, fetched_at) VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET data_json = excluded.data_json, fetched_at = excluded.fetched_at
  `).run(key, JSON.stringify(data), Date.now());
}

// ── YouTube ───────────────────────────────────────────────────────────────────

async function refreshYtToken(token) {
  if (!token.refresh_token || !YT_CLIENT_ID || !YT_CLIENT_SECRET) return token;
  if (token.expires_at && token.expires_at > Date.now() + 120_000) return token;
  try {
    const resp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: YT_CLIENT_ID,
        client_secret: YT_CLIENT_SECRET,
        refresh_token: token.refresh_token,
        grant_type: 'refresh_token',
      }),
    });
    if (!resp.ok) return token;
    const data = await resp.json();
    const updated = { ...token, access_token: data.access_token, expires_at: Date.now() + (data.expires_in || 3600) * 1000 };
    saveToken('youtube', updated);
    return updated;
  } catch { return token; }
}

async function fetchYouTubeData(period = '30d') {
  const raw = getToken('youtube');
  if (!raw) return null;
  const cacheKey = `youtube_${period}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const token = await refreshYtToken(raw);
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
  const endDate   = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
  const auth      = `Bearer ${token.access_token}`;

  try {
    const [chResp, anaResp] = await Promise.all([
      fetch('https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&mine=true', { headers: { Authorization: auth } }),
      fetch(
        `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel%3D%3DMINE&startDate=${startDate}&endDate=${endDate}&metrics=views,likes,comments,shares,estimatedMinutesWatched&dimensions=day&sort=day`,
        { headers: { Authorization: auth } }
      ),
    ]);
    if (!chResp.ok || !anaResp.ok) return null;
    const [chData, anaData] = await Promise.all([chResp.json(), anaResp.json()]);
    const channel = chData.items?.[0];
    const rows    = anaData.rows || [];

    const totals = {
      views:    rows.reduce((s, r) => s + (r[1] || 0), 0),
      likes:    rows.reduce((s, r) => s + (r[2] || 0), 0),
      comments: rows.reduce((s, r) => s + (r[3] || 0), 0),
      shares:   rows.reduce((s, r) => s + (r[4] || 0), 0),
      saves:    0,
      watchMins: rows.reduce((s, r) => s + (r[5] || 0), 0),
      subscribers: Number(channel?.statistics?.subscriberCount) || 0,
    };
    const daily = rows.map((row, i) => ({ d: i + 1, yt: row[1] || 0, ig: 0 }));

    // Top videos
    const vidResp = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&chart=mostPopular&maxResults=10&regionCode=IN`,
      { headers: { Authorization: auth } }
    );
    const vidData = vidResp.ok ? await vidResp.json() : { items: [] };
    const videos = (vidData.items || []).map(v => ({
      id: v.id,
      title: v.snippet?.title || '',
      published: v.snippet?.publishedAt?.split('T')[0] || '',
      yt: {
        views:    Number(v.statistics?.viewCount)    || 0,
        likes:    Number(v.statistics?.likeCount)    || 0,
        comments: Number(v.statistics?.commentCount) || 0,
        shares:   0,
        saves:    0,
        watchAvg: '—',
        avgPct:   0,
        ctr:      0,
      },
      ig: { views: 0, likes: 0, comments: 0, shares: 0, saves: 0, watchAvg: '—', avgPct: 0, ctr: 0 },
      daily: [],
      retYt: [100, 80, 65, 52, 44, 38, 32, 28, 25, 22],
      retIg: [100, 70, 55, 42, 35, 28, 24, 21, 18, 16],
    }));

    const result = {
      channel: { id: channel?.id, name: channel?.snippet?.title, subs: totals.subscribers },
      totals,
      daily,
      videos,
    };
    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error('[analytics/youtube]', err.message);
    return null;
  }
}

// ── Instagram ─────────────────────────────────────────────────────────────────

async function fetchInstagramData(period = '30d') {
  const token = getToken('instagram');
  if (!token) return null;
  const cacheKey = `instagram_${period}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const days  = period === '7d' ? 7 : period === '90d' ? 90 : 30;
  const since = Math.floor((Date.now() - days * 86400000) / 1000);
  const until = Math.floor(Date.now() / 1000);
  const igId  = token.account_id;
  const at    = token.access_token;

  try {
    const insResp = await fetch(
      `https://graph.instagram.com/v20.0/${igId}/insights?metric=impressions,reach,profile_views&period=day&since=${since}&until=${until}&access_token=${at}`
    );
    if (!insResp.ok) return null;
    const insData = await insResp.json();
    const impressions = insData.data?.find(d => d.name === 'impressions');
    const daily = (impressions?.values || []).map((v, i) => ({ d: i + 1, yt: 0, ig: v.value || 0 }));
    const totals = {
      views:    daily.reduce((s, d) => s + d.ig, 0),
      likes:    0,
      comments: 0,
      shares:   0,
      saves:    0,
    };

    const medResp = await fetch(
      `https://graph.instagram.com/v20.0/${igId}/media?fields=id,caption,timestamp,like_count,comments_count&limit=10&access_token=${at}`
    );
    const medData = medResp.ok ? await medResp.json() : { data: [] };
    const videos = (medData.data || []).map(m => ({
      id: m.id,
      title: (m.caption || '').slice(0, 60) || 'Reel',
      published: m.timestamp?.split('T')[0] || '',
      yt: { views: 0, likes: 0, comments: 0, shares: 0, saves: 0, watchAvg: '—', avgPct: 0, ctr: 0 },
      ig: {
        views:    0,
        likes:    m.like_count    || 0,
        comments: m.comments_count || 0,
        shares:   0,
        saves:    0,
        watchAvg: '—',
        avgPct:   0,
        ctr:      0,
      },
      daily: [],
      retYt: [],
      retIg: [],
    }));

    const result = {
      account: { id: igId, name: token.account_name },
      totals,
      daily,
      videos,
    };
    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error('[analytics/instagram]', err.message);
    return null;
  }
}

// ── Routes ────────────────────────────────────────────────────────────────────

r.get('/status', requireAuth, (_req, res) => {
  const yt = getToken('youtube');
  const ig = getToken('instagram');
  res.json({
    youtube: {
      connected: !!yt,
      configured: !!(YT_CLIENT_ID && YT_CLIENT_SECRET),
      account: yt?.account_name || yt?.account_id || null,
      connectedAt: yt?.connected_at || null,
    },
    instagram: {
      connected: !!ig,
      configured: !!(IG_APP_ID && IG_APP_SECRET),
      account: ig?.account_name || ig?.account_id || null,
      connectedAt: ig?.connected_at || null,
    },
  });
});

r.get('/connect/youtube', requireAuth, (req, res) => {
  if (!YT_CLIENT_ID) return res.status(503).json({ error: 'YOUTUBE_CLIENT_ID not set' });
  const redirectUri = `${BASE_URL}/api/analytics/callback/youtube`;
  const params = new URLSearchParams({
    client_id: YT_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
    ].join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: req.session.userId,
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

r.get('/callback/youtube', async (req, res) => {
  const { code, state, error } = req.query;
  if (error || !code) return res.redirect('/#analytics?error=youtube_denied');
  if (!YT_CLIENT_ID || !YT_CLIENT_SECRET) return res.redirect('/#analytics?error=not_configured');
  const redirectUri = `${BASE_URL}/api/analytics/callback/youtube`;
  try {
    const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code, client_id: YT_CLIENT_ID, client_secret: YT_CLIENT_SECRET,
        redirect_uri: redirectUri, grant_type: 'authorization_code',
      }),
    });
    if (!tokenResp.ok) throw new Error('token exchange failed');
    const tokens = await tokenResp.json();
    const chResp = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );
    const chData = chResp.ok ? await chResp.json() : {};
    const ch = chData.items?.[0];
    saveToken('youtube', {
      platform: 'youtube',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || null,
      expires_at: tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : null,
      account_id: ch?.id || null,
      account_name: ch?.snippet?.title || null,
      connected_at: Date.now(),
      connected_by: state || null,
    });
    fetchYouTubeData('30d').catch(() => {});
    res.redirect('/?page=analytics&connected=youtube');
  } catch (err) {
    console.error('[analytics/callback/youtube]', err);
    res.redirect('/?page=analytics&error=youtube_failed');
  }
});

r.get('/connect/instagram', requireAuth, (req, res) => {
  if (!IG_APP_ID) return res.status(503).json({ error: 'INSTAGRAM_APP_ID not set' });
  const redirectUri = `${BASE_URL}/api/analytics/callback/instagram`;
  const params = new URLSearchParams({
    client_id: IG_APP_ID,
    redirect_uri: redirectUri,
    scope: 'instagram_basic,instagram_manage_insights',
    response_type: 'code',
    state: req.session.userId,
  });
  res.redirect(`https://www.facebook.com/v20.0/dialog/oauth?${params}`);
});

r.get('/callback/instagram', async (req, res) => {
  const { code, state, error } = req.query;
  if (error || !code) return res.redirect('/?page=analytics&error=instagram_denied');
  if (!IG_APP_ID || !IG_APP_SECRET) return res.redirect('/?page=analytics&error=not_configured');
  const redirectUri = `${BASE_URL}/api/analytics/callback/instagram`;
  try {
    const tokenResp = await fetch('https://graph.facebook.com/v20.0/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: IG_APP_ID, client_secret: IG_APP_SECRET, redirect_uri: redirectUri, code }),
    });
    if (!tokenResp.ok) throw new Error('token exchange failed');
    const shortToken = await tokenResp.json();
    const llResp = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${IG_APP_SECRET}&access_token=${shortToken.access_token}`
    );
    if (!llResp.ok) throw new Error('long-lived token failed');
    const llToken = await llResp.json();
    const meResp = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${llToken.access_token}`);
    const me = meResp.ok ? await meResp.json() : {};
    saveToken('instagram', {
      platform: 'instagram',
      access_token: llToken.access_token,
      refresh_token: null,
      expires_at: llToken.expires_in ? Date.now() + llToken.expires_in * 1000 : null,
      account_id: me.id || null,
      account_name: me.username ? `@${me.username}` : null,
      connected_at: Date.now(),
      connected_by: state || null,
    });
    fetchInstagramData('30d').catch(() => {});
    res.redirect('/?page=analytics&connected=instagram');
  } catch (err) {
    console.error('[analytics/callback/instagram]', err);
    res.redirect('/?page=analytics&error=instagram_failed');
  }
});

r.delete('/disconnect/:platform', requireAuth, (req, res) => {
  const { platform } = req.params;
  if (!['youtube', 'instagram'].includes(platform)) return res.status(400).json({ error: 'invalid platform' });
  db.prepare('DELETE FROM platform_tokens WHERE platform = ?').run(platform);
  db.prepare('DELETE FROM analytics_cache WHERE key LIKE ?').run(platform + '_%');
  res.json({ ok: true });
});

r.post('/sync', requireAuth, async (_req, res) => {
  db.prepare('DELETE FROM analytics_cache').run();
  const [yt, ig] = await Promise.allSettled([fetchYouTubeData('30d'), fetchInstagramData('30d')]);
  res.json({
    ok: true,
    youtube:   yt.status === 'fulfilled' && !!yt.value,
    instagram: ig.status === 'fulfilled' && !!ig.value,
  });
});

r.get('/data', requireAuth, async (req, res) => {
  const period = ['7d', '30d', '90d'].includes(req.query.period) ? req.query.period : '30d';
  const [yt, ig] = await Promise.allSettled([fetchYouTubeData(period), fetchInstagramData(period)]);
  const ytData = yt.status === 'fulfilled' ? yt.value : null;
  const igData = ig.status === 'fulfilled' ? ig.value : null;

  const maxLen = Math.max(ytData?.daily?.length || 0, igData?.daily?.length || 0);
  const daily  = maxLen > 0
    ? Array.from({ length: maxLen }, (_, i) => ({
        d:  i + 1,
        yt: ytData?.daily?.[i]?.yt || 0,
        ig: igData?.daily?.[i]?.ig || 0,
      }))
    : [];

  // Merge per-video data
  const ytVids = ytData?.videos || [];
  const igVids = igData?.videos || [];
  const videos = ytVids.map(v => {
    const igMatch = igVids.find(m => m.title === v.title);
    return igMatch ? { ...v, ig: igMatch.ig } : v;
  });

  res.json({
    connected: { youtube: !!ytData, instagram: !!igData },
    isDemo: !ytData && !igData,
    youtube:   ytData ? { totals: ytData.totals, channel: ytData.channel } : null,
    instagram: igData ? { totals: igData.totals, account: igData.account } : null,
    daily,
    videos: videos.length ? videos : igVids,
  });
});

export default r;
