import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { CHAT_THREADS, VIDEOS, PROMPTS, STATUS_TO_DOT } from '../data/index.js';
import { Avatar } from '../components/shared.jsx';

function flattenMessages(thread) {
  const out = [];
  thread.days.forEach(d => {
    out.push({ kind: 'day', label: d.label });
    d.messages.forEach(m => out.push({ kind: 'msg', ...m }));
  });
  return out;
}

function lastMessageOf(thread) {
  const lastDay = thread.days[thread.days.length - 1];
  if (!lastDay) return null;
  return lastDay.messages[lastDay.messages.length - 1];
}

function previewOf(msg) {
  if (!msg) return '';
  if (msg.decision) return '◆ Decision · ' + msg.decisionText;
  if (msg.attachment) return msg.attachment.kind === 'video' ? '⏵ video reference' : msg.attachment.kind === 'prompt' ? '✎ prompt reference' : '⊕ attachment';
  return msg.text;
}

function decisionsOf(thread) {
  const out = [];
  thread.days.forEach(d => d.messages.forEach(m => { if (m.decision) out.push(m); }));
  return out;
}

function ThreadListItem({ thread, active, onClick, lastMsg, currentUser }) {
  const preview = previewOf(lastMsg);
  const fromPrefix = lastMsg
    ? (lastMsg.from === currentUser ? 'You: ' : lastMsg.from === 's2' ? 'San: ' : 'Shub: ')
    : '';
  return (
    <button
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: '36px 1fr auto',
        gridTemplateRows: 'auto auto',
        columnGap: 12, rowGap: 3,
        padding: '14px 40px 14px 14px',
        textAlign: 'left',
        background: active ? 'var(--surface)' : 'transparent',
        borderBottom: '0.5px solid var(--hair)',
        cursor: 'pointer',
        transition: 'background 160ms',
        width: '100%',
      }}
    >
      <div style={{ gridRow: '1 / span 2', display: 'flex', alignItems: 'center' }}>
        {thread.linkedVideoId ? (
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--ink)', border: '0.5px solid var(--hair)' }}>▶</div>
        ) : (
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.06em', color: 'var(--ink)', border: '0.5px solid var(--hair)' }}>S·S</div>
        )}
      </div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.25, color: 'var(--ink)', fontWeight: 400 }}>
        {thread.title}
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--pencil)', letterSpacing: '0.06em', alignSelf: 'start' }}>
        {lastMsg ? lastMsg.at : ''}
      </div>
      <div style={{ fontFamily: 'var(--sans)', fontSize: 12.5, color: 'var(--pencil)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', gridColumn: '2 / span 2' }}>
        {fromPrefix}{preview}
      </div>
      {thread.pinned && (
        <div style={{ position: 'absolute', top: 8, right: 36, fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--terracotta)', letterSpacing: '0.1em' }}>◆</div>
      )}
    </button>
  );
}

function DateDivider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '22px 0 12px' }}>
      <div style={{ flex: 1, height: 0, borderTop: '0.5px solid var(--hair)' }} />
      <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--pencil)' }}>{label}</span>
      <div style={{ flex: 1, height: 0, borderTop: '0.5px solid var(--hair)' }} />
    </div>
  );
}

function DecisionPin({ msg }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
      <div style={{ maxWidth: '78%', background: 'var(--paper)', border: '0.5px dashed var(--terracotta)', borderRadius: 6, padding: '10px 14px 11px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.18em', color: 'var(--terracotta)', textTransform: 'uppercase' }}>◆ Decision · agreed</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.35 }}>{msg.decisionText}</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--pencil)', letterSpacing: '0.08em' }}>
          by {msg.from === 's1' ? 'Shubhangam' : 'Sanjeevani'} · {msg.at}
        </div>
      </div>
    </div>
  );
}

