// Shared data + helpers for Reel Studio

export const NAV = [
  { id: 'dashboard', label: 'Dashboard', meta: '01' },
  { id: 'analytics', label: 'Analytics', meta: '02' },
  { id: 'chat',      label: 'Chat',      meta: '03' },
  { id: 'pipeline',  label: 'Pipeline',  meta: '04' },
  { id: 'prompts',   label: 'Prompts',   meta: '05' },
  { id: 'tasks',     label: 'Tasks',     meta: '06' },
  { id: 'tools',     label: 'Tools',     meta: '07' },
  { id: 'targets',   label: 'Targets',   meta: '08' },
  { id: 'strategy',  label: 'Strategy',  meta: '09' },
];

export const VIDEOS = [
  { id: 'v01', title: 'The Mirror King', part: 'Part 3', status: 'editing',    tool: 'PicsArt Flow',   assignees: ['s1'], frames: 14, due: 'Today',     stage: 'editing' },
  { id: 'v02', title: 'The Last Astronaut', part: 'Part 2', status: 'editing',  tool: 'Google Vids',    assignees: ['s2'], frames: 9,  due: 'Tomorrow',  stage: 'editing' },
  { id: 'v03', title: 'Brainrot Concept — Kids Niche', part: '',  status: 'idea', tool: 'brainrot.mov', assignees: ['s1','s2'], frames: 0, due: 'Thu', stage: 'idea' },
  { id: 'v04', title: 'Slowmotion Tea Ritual', part: '', status: 'generating', tool: 'Gemini', assignees: ['s2'], frames: 6, due: 'Fri', stage: 'generating' },
  { id: 'v05', title: 'Soft Apocalypse', part: 'Part 1', status: 'scripting', tool: '—', assignees: ['s1'], frames: 0, due: 'Mon', stage: 'scripting' },
  { id: 'v06', title: 'Letters Never Sent', part: '', status: 'done', tool: 'phot.ai', assignees: ['s2'], frames: 12, due: 'Mar 04', stage: 'done' },
  { id: 'v07', title: 'Quiet Cities', part: 'Part 2', status: 'done', tool: 'PicsArt Flow', assignees: ['s1'], frames: 18, due: 'Mar 01', stage: 'done' },
  { id: 'v08', title: 'A Cat Reviews Art', part: '', status: 'idea', tool: 'brainrot.mov', assignees: ['s2'], frames: 0, due: '—', stage: 'idea' },
  { id: 'v09', title: 'Origami Architectures', part: '', status: 'scripting', tool: '—', assignees: ['s1','s2'], frames: 0, due: 'Wed', stage: 'scripting' },
  { id: 'v10', title: 'The Mirror King', part: 'Part 4', status: 'generating', tool: 'PicsArt Flow', assignees: ['s1'], frames: 4, due: 'Sun', stage: 'generating' },
];

export const STAGES = [
  { id: 'idea',       label: 'Idea',       dot: 'gray'  },
  { id: 'scripting',  label: 'Scripting',  dot: 'gray'  },
  { id: 'generating', label: 'Generating', dot: 'terra' },
  { id: 'editing',    label: 'Editing',    dot: 'terra' },
  { id: 'done',       label: 'Done',       dot: 'sage'  },
];

export const STATUS_TO_PILL = {
  done: 'sage',
  editing: 'terra',
  generating: 'terra',
  scripting: 'gray',
  idea: 'gray',
};

export const STATUS_TO_DOT = {
  done: 'sage',
  editing: 'terra',
  generating: 'terra',
  scripting: 'gray',
  idea: 'gray',
};

