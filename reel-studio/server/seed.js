import db from './db.js';
import { hash } from './auth.js';

const now = () => Date.now();

const USERS = [
  { id: 's1', username: 'shubhangam', name: 'Shubhangam', role: 'Creator · Director', password: process.env.SEED_PW_SHUB || 'changeme-shub' },
  { id: 's2', username: 'sanjeevani', name: 'Sanjeevani', role: 'Editor · Producer',  password: process.env.SEED_PW_SAN  || 'changeme-san'  },
];

const VIDEOS = [
  { id: 'v01', title: 'The Mirror King',          part: 'Part 3', status: 'editing',    tool: 'PicsArt Flow', stage: 'editing',    frames: 14, due: 'Today',    assignees: ['s1'] },
  { id: 'v02', title: 'The Last Astronaut',       part: 'Part 2', status: 'editing',    tool: 'Google Vids',  stage: 'editing',    frames: 9,  due: 'Tomorrow', assignees: ['s2'] },
  { id: 'v03', title: 'Brainrot Concept — Kids Niche', part: '', status: 'idea',       tool: 'brainrot.mov', stage: 'idea',       frames: 0,  due: 'Thu',      assignees: ['s1', 's2'] },
  { id: 'v04', title: 'Slowmotion Tea Ritual',    part: '',       status: 'generating', tool: 'Gemini',       stage: 'generating', frames: 6,  due: 'Fri',      assignees: ['s2'] },
  { id: 'v05', title: 'Soft Apocalypse',          part: 'Part 1', status: 'scripting',  tool: '—',            stage: 'scripting',  frames: 0,  due: 'Mon',      assignees: ['s1'] },
  { id: 'v06', title: 'Letters Never Sent',       part: '',       status: 'done',       tool: 'phot.ai',      stage: 'done',       frames: 12, due: 'Mar 04',   assignees: ['s2'] },
  { id: 'v07', title: 'Quiet Cities',             part: 'Part 2', status: 'done',       tool: 'PicsArt Flow', stage: 'done',       frames: 18, due: 'Mar 01',   assignees: ['s1'] },
  { id: 'v08', title: 'A Cat Reviews Art',        part: '',       status: 'idea',       tool: 'brainrot.mov', stage: 'idea',       frames: 0,  due: '—',        assignees: ['s2'] },
  { id: 'v09', title: 'Origami Architectures',    part: '',       status: 'scripting',  tool: '—',            stage: 'scripting',  frames: 0,  due: 'Wed',      assignees: ['s1', 's2'] },
  { id: 'v10', title: 'The Mirror King',          part: 'Part 4', status: 'generating', tool: 'PicsArt Flow', stage: 'generating', frames: 4,  due: 'Sun',      assignees: ['s1'] },
];

const TASKS = [
  { id: 't1', who: 's1', label: 'Generate Part 4 prompt — Mirror King',         due: 'Today',     video: 'Mirror King p4', done: 0 },
  { id: 't2', who: 's1', label: 'Test PicsArt Flow Copilot for face continuity', due: 'Today',     video: 'R&D',           done: 0 },
  { id: 't3', who: 's1', label: 'Draft script — Soft Apocalypse',                due: 'Mon',       video: 'Soft Apocalypse', done: 0 },
  { id: 't4', who: 's1', label: 'Cut B-roll — Quiet Cities p2',                  due: 'Yesterday', video: 'Quiet Cities',  done: 1 },
  { id: 't5', who: 's2', label: 'Color pass — Last Astronaut p2',                due: 'Tomorrow',  video: 'Last Astronaut', done: 0 },
  { id: 't6', who: 's2', label: 'Source SFX — Slowmotion Tea',                   due: 'Fri',       video: 'Tea Ritual',     done: 0 },
  { id: 't7', who: 's2', label: 'Upload schedule — March W2',                    due: 'Wed',       video: 'Ops',            done: 0 },
  { id: 't8', who: 's2', label: 'Thumbnail variants — Letters Never Sent',       due: 'Mar 02',    video: 'Letters',        done: 1 },
];