function AttachmentCard({ attachment }) {
  if (attachment.kind === 'video') {
    const v = VIDEOS.find(x => x.id === attachment.id);
    if (!v) return null;
    return (
      <div style={{ marginTop: 4, border: '0.5px solid var(--hair)', borderRadius: 5, background: 'var(--paper)', display: 'grid', gridTemplateColumns: '52px 1fr', gap: 12, padding: 8, minWidth: 240 }}>
        <div style={{ background: 'var(--surface-2)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--ink)' }}>▶</div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.14em', color: 'var(--pencil)', textTransform: 'uppercase' }}>video</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 1.2, color: 'var(--ink)' }}>{v.title}{v.part ? ' — ' + v.part : ''}</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--pencil)', letterSpacing: '0.06em', marginTop: 2 }}>
            <span className={`status-dot ${STATUS_TO_DOT[v.status]}`} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            {v.status} · {v.tool}
          </div>
        </div>
      </div>
    );
  }
  if (attachment.kind === 'prompt') {
    const p = PROMPTS.find(x => x.id === attachment.id);
    if (!p) return null;
    return (
      <div style={{ marginTop: 4, border: '0.5px solid var(--hair)', borderRadius: 5, background: 'var(--paper)', padding: '10px 12px', minWidth: 240, maxWidth: 320 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.14em', color: 'var(--pencil)', textTransform: 'uppercase', marginBottom: 4 }}>prompt · {p.tool.toLowerCase()}</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 1.2, color: 'var(--ink)', marginBottom: 4 }}>{p.title}</div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#4a4944', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.body}</div>
      </div>
    );
  }
  return null;
}

function Bubble({ msg, mine }) {
  const bg = mine ? 'var(--sage-soft)' : 'var(--surface)';
  const align = mine ? 'flex-end' : 'flex-start';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: align, gap: 4, maxWidth: '72%', alignSelf: align }}>
      <div style={{ background: bg, borderRadius: mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px', padding: msg.text ? '10px 14px' : '8px', fontFamily: 'var(--sans)', fontSize: 14, lineHeight: 1.5, color: 'var(--ink)', wordBreak: 'break-word', whiteSpace: 'pre-wrap', border: '0.5px solid var(--hair)' }}>
        {msg.text && <div>{msg.text}</div>}
        {msg.attachment && <AttachmentCard attachment={msg.attachment} />}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--pencil)', letterSpacing: '0.08em', padding: '0 4px' }}>
        <span>{msg.at}</span>
        {mine && <span>· read</span>}
        {msg.reactions && msg.reactions.length > 0 && (
          <span style={{ background: 'var(--paper)', border: '0.5px solid var(--hair)', borderRadius: 999, padding: '1px 7px 1px', fontSize: 11, color: 'var(--ink)', letterSpacing: 0, marginLeft: 2 }}>
            {msg.reactions.join(' ')}
          </span>
        )}
      </div>
    </div>
  );
}

function MessageRow({ msg, mine }) {
  if (msg.decision) return <DecisionPin msg={msg} />;
  return (
    <div style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', gap: 10, margin: '4px 0', alignItems: 'flex-end' }}>
      {!mine && <Avatar who={msg.from === 's2' ? 's2' : 's1'} size={26} />}
      <Bubble msg={msg} mine={mine} />
      {mine && <Avatar who={msg.from === 's1' ? 's1' : 's2'} size={26} />}
    </div>
  );
}

function TypingIndicator({ otherUser }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, margin: '6px 0' }}>
      <Avatar who={otherUser} size={26} />
      <div style={{ background: 'var(--surface)', border: '0.5px solid var(--hair)', borderRadius: '18px 18px 18px 4px', padding: '11px 14px', display: 'flex', gap: 5, alignItems: 'center' }}>
        <span className="typing-dot" style={{ animationDelay: '0ms' }} />
        <span className="typing-dot" style={{ animationDelay: '160ms' }} />
        <span className="typing-dot" style={{ animationDelay: '320ms' }} />
      </div>
    </div>
  );
}