export const TASKS = [
  { id: 't1', who: 's1', label: 'Generate Part 4 prompt — Mirror King',         due: 'Today',    video: 'Mirror King p4', done: false },
  { id: 't2', who: 's1', label: 'Test PicsArt Flow Copilot for face continuity', due: 'Today',    video: 'R&D',           done: false },
  { id: 't3', who: 's1', label: 'Draft script — Soft Apocalypse',                due: 'Mon',      video: 'Soft Apocalypse', done: false },
  { id: 't4', who: 's1', label: 'Cut B-roll — Quiet Cities p2',                  due: 'Yesterday', video: 'Quiet Cities',  done: true },
  { id: 't5', who: 's2', label: 'Color pass — Last Astronaut p2',                due: 'Tomorrow', video: 'Last Astronaut', done: false },
  { id: 't6', who: 's2', label: 'Source SFX — Slowmotion Tea',                   due: 'Fri',      video: 'Tea Ritual',     done: false },
  { id: 't7', who: 's2', label: 'Upload schedule — March W2',                    due: 'Wed',      video: 'Ops',            done: false },
  { id: 't8', who: 's2', label: 'Thumbnail variants — Letters Never Sent',       due: 'Mar 02',   video: 'Letters',        done: true },
];

export const PROMPTS = [
  {
    id: 'p1',
    title: 'Mirror King — Part 3, Frame 07',
    tool: 'PicsArt Flow',
    frames: 14,
    body: 'wide-angle, low light. a king made of mirrors faces the ocean. cinematic. soft fog. 35mm grain. moody warm-cool contrast. subject framed left-third. anamorphic flare from sunset.',
  },
  {
    id: 'p2',
    title: 'Last Astronaut — establishing shot',
    tool: 'Gemini',
    frames: 9,
    body: 'astronaut walking on beach at dusk, silhouette, indigo-to-rose gradient sky, helmet reflection of city lights, lonely composition, no text, 21:9, photographic.',
  },
  {
    id: 'p3',
    title: 'Slowmotion Tea Ritual — close-ups',
    tool: 'Gemini',
    frames: 6,
    body: 'close-up of steaming tea pouring, soft natural window light, ceramic cup, ASMR-style framing, depth of field, gentle camera pull-back, no person visible.',
  },
  {
    id: 'p4',
    title: 'Brainrot concept — kids niche',
    tool: 'brainrot.mov',
    frames: 0,
    body: 'absurd hyper-saturated scene, talking fruits arguing about screen time, kids cartoon style, 9:16, jump cuts, loud captions, designed for retention spikes at 0.5s.',
  },
  {
    id: 'p5',
    title: 'Quiet Cities — title card',
    tool: 'PicsArt Flow',
    frames: 4,
    body: 'empty tokyo alley at dawn, mist, single vending machine glow, slow zoom in, lo-fi color palette, vertical, soundtrack: ambient pad.',
  },
  {
    id: 'p6',
    title: 'Letters Never Sent — chapter break',
    tool: 'phot.ai',
    frames: 3,
    body: 'handwritten letter on warm paper, ink slowly bleeds into watercolor washes, top-down macro, sage-and-terracotta tones, paper grain visible, no faces.',
  },
];

export const TOOLS = [
  { id: 'a', name: 'brainrot.mov',  purpose: 'Hook-first generative scripting for short-form ideas that retain.', cost: 'free',  status: 'active' },
  { id: 'b', name: 'PicsArt Flow',  purpose: 'Frame-by-frame visual generation with character continuity.',        cost: 'paid',  status: 'active' },
  { id: 'c', name: 'Google Vids',   purpose: 'Edit assembly, captions, and lightweight storyboarding.',             cost: 'free',  status: 'active' },
  { id: 'd', name: 'Viewmax',       purpose: 'Retention analytics — heatmap drop-offs by second.',                  cost: 'paid',  status: 'backup' },
  { id: 'e', name: 'phot.ai',       purpose: 'Stills, thumbnails, and character refs in a consistent style.',       cost: 'paid',  status: 'active' },
  { id: 'f', name: 'Gemini',        purpose: 'Prompt iteration, script polishing, and reference research.',         cost: 'free',  status: 'active' },
];

export const TARGETS = [
  { id: 'w', name: 'Weekly uploads',    value: 3, of: 4,    suffix: 'videos',  note: '1 to go — Friday',      color: 'sage' },
  { id: 'm', name: 'Monthly uploads',   value: 9, of: 12,   suffix: 'videos',  note: 'On pace',               color: 'sage' },
  { id: 'v', name: 'Views — March',     value: 184000, of: 250000, suffix: 'views', note: '73% — softening',  color: 'terra' },
  { id: 's', name: 'Subscribers',       value: 1240,  of: 2000,   suffix: 'subs',  note: '+86 this week',     color: 'sage' },
];

