import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { Avatar, Modal } from '../components/shared.jsx';
import { useResource } from '../lib/useResource.js';
import { api } from '../lib/api.js';
import { socket } from '../lib/socket.js';
import { useAuth } from '../lib/AuthProvider.jsx';

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
function fmtDay(ts) {
  const d = new Date(ts); const today = new Date();
  const diff = Math.round((today.setHours(0,0,0,0) - new Date(d).setHours(0,0,0,0)) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return d.toLocaleDateString([], { weekday: 'long' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
function previewText(m) {
  if (!m) return '';
  if (m.decision) return '◆ ' + (m.decision_text || m.decisionText || 'decision');
  if (m.attachment) return m.attachment.kind === 'video' ? '⏵ video reference' : m.attachment.kind === 'prompt' ? '✎ prompt' : '⊕ attachment';
  return m.text;
}

// ── thread list item ──────────────────────────────────────────────────────────

function ThreadItem({ thread, active, lastMsg, currentUser, otherUserName, onClick, onDelete, online }) {
  const fromLabel = !lastMsg ? ''
    : lastMsg.from_user === currentUser ? 'You: '
    : lastMsg.from_user === 'ai' ? 'Claude: '
    : (lastMsg.from_user === 's1' ? 'Shub: ' : 'San: ');
  return (
    <div className="thread-row" style={{ position: 'relative' }}>
      <button onClick={onClick} className={clsx('thread-btn', active && 'on')}>
        <div className="thread-avatar">
          {thread.linked_video_id ? <span>▶</span> : <span>{thread.title.slice(0, 1).toUpperCase()}</span>}
          {online && <span className="thread-presence" />}
        </div>
        <div className="thread-body">
          <div className="thread-row1">
            <div className="thread-title">{thread.title}{thread.pinned ? ' · ◆' : ''}</div>
            <div className="thread-time">{lastMsg ? fmtTime(lastMsg.created_at) : ''}</div>
          </div>
          <div className="thread-preview">{fromLabel}{previewText(lastMsg)}</div>
        </div>
      </button>
      <button className="thread-delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Delete thread">×</button>
    </div>
  );
}

// ── message bubble ────────────────────────────────────────────────────────────

function AttachmentCard({ attachment, videos, prompts }) {
  if (!attachment) return null;
  if (attachment.kind === 'video') {
    const v = (videos || []).find(x => x.id === attachment.id);
    return (
      <div className="attach-card">
        <div className="attach-icon">▶</div>
        <div>
          <div className="attach-eyebrow">video</div>
          <div className="attach-title">{v ? `${v.title}${v.part ? ' — ' + v.part : ''}` : attachment.id}</div>
          {v && <div className="attach-meta">{v.status} · {v.tool}</div>}
        </div>
      </div>
    );
  }
  if (attachment.kind === 'prompt') {
    const p = (prompts || []).find(x => x.id === attachment.id);
    return (
      <div className="attach-card">
        <div className="attach-icon">✎</div>
        <div>
          <div className="attach-eyebrow">prompt · {p?.tool?.toLowerCase() || ''}</div>
          <div className="attach-title">{p?.title || attachment.id}</div>
          {p && <div className="attach-body">{p.body}</div>}
        </div>
      </div>
    );
  }
  return null;
}

function MessageRow({ msg, mine, isAi, videos, prompts, showAvatar, fromName, onDelete }) {
  if (msg.decision) {
    return (
      <div className="msg-decision">
        <div className="msg-decision-pin">
          <div className="msg-decision-eyebrow">◆ Decision</div>
          <div className="msg-decision-text">{msg.decision_text || msg.decisionText}</div>
          <div className="msg-decision-meta">{fromName} · {fmtTime(msg.created_at)}</div>
        </div>
      </div>
    );
  }
  return (
    <div className={clsx('msg-row', mine && 'mine', isAi && 'ai')}>
      {!mine && showAvatar && <Avatar who={isAi ? 'ai' : msg.from_user} size={26} />}
      {!mine && !showAvatar && <span className="msg-avatar-gap" />}
      <div className="msg-bubble-wrap">
        {!mine && showAvatar && <div className="msg-from">{fromName}</div>}
        <div className={clsx('msg-bubble', mine ? 'mine' : isAi ? 'ai' : 'theirs')}>
          {msg.text && <div className="msg-text">{msg.text}</div>}
          {msg.attachment && <AttachmentCard attachment={msg.attachment} videos={videos} prompts={prompts} />}
          <div className="msg-meta-row">
            <span className="msg-time">{fmtTime(msg.created_at)}</span>
            {mine && <span className="msg-tick">✓✓</span>}
            {mine && <button className="msg-del" onClick={onDelete} title="Delete">×</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── attach sheet (mobile = bottom sheet, desktop = inline popover) ────────────

function AttachSheet({ onClose, onPickVideo, onPickPrompt, onDecide, videos, prompts }) {
  const [tab, setTab] = useState('actions');
  useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);
  return (
    <div className="attach-sheet-backdrop" onClick={onClose}>
      <div className="attach-sheet" onClick={e => e.stopPropagation()}>
        <div className="attach-sheet-handle" />
        <div className="attach-sheet-tabs">
          {['actions', 'video', 'prompt'].map(k => (
            <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{k}</button>
          ))}
        </div>
        <div className="attach-sheet-body">
          {tab === 'actions' && (
            <>
              <button className="attach-sheet-row" onClick={onDecide}><span className="attach-sheet-icon">◆</span> Mark as decision</button>
              <button className="attach-sheet-row" onClick={() => { setTab('video'); }}><span className="attach-sheet-icon">▶</span> Attach a video</button>
              <button className="attach-sheet-row" onClick={() => { setTab('prompt'); }}><span className="attach-sheet-icon">✎</span> Attach a prompt</button>
            </>
          )}
          {tab === 'video' && (videos || []).map(v => (
            <button key={v.id} className="attach-sheet-row" onClick={() => onPickVideo(v.id)}>
              <span className="attach-sheet-icon">▶</span>
              <span>{v.title}{v.part ? ' — ' + v.part : ''}<small style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--pencil)', letterSpacing: '0.08em', marginTop: 2 }}>{v.status} · {v.tool}</small></span>
            </button>
          ))}
          {tab === 'prompt' && (prompts || []).map(p => (
            <button key={p.id} className="attach-sheet-row" onClick={() => onPickPrompt(p.id)}>
              <span className="attach-sheet-icon">✎</span>
              <span>{p.title}<small style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--pencil)', letterSpacing: '0.08em', marginTop: 2 }}>{p.tool.toLowerCase()}</small></span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── decisions modal ───────────────────────────────────────────────────────────

function DecisionsModal({ decisions, onClose }) {
  return (
    <Modal title={`Decisions · ${decisions.length}`} onClose={onClose} wide>
      {decisions.length === 0 && (
        <div style={{ padding: 24, textAlign: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--pencil)' }}>
          No decisions pinned yet. Use the ◆ option in the composer.
        </div>
      )}
      {decisions.map(d => (
        <div key={d.id} className="msg-decision-pin" style={{ marginBottom: 12 }}>
          <div className="msg-decision-eyebrow">◆ Decision</div>
          <div className="msg-decision-text">{d.decision_text}</div>
          <div className="msg-decision-meta">{d.from_user === 's1' ? 'Shubhangam' : 'Sanjeevani'} · {fmtTime(d.created_at)}</div>
        </div>
      ))}
    </Modal>
  );
}

// ── conversation panel ────────────────────────────────────────────────────────

function Conversation({ thread, currentUser, currentName, otherName, videos, prompts, online, onBack, onRenamed, onDeleted }) {
  const { data: messages, setData: setMessages, refetch } = useResource(thread ? `/api/threads/${thread.id}/messages` : null);
  const [typingPeer, setTypingPeer] = useState(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(thread?.title || '');
  const [decisionsOpen, setDecisionsOpen] = useState(false);
  const [attachSheet, setAttachSheet] = useState(false);
  const [pendingAttach, setPendingAttach] = useState(null);
  const scrollRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => { setTitleDraft(thread?.title || ''); setEditingTitle(false); }, [thread?.id]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages?.length, typingPeer]);

  // Listen for WS events for THIS thread
  useEffect(() => {
    if (!thread) return;
    const unsub = socket.subscribe((ev) => {
      if (ev.type === 'message.created' && ev.threadId === thread.id) {
        setMessages(prev => {
          const list = prev || [];
          if (list.some(m => m.id === ev.message.id)) return list;
          return [...list, ev.message];
        });
      } else if (ev.type === 'message.deleted' && ev.threadId === thread.id) {
        setMessages(prev => (prev || []).filter(m => m.id !== ev.id));
      } else if (ev.type === 'typing' && ev.threadId === thread.id && ev.userId !== currentUser) {
        setTypingPeer(ev.userId);
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setTypingPeer(null), 2500);
      }
    });
    return unsub;
  }, [thread?.id, currentUser, setMessages]);

  const renameSave = async () => {
    const t = titleDraft.trim();
    if (!t || !thread) { setEditingTitle(false); return; }
    await api.patch('/api/threads/' + thread.id, { title: t });
    onRenamed?.({ ...thread, title: t });
    setEditingTitle(false);
  };

  const sendMessage = async (payload) => {
    if (!thread) return;
    if (pendingAttach && payload.kind === 'text') {
      // not used currently, but reserved
    }
    const body = { threadId: thread.id, ...payload };
    try {
      const created = await api.post('/api/messages', body);
      setMessages(prev => {
        const list = prev || [];
        if (list.some(m => m.id === created.id)) return list;
        return [...list, created];
      });
    } catch (err) { console.error(err); refetch(); }
  };

  const onTyping = () => {
    socket.send({ type: 'typing', threadId: thread.id });
  };

  const deleteMessage = async (m) => {
    if (!confirm('Delete this message?')) return;
    await api.delete('/api/messages/' + m.id);
    setMessages(prev => (prev || []).filter(x => x.id !== m.id));
  };

  const list = messages || [];
  const decisions = list.filter(m => m.decision);

  // Group by day + collapse consecutive messages from same sender
  const grouped = useMemo(() => {
    let lastDay = '';
    let lastFrom = '';
    return list.map((m, i) => {
      const day = fmtDay(m.created_at);
      const dayBreak = day !== lastDay;
      const senderBreak = m.from_user !== lastFrom || dayBreak;
      lastDay = day; lastFrom = m.from_user;
      return { msg: m, dayBreak, day, senderBreak };
    });
  }, [list]);

  if (!thread) {
    return (
      <div className="chat-empty">
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--pencil)', fontSize: 20 }}>
          Pick a thread or start a new one.
        </div>
      </div>
    );
  }

  const fromName = (u) => u === 'ai' ? 'Claude' : u === 's1' ? 'Shubhangam' : 'Sanjeevani';

  return (
    <section className="chat-conv">
      <header className="chat-header">
        {onBack && <button className="chat-back" onClick={onBack} aria-label="Back"><span>‹</span></button>}
        <Avatar who={thread.linked_video_id ? 's2' : 's1'} size={32} />
        <div className="chat-header-info">
          {editingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={e => setTitleDraft(e.target.value)}
              onBlur={renameSave}
              onKeyDown={e => { if (e.key === 'Enter') renameSave(); if (e.key === 'Escape') setEditingTitle(false); }}
              className="chat-title-input"
            />
          ) : (
            <div className="chat-title" onClick={() => setEditingTitle(true)} title="Tap to rename">{thread.title}</div>
          )}
          <div className="chat-status">
            <span className={`chat-status-dot ${online ? 'on' : 'off'}`} />
            {online ? `${otherName} · active now` : 'offline'}
          </div>
        </div>
        <button className="chat-decisions-btn" onClick={() => setDecisionsOpen(true)} title="Decisions">◆ {decisions.length}</button>
        <button className="chat-delete-thread" onClick={() => { if (confirm(`Delete thread "${thread.title}"?`)) onDeleted(thread); }} title="Delete thread">⋯</button>
      </header>

      <div ref={scrollRef} className="chat-scroll">
        {grouped.map(({ msg, dayBreak, day, senderBreak }, i) => (
          <div key={msg.id}>
            {dayBreak && (
              <div className="chat-day">
                <span>{day}</span>
              </div>
            )}
            <MessageRow
              msg={msg}
              mine={msg.from_user === currentUser}
              isAi={msg.from_user === 'ai'}
              videos={videos} prompts={prompts}
              showAvatar={senderBreak}
              fromName={fromName(msg.from_user)}
              onDelete={() => deleteMessage(msg)}
            />
          </div>
        ))}
        {typingPeer && (
          <div className="msg-row">
            <Avatar who={typingPeer} size={26} />
            <div className="msg-bubble theirs typing">
              <span className="typing-dot" />
              <span className="typing-dot" style={{ animationDelay: '160ms' }} />
              <span className="typing-dot" style={{ animationDelay: '320ms' }} />
            </div>
          </div>
        )}
        {list.length === 0 && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--pencil)', fontSize: 16 }}>
            Start the conversation.
          </div>
        )}
      </div>

      <ComposerWrapper threadId={thread.id} threadTitle={thread.title} videos={videos} prompts={prompts} onSend={sendMessage} onTyping={onTyping} />

      {decisionsOpen && <DecisionsModal decisions={decisions} onClose={() => setDecisionsOpen(false)} />}
    </section>
  );
}

// Wrap Composer so the AttachSheet has access to videos/prompts
function ComposerWrapper({ threadId, threadTitle, videos, prompts, onSend, onTyping }) {
  const [text, setText] = useState('');
  const [decisionMode, setDecisionMode] = useState(false);
  const [sheet, setSheet] = useState(false);
  const ta = useRef(null);

  useEffect(() => {
    try { setText(localStorage.getItem('reel.chat.draft.' + threadId) || ''); } catch {}
    setDecisionMode(false);
  }, [threadId]);

  useEffect(() => {
    try { localStorage.setItem('reel.chat.draft.' + threadId, text); } catch {}
  }, [text, threadId]);

  useEffect(() => {
    if (!ta.current) return;
    ta.current.style.height = 'auto';
    ta.current.style.height = Math.min(140, ta.current.scrollHeight) + 'px';
  }, [text]);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    if (decisionMode) onSend({ kind: 'decision', decision: true, decisionText: t });
    else onSend({ kind: 'text', text: t });
    setText(''); setDecisionMode(false);
    try { localStorage.removeItem('reel.chat.draft.' + threadId); } catch {}
  };
  const askClaude = () => {
    const t = text.trim();
    if (!t) return;
    onSend({ kind: 'ai-prompt', text: t });
    setText('');
    try { localStorage.removeItem('reel.chat.draft.' + threadId); } catch {}
  };

  return (
    <div className="composer">
      {decisionMode && (
        <div className="composer-banner">
          ◆ Decision mode — what's been agreed?
          <button onClick={() => setDecisionMode(false)}>cancel</button>
        </div>
      )}
      <div className={clsx('composer-box', decisionMode && 'decision')}>
        <button className="composer-btn" onClick={() => setSheet(true)} title="Attach">+</button>
        <textarea
          ref={ta}
          rows={1}
          value={text}
          onChange={e => { setText(e.target.value); onTyping?.(); }}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={decisionMode ? 'Write the decision…' : `Message ${threadTitle}…`}
        />
        <button className="composer-btn ai" onClick={askClaude} disabled={!text.trim()} title="Ask Claude (assistant)">✦</button>
        <button className="composer-btn send" onClick={send} disabled={!text.trim()} title="Send">↑</button>
      </div>
      {sheet && (
        <AttachSheet
          videos={videos}
          prompts={prompts}
          onClose={() => setSheet(false)}
          onPickVideo={(id) => { onSend({ kind: 'attach', attachment: { kind: 'video', id } }); setSheet(false); }}
          onPickPrompt={(id) => { onSend({ kind: 'attach', attachment: { kind: 'prompt', id } }); setSheet(false); }}
          onDecide={() => { setDecisionMode(true); setSheet(false); }}
        />
      )}
    </div>
  );
}

// ── chat page ─────────────────────────────────────────────────────────────────

export default function Chat({ onMobileThreadOpenChange }) {
  const { user } = useAuth();
  const currentUser = user.id;
  const otherUser = currentUser === 's1' ? 's2' : 's1';
  const otherName = otherUser === 's1' ? 'Shubhangam' : 'Sanjeevani';
  const currentName = user.name;

  const { data: threads, setData: setThreads, refetch: refetchThreads } = useResource('/api/threads');
  const { data: videos } = useResource('/api/videos');
  const { data: prompts } = useResource('/api/prompts');
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState('');
  const [online, setOnline] = useState({});
  const [mobileView, setMobileView] = useState('list');
  const [lastMessages, setLastMessages] = useState({}); // threadId -> last msg

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const h = (e) => setIsMobile(e.matches);
    mq.addEventListener ? mq.addEventListener('change', h) : mq.addListener(h);
    return () => mq.removeEventListener ? mq.removeEventListener('change', h) : mq.removeListener(h);
  }, []);

  useEffect(() => {
    if (onMobileThreadOpenChange) onMobileThreadOpenChange(isMobile && mobileView === 'thread' && activeId);
  }, [isMobile, mobileView, activeId, onMobileThreadOpenChange]);

  useEffect(() => {
    const onPop = () => setMobileView('list');
    window.addEventListener('reel:chat-back', onPop);
    return () => window.removeEventListener('reel:chat-back', onPop);
  }, []);

  // Auto-select first thread
  useEffect(() => {
    if (!activeId && threads && threads.length > 0) setActiveId(threads[0].id);
  }, [threads, activeId]);

  // Subscribe to socket events for thread list updates + presence
  useEffect(() => {
    const unsub = socket.subscribe((ev) => {
      if (ev.type === 'hello') {
        const map = {};
        for (const u of ev.online || []) map[u] = true;
        setOnline(map);
      } else if (ev.type === 'presence') {
        setOnline(prev => ({ ...prev, [ev.userId]: ev.online }));
      } else if (ev.type === 'message.created') {
        setLastMessages(prev => ({ ...prev, [ev.threadId]: ev.message }));
      } else if (ev.type === 'thread.created') {
        setThreads(prev => {
          if ((prev || []).some(t => t.id === ev.thread.id)) return prev;
          return [ev.thread, ...(prev || [])];
        });
      } else if (ev.type === 'thread.updated') {
        setThreads(prev => (prev || []).map(t => t.id === ev.thread.id ? ev.thread : t));
      } else if (ev.type === 'thread.deleted') {
        setThreads(prev => (prev || []).filter(t => t.id !== ev.id));
        if (ev.id === activeId) setActiveId(null);
      }
    });
    return unsub;
  }, [activeId, setThreads]);

  // Prime last message map for thread list
  useEffect(() => {
    if (!threads) return;
    threads.forEach(t => {
      if (lastMessages[t.id]) return;
      api.get(`/api/threads/${t.id}/messages?limit=1`).then(arr => {
        if (arr && arr.length) setLastMessages(prev => ({ ...prev, [t.id]: arr[arr.length - 1] }));
      }).catch(() => {});
    });
    // eslint-disable-next-line
  }, [threads]);

  const active = (threads || []).find(t => t.id === activeId) || null;
  const filtered = (threads || []).filter(t => {
    if (!query) return true;
    const last = lastMessages[t.id];
    return (t.title + ' ' + (last?.text || '')).toLowerCase().includes(query.toLowerCase());
  });

  const addThread = async () => {
    const created = await api.post('/api/threads', { title: 'New thread' });
    setThreads(prev => [created, ...(prev || [])]);
    setActiveId(created.id);
    if (isMobile) setMobileView('thread');
  };
  const deleteThread = async (t) => {
    await api.delete('/api/threads/' + t.id);
    setThreads(prev => (prev || []).filter(x => x.id !== t.id));
    if (activeId === t.id) {
      const next = (threads || []).filter(x => x.id !== t.id);
      setActiveId(next[0]?.id || null);
      if (isMobile) setMobileView('list');
    }
  };
  const renameThread = (updated) => {
    setThreads(prev => (prev || []).map(t => t.id === updated.id ? { ...t, ...updated } : t));
  };

  return (
    <div className="page-enter chat-page">
      <div className="greeting chat-greeting">
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>[ 03 ] &nbsp; Chat</div>
          <h1>Talking <span style={{ fontStyle: 'italic' }}>about the work.</span></h1>
        </div>
      </div>

      <div className={clsx('chat-shell', isMobile && (mobileView === 'thread' ? 'show-thread' : 'show-list'))}>
        <aside className="chat-list">
          <div className="chat-list-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="eyebrow">Threads</span>
              <span style={{ flex: 1 }} />
              <button className="chat-new" onClick={addThread}>+ new</button>
            </div>
            <div className="chat-search">
              <span>⌕</span>
              <input placeholder="Search…" value={query} onChange={e => setQuery(e.target.value)} />
            </div>
          </div>
          <div className="chat-list-scroll">
            {filtered.map(t => (
              <ThreadItem
                key={t.id}
                thread={t}
                lastMsg={lastMessages[t.id]}
                active={t.id === activeId}
                currentUser={currentUser}
                otherUserName={otherName}
                online={t.linked_video_id ? online[otherUser] : online[otherUser]}
                onClick={() => { setActiveId(t.id); if (isMobile) setMobileView('thread'); }}
                onDelete={() => { if (confirm(`Delete thread "${t.title}"?`)) deleteThread(t); }}
              />
            ))}
            {filtered.length === 0 && !query && (
              <div style={{ padding: '40px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--pencil)', fontSize: 16 }}>No threads yet.</div>
                <button className="chat-new" onClick={addThread}>+ Start one</button>
              </div>
            )}
            {filtered.length === 0 && query && (
              <div style={{ padding: 24, textAlign: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--pencil)' }}>
                no threads match.
              </div>
            )}
          </div>
        </aside>

        <Conversation
          thread={active}
          currentUser={currentUser}
          currentName={currentName}
          otherName={otherName}
          videos={videos}
          prompts={prompts}
          online={online[otherUser]}
          onBack={isMobile ? () => setMobileView('list') : null}
          onRenamed={renameThread}
          onDeleted={deleteThread}
        />
      </div>

      <div className="chat-foot">
        <span>Tip: type <code>@claude</code> or tap ✦ to ask the assistant. Real messages send instantly between both of you.</span>
      </div>
    </div>
  );
}