const PROMPTS = [
  { id: 'p1', title: 'Mirror King — Part 3, Frame 07', tool: 'PicsArt Flow', frames: 14, body: 'wide-angle, low light. a king made of mirrors faces the ocean. cinematic. soft fog. 35mm grain. moody warm-cool contrast. subject framed left-third. anamorphic flare from sunset.', linked: null, by: 's1' },
  { id: 'p2', title: 'Last Astronaut — establishing shot', tool: 'Gemini', frames: 9, body: 'astronaut walking on beach at dusk, silhouette, indigo-to-rose gradient sky, helmet reflection of city lights, lonely composition, no text, 21:9, photographic.', linked: 'v02', by: 's2' },
  { id: 'p3', title: 'Slowmotion Tea Ritual — close-ups', tool: 'Gemini', frames: 6, body: 'close-up of steaming tea pouring, soft natural window light, ceramic cup, ASMR-style framing, depth of field, gentle camera pull-back, no person visible.', linked: 'v04', by: 's2' },
  { id: 'p4', title: 'Brainrot concept — kids niche', tool: 'brainrot.mov', frames: 0, body: 'absurd hyper-saturated scene, talking fruits arguing about screen time, kids cartoon style, 9:16, jump cuts, loud captions, designed for retention spikes at 0.5s.', linked: null, by: 's1' },
  { id: 'p5', title: 'Quiet Cities — title card', tool: 'PicsArt Flow', frames: 4, body: 'empty tokyo alley at dawn, mist, single vending machine glow, slow zoom in, lo-fi color palette, vertical, soundtrack: ambient pad.', linked: 'v07', by: 's1' },
  { id: 'p6', title: 'Letters Never Sent — chapter break', tool: 'phot.ai', frames: 3, body: 'handwritten letter on warm paper, ink slowly bleeds into watercolor washes, top-down macro, sage-and-terracotta tones, paper grain visible, no faces.', linked: 'v06', by: 's2' },
];

const TOOLS = [
  { id: 'tool-a', name: 'brainrot.mov', purpose: 'Hook-first generative scripting for short-form ideas that retain.', cost: 'free', status: 'active', ord: 1 },
  { id: 'tool-b', name: 'PicsArt Flow', purpose: 'Frame-by-frame visual generation with character continuity.',        cost: 'paid', status: 'active', ord: 2 },
  { id: 'tool-c', name: 'Google Vids',  purpose: 'Edit assembly, captions, and lightweight storyboarding.',             cost: 'free', status: 'active', ord: 3 },
  { id: 'tool-d', name: 'Viewmax',      purpose: 'Retention analytics — heatmap drop-offs by second.',                  cost: 'paid', status: 'backup', ord: 4 },
  { id: 'tool-e', name: 'phot.ai',      purpose: 'Stills, thumbnails, and character refs in a consistent style.',       cost: 'paid', status: 'active', ord: 5 },
  { id: 'tool-f', name: 'Gemini',       purpose: 'Prompt iteration, script polishing, and reference research.',         cost: 'free', status: 'active', ord: 6 },
];

const TARGETS = [
  { id: 'w', name: 'Weekly uploads',  value: 3,      goal: 4,      suffix: 'videos', note: '1 to go — Friday',  color: 'sage',  ord: 1 },
  { id: 'm', name: 'Monthly uploads', value: 9,      goal: 12,     suffix: 'videos', note: 'On pace',           color: 'sage',  ord: 2 },
  { id: 'v', name: 'Views — March',   value: 184000, goal: 250000, suffix: 'views',  note: '73% — softening',   color: 'terra', ord: 3 },
  { id: 's', name: 'Subscribers',     value: 1240,   goal: 2000,   suffix: 'subs',   note: '+86 this week',     color: 'sage',  ord: 4 },
];

const STRATEGY_SECTIONS = [
  { id: 'niche',       heading: 'Niche',              body: 'Cinematic short-form storytelling — quiet, atmospheric, AI-assisted. Not gimmick. Not trend-chasing.', ord: 1 },
  { id: 'audience',    heading: 'Audience',           body: 'Creative people in their 20s-30s. Designers, writers, photographers. They watch on the train home.',  ord: 2 },
  { id: 'style',       heading: 'Content style',      body: 'Slow openers. Honest endings. Real human emotion behind the AI frames. Sound matters as much as picture.', ord: 3 },
  { id: 'monetise',    heading: 'Monetisation',       body: 'Year one: zero pressure. Build the body of work. Year two: brand partnerships only if they fit.',     ord: 4 },
  { id: 'promise',     heading: 'Promise',            body: 'Two videos a week. Quality before count. No filler. No clickbait. Always cinematic, always honest.',  ord: 5 },
];

const THREADS = [
  { id: 'general',     title: 'General',           linked: null,  pinned: 1, by: 's1' },
  { id: 'mirror-king', title: 'Mirror King · p4',  linked: 'v10', pinned: 0, by: 's1' },
  { id: 'astronaut',   title: 'Last Astronaut · p2', linked: 'v02', pinned: 0, by: 's2' },
  { id: 'channel-name',title: 'Channel name',      linked: null,  pinned: 0, by: 's1' },
  { id: 'tea-ritual',  title: 'Slowmotion Tea',    linked: 'v04', pinned: 0, by: 's2' },
];