function MenuRow({ icon, label, sub, onClick, disabled }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ display: 'grid', gridTemplateColumns: '22px 1fr', gap: 10, padding: '8px 14px', width: '100%', textAlign: 'left', fontFamily: 'var(--sans)', fontSize: 12.5, color: disabled ? 'var(--pencil)' : 'var(--ink)', opacity: disabled ? 0.6 : 1 }}
      onMouseDown={e => e.preventDefault()}
    >
      <span style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--terracotta)' }}>{icon}</span>
      <span>
        <span>{label}</span>
        <span style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--pencil)', letterSpacing: '0.08em', marginTop: 2 }}>{sub}</span>
      </span>
    </button>
  );
}

function AttachMenu({ onClose, onVideo, onPrompt, onDecision }) {
  const [tab, setTab] = useState('actions');
  useEffect(() => {
    const h = (e) => { if (!e.target.closest('.attach-menu')) onClose(); };
    setTimeout(() => document.addEventListener('click', h), 0);
    return () => document.removeEventListener('click', h);
  }, [onClose]);
  return (
    <div className="attach-menu" style={{ position: 'absolute', bottom: 44, left: 0, width: 280, maxHeight: 320, overflow: 'hidden', background: 'var(--paper)', border: '0.5px solid var(--hair-strong)', borderRadius: 10, boxShadow: '0 12px 32px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
      <div style={{ display: 'flex', borderBottom: '0.5px solid var(--hair)' }}>
        {['actions', 'video', 'prompt'].map(k => (
          <button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: '9px 8px', fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.14em', color: tab === k ? 'var(--ink)' : 'var(--pencil)', textTransform: 'uppercase', borderBottom: tab === k ? '1px solid var(--ink)' : 'none' }}>{k}</button>
        ))}
      </div>
      <div style={{ overflowY: 'auto', flex: 1, padding: '6px 0' }}>
        {tab === 'actions' && (
          <>
            <MenuRow icon="◆" label="Mark as decision" sub="Pins for both" onClick={onDecision} />
            <MenuRow icon="✎" label="Quote previous" sub="(coming)" disabled />
            <MenuRow icon="◉" label="Voice note" sub="(coming)" disabled />
          </>
        )}
        {tab === 'video' && VIDEOS.slice(0, 8).map(v => (
          <MenuRow key={v.id} icon="▶" label={v.title + (v.part ? ' · ' + v.part : '')} sub={v.status + ' · ' + v.tool} onClick={() => onVideo(v.id)} />
        ))}
        {tab === 'prompt' && PROMPTS.slice(0, 8).map(p => (
          <MenuRow key={p.id} icon="✎" label={p.title} sub={p.tool.toLowerCase()} onClick={() => onPrompt(p.id)} />
        ))}
      </div>
    </div>
  );
}

function Composer({ onSend, threadTitle, threadId }) {
  const [text, setText] = useState('');
  const [attachOpen, setAttachOpen] = useState(false);
  const [decisionMode, setDecisionMode] = useState(false);
  const taRef = useRef(null);

  useEffect(() => {
    try { setText(localStorage.getItem('reel.chat.draft.' + threadId) || ''); } catch {}
    setDecisionMode(false);
  }, [threadId]);

  useEffect(() => {
    try { localStorage.setItem('reel.chat.draft.' + threadId, text); } catch {}
  }, [text, threadId]);

  const autosize = () => {
    if (!taRef.current) return;
    taRef.current.style.height = 'auto';
    taRef.current.style.height = Math.min(160, taRef.current.scrollHeight) + 'px';
  };
  useEffect(autosize, [text]);

  const send = () => {
    const t = text.trim();
    if (!t && !decisionMode) return;
    onSend(decisionMode ? { kind: 'decision', text: t } : { kind: 'text', text: t });
    try { localStorage.removeItem('reel.chat.draft.' + threadId); } catch {}
    setText('');
    setDecisionMode(false);
  };

  const attachVideo  = (id) => { onSend({ kind: 'attach', attachment: { kind: 'video', id } }); setAttachOpen(false); };
  const attachPrompt = (id) => { onSend({ kind: 'attach', attachment: { kind: 'prompt', id } }); setAttachOpen(false); };

  return (
    <div style={{ borderTop: '0.5px solid var(--hair)', padding: '12px 16px 14px', background: 'var(--paper)', position: 'relative' }}>
      {decisionMode && (
        <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--terracotta)', textTransform: 'uppercase' }}>
          ◆ Decision mode
          <button onClick={() => setDecisionMode(false)} style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--pencil)', letterSpacing: '0.06em', borderBottom: '0.5px solid var(--hair-strong)' }}>cancel</button>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, border: '0.5px solid ' + (decisionMode ? 'var(--terracotta)' : 'var(--hair-strong)'), borderRadius: 24, padding: '8px 8px 8px 14px', background: 'var(--paper)' }}>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setAttachOpen(o => !o)} title="Attach" style={{ width: 32, height: 32, borderRadius: '50%', border: '0.5px solid var(--hair)', fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--pencil)', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>
          {attachOpen && <AttachMenu onClose={() => setAttachOpen(false)} onVideo={attachVideo} onPrompt={attachPrompt} onDecision={() => { setDecisionMode(true); setAttachOpen(false); }} />}
        </div>
        <textarea
          ref={taRef}
          rows={1}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={decisionMode ? 'Write the decision…' : `Message ${threadTitle}…`}
          style={{ flex: 1, resize: 'none', border: 0, outline: 0, background: 'transparent', fontFamily: 'var(--sans)', fontSize: 14, lineHeight: 1.5, color: 'var(--ink)', padding: '6px 0', maxHeight: 160, minHeight: 20 }}
        />
        <button
          onClick={send}
          disabled={!text.trim()}
          style={{ width: 34, height: 34, borderRadius: '50%', background: text.trim() ? 'var(--ink)' : 'var(--surface)', color: text.trim() ? 'var(--paper)' : 'var(--pencil)', fontFamily: 'var(--serif)', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 160ms, color 160ms', lineHeight: 1, flexShrink: 0 }}
          title="Send (Enter)"
        >↑</button>
      </div>
    </div>
  );
}

function localReply(userText) {
  const t = userText.toLowerCase().trim();
  if (t.includes('?')) {
    return ["let me think about that.", "good question. give me a minute.", "i'm not sure yet — what's your gut saying?", "hmm. let's revisit tomorrow with fresh eyes.", "not certain, but i have a direction."][Math.floor(Math.random() * 5)];
  }
  if (t.split(/\s+/).length <= 3 && /\b(hey|hi|hello|yo|ok|okay|sure|yep|yes|no|nope)\b/.test(t)) {
    return ["yeah.", "ok.", "mm.", "with you.", "hey."][Math.floor(Math.random() * 5)];
  }
  if (/\b(shoot|filming|location|camera|shot|tripod|frame)\b/.test(t)) {
    return ["let's lock the location first. what time works?", "golden hour would cut the editing time down.", "that angle works. add the wide opener before it?", "sounds right. should we storyboard tonight?"][Math.floor(Math.random() * 4)];
  }
  if (/\b(edit|cut|color|grade|grading|trim|splice)\b/.test(t)) {
    return ["i'll look at the rough tonight. leave color for tomorrow.", "pacing feels long in the middle. trim from the 8s mark.", "warm it slightly. not full orange.", "let me take a pass first, then you adjust."][Math.floor(Math.random() * 4)];
  }
  if (/\b(idea|concept|thinking|maybe|what if|imagine)\b/.test(t)) {
    return ["interesting. give me a minute to picture it.", "that could work. what's the hook in the first two seconds?", "i like it. write it down before we lose it.", "send me a reference if you find one."][Math.floor(Math.random() * 4)];
  }
  if (/\b(script|hook|narration|caption|voiceover|words)\b/.test(t)) {
    return ["the hook is the hardest part. read it out loud once.", "fewer words. the frame says more anyway.", "keep the narration under 12 seconds.", "send me a draft when you have one."][Math.floor(Math.random() * 4)];
  }
  if (/\b(post|upload|publish|schedule|release|go live)\b/.test(t)) {
    return ["tuesday evening. 7 pm usually lands well.", "let's not rush. one more day to sit with it.", "thumbnail first, then we go.", "both platforms at the same time?"][Math.floor(Math.random() * 4)];
  }
  if (/\b(tomorrow|tonight|today|this week|later|soon)\b/.test(t)) {
    return ["i'll be around. send the file when it's ready.", "let's aim for 4 pm so we have buffer.", "message me when you start.", "i'm blocking time tomorrow afternoon."][Math.floor(Math.random() * 4)];
  }
  if (/\b(good|great|amazing|love|perfect|nice|beautiful|wow)\b/.test(t)) {
    return ["yes. let's keep that energy.", "agreed. what's next?", "glad we got there.", "ok good. moving on."][Math.floor(Math.random() * 4)];
  }
  if (/\b(ai|prompt|picsart|gemini|tool|generate|model)\b/.test(t)) {
    return ["try the PicsArt Flow batch. sometimes it surprises you.", "the gemini pass is faster for rough work.", "keep the prompt short. one mood, one instruction.", "let's test two versions and compare."][Math.floor(Math.random() * 4)];
  }
  if (/\b(problem|issue|broken|stuck|wrong|fail)\b/.test(t)) {
    return ["what exactly broke? send me a screenshot.", "restart and try again. if it's still there, we look together.", "that's frustrating. give me 20 minutes.", "i had that last week. try the other export setting."][Math.floor(Math.random() * 4)];
  }
  if (Math.random() < 0.05) {
    return ["what made you think of this now?", "is there a deadline we're working toward?", "have you seen any references for this?"][Math.floor(Math.random() * 3)];
  }
  return ["mm. let me think.", "agreed. let's do it.", "send me a frame when you have one.", "ok. i'll start there.", "makes sense. what's the next step?", "interesting. give me a minute.", "yeah, that works.", "let's not overthink it.", "i like where this is going.", "ok. same page.", "noted. what's the priority?"][Math.floor(Math.random() * 11)];
}

export default function Chat({ onMobileThreadOpenChange, currentUser = 's1' }) {
  const otherUser = currentUser === 's2' ? 's1' : 's2';
  const otherName = otherUser === 's1' ? 'Shubhangam' : 'Sanjeevani';

  const [threads, setThreads] = useState(() => {
    try {
      const saved = localStorage.getItem('reel.chat.v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return JSON.parse(JSON.stringify(CHAT_THREADS));
  });

  const [activeId, setActiveId] = useState(() => threads[0]?.id || null);
  const [query, setQuery] = useState('');
  const [typing, setTyping] = useState(false);
  const [showDecisions, setShowDecisions] = useState(true);
  const [mobileView, setMobileView] = useState('list');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const scrollRef = useRef(null);

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const h = (e) => setIsMobile(e.matches);
    mq.addEventListener ? mq.addEventListener('change', h) : mq.addListener(h);
    return () => mq.removeEventListener ? mq.removeEventListener('change', h) : mq.removeListener(h);
  }, []);

  useEffect(() => {
    if (onMobileThreadOpenChange) onMobileThreadOpenChange(isMobile && mobileView === 'thread');
  }, [isMobile, mobileView, onMobileThreadOpenChange]);

  useEffect(() => {
    const onPop = () => setMobileView('list');
    window.addEventListener('reel:chat-back', onPop);
    return () => window.removeEventListener('reel:chat-back', onPop);
  }, []);

  const active = threads.find(t => t.id === activeId) || threads[0] || null;

  useEffect(() => {
    localStorage.setItem('reel.chat.v1', JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [active?.days.length, active?.days.reduce((s, d) => s + d.messages.length, 0), typing, activeId]);

  // Thread management
  const addThread = () => {
    const id = 'th' + Date.now();
    const newThread = { id, title: 'New thread', days: [], pinned: false, linkedVideoId: null };
    setThreads(prev => [newThread, ...prev]);
    setActiveId(id);
    if (isMobile) setMobileView('thread');
    setTimeout(() => { setTitleDraft('New thread'); setEditingTitle(true); }, 80);
  };

  const deleteThread = (id, e) => {
    if (e) e.stopPropagation();
    setThreads(prev => {
      const next = prev.filter(t => t.id !== id);
      if (activeId === id) {
        if (next.length > 0) setActiveId(next[0].id);
        if (isMobile) setMobileView('list');
      }
      return next;
    });
  };

  const renameThread = (id, title) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setThreads(prev => prev.map(th => th.id === id ? { ...th, title: trimmed } : th));
  };

  // Messages
  const addMessage = (threadId, msg) => {
    setThreads(prev => prev.map(t => {
      if (t.id !== threadId) return t;
      const days = [...t.days];
      const todayIdx = days.findIndex(d => d.label.startsWith('Today'));
      const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      const stamped = { ...msg, at: time, id: 'u' + Date.now() + Math.random().toString(36).slice(2, 6) };
      if (todayIdx >= 0) {
        days[todayIdx] = { ...days[todayIdx], messages: [...days[todayIdx].messages, stamped] };
      } else {
        days.push({ label: 'Today — ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), messages: [stamped] });
      }
      return { ...t, days };
    }));
  };

  const triggerReply = async (threadId, userText) => {
    setTyping(true);
    let replyText = '';
    try {
      const threadSnap = threads.find(t => t.id === threadId) || { days: [], title: '' };
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (apiKey) {
        try {
          const recent = [];
          threadSnap.days.forEach(d => d.messages.forEach(m => {
            if (!m.text || m.decision) return;
            recent.push(`${m.from === 's1' ? 'Shubhangam' : 'Sanjeevani'}: ${m.text}`);
          }));
          recent.push(`${currentUser === 's1' ? 'Shubhangam' : 'Sanjeevani'}: ${userText}`);
          const context = recent.slice(-10).join('\n');
          const persona = otherName;
          const prompt = `You are ${persona}, co-creator of "Reel Studio" — a calm, indie short-form video studio. You make cinematic, AI-assisted shorts for YouTube + Instagram. The current thread is "${threadSnap.title}". You are texting now.\n\nStyle rules:\n- Reply in 1-2 short sentences. Casual lowercase. Warm but practical.\n- No emojis. No exclamation marks. No AI-assistant phrasing.\n- Sometimes propose a tiny concrete next step.\n\nRecent thread:\n${context}\n\nReply now as ${persona} (just the message text, no name prefix):`;
          const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
            body: JSON.stringify({ model: 'claude-haiku-4-5', max_tokens: 120, messages: [{ role: 'user', content: prompt }] }),
          });
          if (res.ok) {
            const data = await res.json();
            replyText = (data.content?.[0]?.text || '').trim().replace(/^[A-Za-z]+:\s*/, '').replace(/^"|"$/g, '').slice(0, 280);
          }
        } catch {}
      }
      if (!replyText) replyText = localReply(userText);
      const delay = Math.min(1800, 350 + replyText.length * 18);
      await new Promise(r => setTimeout(r, delay));
      addMessage(threadId, { from: otherUser, text: replyText });
    } finally {
      setTyping(false);
    }
  };

  const handleSend = async (payload) => {
    if (!active) return;
    if (payload.kind === 'text') {
      addMessage(active.id, { from: currentUser, text: payload.text });
      triggerReply(active.id, payload.text);
    } else if (payload.kind === 'decision') {
      addMessage(active.id, { from: currentUser, text: '', decision: true, decisionText: payload.text });
    } else if (payload.kind === 'attach') {
      addMessage(active.id, { from: currentUser, text: '', attachment: payload.attachment });
    }
  };

  const items = active ? flattenMessages(active) : [];
  const decisions = active ? decisionsOf(active) : [];
  const linkedVideo = active?.linkedVideoId ? VIDEOS.find(v => v.id === active.linkedVideoId) : null;

  const filteredThreads = threads.filter(t => {
    if (!query) return true;
    const hay = (t.title + ' ' + (lastMessageOf(t)?.text || '')).toLowerCase();
    return hay.includes(query.toLowerCase());
  });

  return (
    <div className="page-enter">
      <div className="greeting">
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>[ 03 ] &nbsp; Chat &nbsp;— &nbsp; two hands, one thread</div>
          <h1>Talking <span style={{ fontStyle: 'italic' }}>about the work.</span></h1>
          <div className="sub">{threads.length} threads · {decisions.length ? `${decisions.length} decisions pinned` : 'still deciding'}.</div>
        </div>
        <div className="right">
          <div className="label">Both online</div>
          <div className="value" style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
            <Avatar who="s1" size={28} />
            <Avatar who="s2" size={28} />
          </div>
          <div className="note">last reply 2 min ago</div>
        </div>
      </div>

      <div
        className="chat-shell"
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '292px 1fr',
          height: isMobile
            ? 'calc(100dvh - env(safe-area-inset-top, 0px) - 52px - 96px - env(safe-area-inset-bottom, 0px))'
            : 'min(78vh, 760px)',
          minHeight: isMobile ? 0 : 580,
          border: '0.5px solid var(--hair)',
          borderRadius: isMobile ? 0 : 8,
          overflow: 'hidden',
          background: 'var(--paper)',
          ...(isMobile ? { margin: '0 -18px', width: 'calc(100% + 36px)' } : {}),
        }}
      >
        {/* ─── Thread list: conditionally rendered (fixes the CSS override bug) ─── */}
        {(!isMobile || mobileView === 'list') && (
          <aside className="chat-list" style={{ borderRight: '0.5px solid var(--hair)', display: 'flex', flexDirection: 'column', background: 'var(--paper)', minHeight: 0 }}>
            <div style={{ padding: '16px 14px 12px', borderBottom: '0.5px solid var(--hair)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span className="eyebrow">threads</span>
                <button
                  onClick={addThread}
                  style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--paper)', background: 'var(--ink)', padding: '4px 12px', borderRadius: 999 }}
                >+ new</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '0.5px solid var(--hair)', borderRadius: 999, padding: '7px 12px' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--pencil)', letterSpacing: '0.08em' }}>⌕</span>
                <input
                  placeholder="Search…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  style={{ flex: 1, border: 0, outline: 0, background: 'transparent', fontFamily: 'var(--sans)', fontSize: 12.5 }}
                />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              {filteredThreads.map(t => (
                <div key={t.id} style={{ position: 'relative' }}>
                  <ThreadListItem
                    thread={t}
                    active={t.id === activeId}
                    lastMsg={lastMessageOf(t)}
                    currentUser={currentUser}
                    onClick={() => { setActiveId(t.id); if (isMobile) setMobileView('thread'); }}
                  />
                  <button
                    className="thread-delete-btn"
                    onClick={(e) => deleteThread(t.id, e)}
                    title="Delete thread"
                  >×</button>
                </div>
              ))}
              {filteredThreads.length === 0 && !query && (
                <div style={{ padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--pencil)', fontSize: 16 }}>No threads yet.</div>
                  <button onClick={addThread} style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--paper)', background: 'var(--ink)', padding: '6px 14px', borderRadius: 999 }}>Start one →</button>
                </div>
              )}
              {filteredThreads.length === 0 && query && (
                <div style={{ padding: 24, textAlign: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--pencil)' }}>no threads match.</div>
              )}
            </div>
          </aside>
        )}

        {/* ─── Conversation: conditionally rendered (no more CSS override conflict) ─── */}
        {active && (!isMobile || mobileView === 'thread') && (
          <section
            className="chat-conv"
            style={{ display: 'flex', flexDirection: 'column', minHeight: 0, background: 'var(--paper)' }}
          >
            <div className="chat-conv-header" style={{ padding: '12px 16px', borderBottom: '0.5px solid var(--hair)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--paper)' }}>
              {/* Back button: CSS shows it on mobile via .chat-conv-header .back-btn rule */}
              <button className="back-btn" onClick={() => setMobileView('list')}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 18, lineHeight: 1 }}>‹</span>
              </button>
              <Avatar who={otherUser} size={30} />
              <div style={{ flex: 1, minWidth: 0 }}>
                {editingTitle ? (
                  <input
                    autoFocus
                    value={titleDraft}
                    onChange={e => setTitleDraft(e.target.value)}
                    onBlur={() => { renameThread(active.id, titleDraft); setEditingTitle(false); }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { renameThread(active.id, titleDraft); setEditingTitle(false); }
                      if (e.key === 'Escape') setEditingTitle(false);
                    }}
                    style={{ fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1, letterSpacing: '-0.005em', border: 0, outline: 0, background: 'transparent', borderBottom: '1.5px solid var(--ink)', width: '100%', color: 'var(--ink)' }}
                  />
                ) : (
                  <div
                    style={{ fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1, letterSpacing: '-0.005em', cursor: 'text', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    onClick={() => { setTitleDraft(active.title); setEditingTitle(true); }}
                    title="Tap to rename"
                  >
                    {active.title}
                  </div>
                )}
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--pencil)', letterSpacing: '0.1em', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, textTransform: 'uppercase' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sage)', display: 'inline-block' }} />
                  {otherName} · active now
                  {linkedVideo && <>
                    <span style={{ opacity: 0.5 }}>·</span>
                    <span style={{ padding: '2px 8px', border: '0.5px solid var(--hair-strong)', borderRadius: 999, fontSize: 9, letterSpacing: '0.12em' }}>
                      ▶ {linkedVideo.title}{linkedVideo.part ? ' — ' + linkedVideo.part : ''}
                    </span>
                  </>}
                </div>
              </div>
              <button
                onClick={() => setShowDecisions(v => !v)}
                style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.14em', color: showDecisions ? 'var(--ink)' : 'var(--pencil)', textTransform: 'uppercase', padding: '5px 10px', borderRadius: 999, border: '0.5px solid var(--hair-strong)', flexShrink: 0 }}
              >
                ◆ {decisions.length}
              </button>
            </div>

            {showDecisions && decisions.length > 0 && (
              <div style={{ padding: '10px 16px', background: 'var(--surface)', borderBottom: '0.5px solid var(--hair)', display: 'flex', gap: 10, overflowX: 'auto' }}>
                {decisions.map((d, i) => (
                  <div key={i} style={{ flex: '0 0 auto', maxWidth: 300, background: 'var(--paper)', border: '0.5px dashed var(--terracotta)', borderRadius: 6, padding: '8px 12px' }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.16em', color: 'var(--terracotta)', textTransform: 'uppercase' }}>◆ Decision</div>
                    <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink)', lineHeight: 1.35, marginTop: 2 }}>{d.decisionText}</div>
                  </div>
                ))}
              </div>
            )}

            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '8px 16px 18px', display: 'flex', flexDirection: 'column', background: 'radial-gradient(circle at 80% 0%, rgba(196,133,106,0.04), transparent 50%), radial-gradient(circle at 0% 100%, rgba(143,175,138,0.04), transparent 45%)' }}>
              {items.map((it, i) => {
                if (it.kind === 'day') return <DateDivider key={'d' + i} label={it.label} />;
                return <MessageRow key={it.id} msg={it} mine={it.from === currentUser} />;
              })}
              {items.length === 0 && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--pencil)', fontSize: 16 }}>
                  Start the conversation.
                </div>
              )}
              {typing && <TypingIndicator otherUser={otherUser} />}
            </div>

            <Composer onSend={handleSend} threadTitle={active.title} threadId={active.id} />
          </section>
        )}

        {/* Empty state when no threads */}
        {threads.length === 0 && (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 }}>
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--pencil)', fontSize: 18 }}>No threads yet.</div>
            <button onClick={addThread} style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.12em', color: 'var(--paper)', background: 'var(--ink)', padding: '8px 18px', borderRadius: 999 }}>+ Start a thread</button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--pencil)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        <span>↑ {otherName} replies on her own. Try sending a thought.</span>
        <button
          onClick={() => {
            if (confirm('Reset chat to seed conversations?')) {
              localStorage.removeItem('reel.chat.v1');
              setThreads(JSON.parse(JSON.stringify(CHAT_THREADS)));
              setActiveId(CHAT_THREADS[0]?.id || null);
            }
          }}
          style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--pencil)', letterSpacing: '0.1em', borderBottom: '0.5px solid var(--hair-strong)' }}
        >
          reset thread →
        </button>
      </div>
    </div>
  );
}