export function fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 10_000)    return (n / 1000).toFixed(0) + 'k';
  if (n >= 1000)      return (n / 1000).toFixed(1) + 'k';
  return n.toLocaleString();
}

export function fmtFull(n) { return n.toLocaleString(); }

// ── Analytics ──────────────────────────────────────────────────────────────

function seeded(seed) {
  let s = seed | 0;
  return () => { s = (s * 1664525 + 1013904223) | 0; return ((s >>> 0) % 10000) / 10000; };
}

function buildDaily(days, baseYt, baseIg, seed) {
  const r = seeded(seed);
  const arr = [];
  for (let i = 0; i < days; i++) {
    const wave = Math.sin(i / 4.2) * 0.35 + Math.sin(i / 9) * 0.18;
    const drift = i / days * 0.45;
    const noiseYt = (r() - 0.5) * 0.6;
    const noiseIg = (r() - 0.5) * 0.7;
    const yt = Math.max(40, Math.round(baseYt * (1 + wave * 0.7 + drift + noiseYt)));
    const ig = Math.max(60, Math.round(baseIg * (1 + wave + drift * 1.2 + noiseIg)));
    arr.push({ d: i + 1, yt, ig });
  }
  return arr;
}

function retention(seed, len = 12, floor = 0.32) {
  const r = seeded(seed);
  const arr = [100];
  let v = 100;
  for (let i = 1; i < len; i++) {
    const drop = 5 + r() * 10 + (i < 3 ? 6 : 0);
    v = Math.max(floor * 100, v - drop);
    arr.push(Math.round(v));
  }
  return arr;
}

export const PLATFORMS = {
  yt: { id: 'yt', label: 'YouTube',   short: 'YT', mono: 'youtube'   },
  ig: { id: 'ig', label: 'Instagram', short: 'IG', mono: 'instagram' },
};

export const ANALYTICS_VIDEOS = [
  {
    id: 'v06', title: 'Letters Never Sent', part: '',         published: 'Mar 04',
    yt: { views: 24800, likes: 1820, comments: 88,  shares: 142, saves: 410,  watchAvg: '0:42', avgPct: 64, ctr: 7.8 },
    ig: { views: 51200, likes: 4280, comments: 312, shares: 980, saves: 2140, watchAvg: '0:28', avgPct: 58, ctr: 11.4 },
    retYt: retention(11, 12, 0.42),
    retIg: retention(23, 12, 0.36),
    daily: buildDaily(30, 820, 1700, 7),
  },
  {
    id: 'v07', title: 'Quiet Cities', part: 'Part 2',         published: 'Mar 01',
    yt: { views: 48200, likes: 3120, comments: 168, shares: 261, saves: 712,  watchAvg: '0:51', avgPct: 71, ctr: 9.1 },
    ig: { views: 89400, likes: 7140, comments: 520, shares: 1820, saves: 3680, watchAvg: '0:32', avgPct: 62, ctr: 12.8 },
    retYt: retention(33, 12, 0.48),
    retIg: retention(41, 12, 0.40),
    daily: buildDaily(30, 1600, 2980, 13),
  },
  {
    id: 'v11', title: 'Tea Ritual', part: '',                  published: 'Feb 24',
    yt: { views: 18900, likes: 1280, comments: 52,  shares: 88,  saves: 320,  watchAvg: '0:38', avgPct: 58, ctr: 6.4 },
    ig: { views: 42000, likes: 3680, comments: 240, shares: 720, saves: 1620, watchAvg: '0:24', avgPct: 51, ctr: 10.1 },
    retYt: retention(55, 12, 0.36),
    retIg: retention(63, 12, 0.32),
    daily: buildDaily(30, 630, 1400, 19),
  },
  {
    id: 'v12', title: 'A Cat Reviews Art', part: '',          published: 'Feb 18',
    yt: { views: 92400, likes: 8420, comments: 612, shares: 920, saves: 1820, watchAvg: '0:36', avgPct: 67, ctr: 14.2 },
    ig: { views: 184200, likes: 18400, comments: 2120, shares: 6420, saves: 11200, watchAvg: '0:29', avgPct: 60, ctr: 18.6 },
    retYt: retention(77, 12, 0.44),
    retIg: retention(89, 12, 0.40),
    daily: buildDaily(30, 3080, 6140, 27),
  },
  {
    id: 'v13', title: 'Origami Mornings', part: '',           published: 'Feb 12',
    yt: { views: 11200, likes: 720,  comments: 38,  shares: 52,  saves: 188,  watchAvg: '0:33', avgPct: 53, ctr: 5.9 },
    ig: { views: 26800, likes: 2120, comments: 142, shares: 408, saves: 940,  watchAvg: '0:22', avgPct: 47, ctr: 8.7 },
    retYt: retention(101, 12, 0.30),
    retIg: retention(113, 12, 0.28),
    daily: buildDaily(30, 380, 880, 35),
  },
  {
    id: 'v14', title: 'The Last Astronaut', part: 'Part 1',   published: 'Feb 06',
    yt: { views: 64800, likes: 4920, comments: 312, shares: 488, saves: 1240, watchAvg: '0:48', avgPct: 69, ctr: 11.0 },
    ig: { views: 121000, likes: 10800, comments: 980, shares: 3120, saves: 5840, watchAvg: '0:31', avgPct: 61, ctr: 15.3 },
    retYt: retention(131, 12, 0.46),
    retIg: retention(149, 12, 0.42),
    daily: buildDaily(30, 2160, 4040, 41),
  },
];