// Messages with realistic timestamps relative to "now"
function ago(days, hours = 0, mins = 0) {
  return Date.now() - days * 86400000 - hours * 3600000 - mins * 60000;
}

const MESSAGES = [
  // general
  { id: 'g1', thread: 'general', from: 's2', text: 'morning :)', t: ago(5, 10, 0) },
  { id: 'g2', thread: 'general', from: 's2', text: 'i think we should slow down on volume this week. quality over count.', t: ago(5, 10, 1) },
  { id: 'g3', thread: 'general', from: 's1', text: "agreed. let's pick 2 to do really well instead of 4 to do okay.", t: ago(5, 9, 30) },
  { id: 'g4', thread: 'general', from: 's1', decision: 1, decision_text: '2 videos this week (was 4). quality over count.', t: ago(5, 9, 29) },
  { id: 'g5', thread: 'general', from: 's2', text: 'morning. tea?', t: ago(0, 4, 0) },
  { id: 'g6', thread: 'general', from: 's1', text: "making it. you're up early.", t: ago(0, 3, 46) },
  { id: 'g7', thread: 'general', from: 's2', text: "couldn't sleep. had an idea for the last astronaut — what if the helmet reflection IS the audience?", t: ago(0, 3, 45) },
  { id: 'g8', thread: 'general', from: 's2', text: "like we never see his face. only the city in his visor.", t: ago(0, 3, 44) },
  { id: 'g9', thread: 'general', from: 's1', text: "oh. oh that's good.", reactions: ['♥'], t: ago(0, 3, 22) },
  { id: 'g10', thread: 'general', from: 's1', text: 'let me sketch a few frames after this cup.', t: ago(0, 3, 21) },
  { id: 'g11', thread: 'general', from: 's2', text: '', attachment: { kind: 'prompt', id: 'p2' }, t: ago(0, 3, 19) },
  { id: 'g12', thread: 'general', from: 's2', text: "↑ here's the current prompt for ref. it needs a tweak in the framing line.", t: ago(0, 3, 19) },

  // mirror-king
  { id: 'mk1', thread: 'mirror-king', from: 's1', text: "p4 prompts are running. picsart's been weird with mirror surfaces today.", t: ago(1, 5, 0) },
  { id: 'mk2', thread: 'mirror-king', from: 's2', text: '"matte fog reduces fresnel reflections at edges" — fixed it on p2.', t: ago(1, 4, 56) },
  { id: 'mk3', thread: 'mirror-king', from: 's1', text: 'oh nice. trying.', reactions: ['♥'], t: ago(1, 4, 54) },
  { id: 'mk4', thread: 'mirror-king', from: 's1', text: 'worked. frame 7 is cinema.', reactions: ['♥', '✓'], t: ago(1, 3, 26) },
  { id: 'mk5', thread: 'mirror-king', from: 's2', text: 'send pls!', t: ago(1, 3, 24) },
  { id: 'mk6', thread: 'mirror-king', from: 's1', text: '', attachment: { kind: 'video', id: 'v10' }, t: ago(0, 2, 50) },
  { id: 'mk7', thread: 'mirror-king', from: 's1', text: '14 frames in, 6 to go. release window?', t: ago(0, 2, 50) },
  { id: 'mk8', thread: 'mirror-king', from: 's2', text: "friday 6pm IST. don't hold for color pass — re-upload if needed.", t: ago(0, 2, 42) },
  { id: 'mk9', thread: 'mirror-king', from: 's2', decision: 1, decision_text: 'Mirror King p4 ships Friday 6pm IST. color pass can come later.', t: ago(0, 2, 41) },

  // astronaut
  { id: 'a1', thread: 'astronaut', from: 's2', text: "color pass v3 done. think it's the one.", t: ago(0, 1, 0) },
  { id: 'a2', thread: 'astronaut', from: 's2', text: 'pulled the cyan down 14%. it was screaming.', t: ago(0, 0, 58) },
  { id: 'a3', thread: 'astronaut', from: 's1', text: 'much better. ship it.', reactions: ['✓'], t: ago(0, 0, 14) },

  // channel-name
  { id: 'cn1', thread: 'channel-name', from: 's1', text: "reel.studio? two hands? quiet hours? i can't decide.", t: ago(6, 14, 0) },
  { id: 'cn2', thread: 'channel-name', from: 's2', text: 'reel.studio feels closest to us. "quiet hours" can be the b-side later.', t: ago(6, 13, 46) },
  { id: 'cn3', thread: 'channel-name', from: 's1', text: 'second channel ??', t: ago(6, 13, 42) },
  { id: 'cn4', thread: 'channel-name', from: 's2', text: 'someday. not now. focus.', t: ago(6, 13, 42) },
  { id: 'cn5', thread: 'channel-name', from: 's1', text: 'fair.', reactions: ['✓'], t: ago(6, 13, 40) },
  { id: 'cn6', thread: 'channel-name', from: 's2', decision: 1, decision_text: 'Channel name: reel.studio (final). "quiet hours" reserved.', t: ago(6, 13, 39) },

  // tea-ritual
  { id: 'tr1', thread: 'tea-ritual', from: 's1', text: 'gemini gave me 6 frames. all gorgeous. which one opens?', t: ago(3, 4, 46) },
  { id: 'tr2', thread: 'tea-ritual', from: 's2', text: 'the one where steam crosses the window light. the rest can be after.', t: ago(3, 4, 20) },
  { id: 'tr3', thread: 'tea-ritual', from: 's1', text: 'agreed.', reactions: ['♥'], t: ago(3, 4, 18) },
];