export const ANALYTICS = (() => {
  const totals = { yt: { views: 0, likes: 0, comments: 0, shares: 0, saves: 0 },
                   ig: { views: 0, likes: 0, comments: 0, shares: 0, saves: 0 } };
  ANALYTICS_VIDEOS.forEach(v => {
    ['views','likes','comments','shares','saves'].forEach(k => {
      totals.yt[k] += v.yt[k]; totals.ig[k] += v.ig[k];
    });
  });
  const daily = [];
  const days = ANALYTICS_VIDEOS[0].daily.length;
  for (let i = 0; i < days; i++) {
    let yt = 0, ig = 0;
    ANALYTICS_VIDEOS.forEach(v => { yt += v.daily[i].yt; ig += v.daily[i].ig; });
    daily.push({ d: i + 1, yt, ig });
  }
  return { totals, daily, videos: ANALYTICS_VIDEOS, platforms: PLATFORMS };
})();

// ── Chat ───────────────────────────────────────────────────────────────────

export const CHAT_THREADS = [
  {
    id: 'general',
    title: 'General',
    subtitle: 'studio noise',
    linkedVideoId: null,
    pinned: true,
    days: [
      { label: 'Tuesday — May 12', messages: [
        { id: 'g1', from: 's2', at: '10:14 AM', text: 'morning :)' },
        { id: 'g2', from: 's2', at: '10:14 AM', text: 'i think we should slow down on volume this week. quality over count.' },
        { id: 'g3', from: 's1', at: '10:42 AM', text: "agreed. let's pick 2 to do really well instead of 4 to do okay." },
        { id: 'g4', from: 's1', at: '10:43 AM', text: '', decision: true, decisionText: '2 videos this week (was 4). quality over count.' },
      ]},
      { label: 'Today — May 16', messages: [
        { id: 'g5', from: 's2', at: '8:02 AM', text: 'morning. tea?' },
        { id: 'g6', from: 's1', at: '8:14 AM', text: "making it. you're up early." },
        { id: 'g7', from: 's2', at: '8:15 AM', text: "couldn't sleep. had an idea for the last astronaut — what if the helmet reflection IS the audience?" },
        { id: 'g8', from: 's2', at: '8:15 AM', text: "like we never see his face. only the city in his visor." },
        { id: 'g9', from: 's1', at: '8:38 AM', text: "oh. oh that's good.", reactions: ['♥'] },
        { id: 'g10', from: 's1', at: '8:39 AM', text: 'let me sketch a few frames after this cup.' },
        { id: 'g11', from: 's2', at: '8:41 AM', text: '', attachment: { kind: 'prompt', id: 'p2' } },
        { id: 'g12', from: 's2', at: '8:41 AM', text: "↑ here's the current prompt for ref. it needs a tweak in the framing line." },
      ]},
    ],
  },
  {
    id: 'mirror-king',
    title: 'Mirror King · p4',
    subtitle: 'video thread',
    linkedVideoId: 'v10',
    days: [
      { label: 'Yesterday — May 15', messages: [
        { id: 'mk1', from: 's1', at: '4:14 PM', text: "p4 prompts are running. picsart's been weird with mirror surfaces today." },
        { id: 'mk2', from: 's2', at: '4:18 PM', text: '"matte fog reduces fresnel reflections at edges" — fixed it on p2.' },
        { id: 'mk3', from: 's1', at: '4:20 PM', text: 'oh nice. trying.', reactions: ['♥'] },
        { id: 'mk4', from: 's1', at: '5:48 PM', text: 'worked. frame 7 is cinema.', reactions: ['♥', '✓'] },
        { id: 'mk5', from: 's2', at: '5:50 PM', text: 'send pls!' },
      ]},
      { label: 'Today — May 16', messages: [
        { id: 'mk6', from: 's1', at: '9:14 AM', text: '', attachment: { kind: 'video', id: 'v10' } },
        { id: 'mk7', from: 's1', at: '9:14 AM', text: '14 frames in, 6 to go. release window?' },
        { id: 'mk8', from: 's2', at: '9:22 AM', text: "friday 6pm IST. don't hold for color pass — re-upload if needed." },
        { id: 'mk9', from: 's2', at: '9:23 AM', text: '', decision: true, decisionText: 'Mirror King p4 ships Friday 6pm IST. color pass can come later.' },
      ]},
    ],
  },
  {
    id: 'astronaut',
    title: 'Last Astronaut · p2',
    subtitle: 'video thread',
    linkedVideoId: 'v02',
    days: [
      { label: 'Today — May 16', messages: [
        { id: 'a1', from: 's2', at: '11:02 AM', text: "color pass v3 done. think it's the one." },
        { id: 'a2', from: 's2', at: '11:04 AM', text: 'pulled the cyan down 14%. it was screaming.' },
        { id: 'a3', from: 's1', at: '11:48 AM', text: 'much better. ship it.', reactions: ['✓'] },
      ]},
    ],
  },
  {
    id: 'channel-name',
    title: 'Channel name',
    subtitle: 'naming things',
    linkedVideoId: null,
    days: [
      { label: 'Sunday — May 11', messages: [
        { id: 'cn1', from: 's1', at: '9:00 PM', text: "reel.studio? two hands? quiet hours? i can't decide." },
        { id: 'cn2', from: 's2', at: '9:14 PM', text: 'reel.studio feels closest to us. "quiet hours" can be the b-side later.' },
        { id: 'cn3', from: 's1', at: '9:18 PM', text: 'second channel ??' },
        { id: 'cn4', from: 's2', at: '9:18 PM', text: 'someday. not now. focus.' },
        { id: 'cn5', from: 's1', at: '9:20 PM', text: 'fair.', reactions: ['✓'] },
        { id: 'cn6', from: 's2', at: '9:21 PM', text: '', decision: true, decisionText: 'Channel name: reel.studio (final). "quiet hours" reserved.' },
      ]},
    ],
  },
  {
    id: 'tea-ritual',
    title: 'Slowmotion Tea',
    subtitle: 'video thread',
    linkedVideoId: 'v04',
    days: [
      { label: 'Wednesday — May 13', messages: [
        { id: 'tr1', from: 's1', at: '7:14 PM', text: 'gemini gave me 6 frames. all gorgeous. which one opens?' },
        { id: 'tr2', from: 's2', at: '7:40 PM', text: 'the one where steam crosses the window light. the rest can be after.' },
        { id: 'tr3', from: 's1', at: '7:42 PM', text: 'agreed.', reactions: ['♥'] },
      ]},
    ],
  },
];