function seedUsers() {
  const insert = db.prepare('INSERT OR IGNORE INTO users (id, username, name, role, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)');
  for (const u of USERS) insert.run(u.id, u.username, u.name, u.role, hash(u.password), now());
}

function seedVideos() {
  const ins = db.prepare('INSERT OR IGNORE INTO videos (id, title, part, status, tool, stage, frames, due, ord, updated_by, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const insA = db.prepare('INSERT OR IGNORE INTO video_assignees (video_id, user_id) VALUES (?, ?)');
  VIDEOS.forEach((v, i) => {
    ins.run(v.id, v.title, v.part, v.status, v.tool, v.stage, v.frames, v.due, i, v.assignees[0] || null, now());
    for (const a of v.assignees) insA.run(v.id, a);
  });
}

function seedTasks() {
  const ins = db.prepare('INSERT OR IGNORE INTO tasks (id, who, label, due, video, done, ord, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  TASKS.forEach((t, i) => ins.run(t.id, t.who, t.label, t.due, t.video, t.done, i, now()));
}

function seedPrompts() {
  const ins = db.prepare('INSERT OR IGNORE INTO prompts (id, title, tool, frames, body, linked_video_id, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  PROMPTS.forEach(p => ins.run(p.id, p.title, p.tool, p.frames, p.body, p.linked, p.by, now()));
}

function seedTools() {
  const ins = db.prepare('INSERT OR IGNORE INTO tools (id, name, purpose, status, cost, ord) VALUES (?, ?, ?, ?, ?, ?)');
  TOOLS.forEach(t => ins.run(t.id, t.name, t.purpose, t.status, t.cost, t.ord));
}

function seedTargets() {
  const ins = db.prepare('INSERT OR IGNORE INTO targets (id, name, value, goal, suffix, note, color, ord) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  TARGETS.forEach(t => ins.run(t.id, t.name, t.value, t.goal, t.suffix, t.note, t.color, t.ord));
}

function seedStrategy() {
  const ins = db.prepare('INSERT OR IGNORE INTO strategy_sections (id, heading, body, ord, updated_at) VALUES (?, ?, ?, ?, ?)');
  STRATEGY_SECTIONS.forEach(s => ins.run(s.id, s.heading, s.body, s.ord, now()));
}

function seedThreads() {
  const ins = db.prepare('INSERT OR IGNORE INTO threads (id, title, linked_video_id, pinned, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)');
  THREADS.forEach((t, i) => ins.run(t.id, t.title, t.linked, t.pinned, t.by, Date.now() - (THREADS.length - i) * 86400000));
}

function seedMessages() {
  const ins = db.prepare('INSERT OR IGNORE INTO messages (id, thread_id, from_user, kind, text, attachment_json, decision, decision_text, reactions_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  MESSAGES.forEach(m => {
    ins.run(
      m.id, m.thread, m.from,
      m.attachment ? 'attach' : m.decision ? 'decision' : 'text',
      m.text || '',
      m.attachment ? JSON.stringify(m.attachment) : null,
      m.decision ? 1 : 0,
      m.decision_text || '',
      m.reactions ? JSON.stringify(m.reactions) : null,
      m.t
    );
  });
}

export function runSeed() {
  db.transaction(() => {
    seedUsers();
    seedVideos();
    seedTasks();
    seedPrompts();
    seedTools();
    seedTargets();
    seedStrategy();
    seedThreads();
    seedMessages();
  })();
}
