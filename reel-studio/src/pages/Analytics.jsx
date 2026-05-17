import { useState, useEffect, useRef, useMemo } from 'react';
import clsx from 'clsx';
import { ANALYTICS, fmt, fmtFull } from '../data/index.js';
import { SectionHead } from '../components/shared.jsx';
import { useResource } from '../lib/useResource.js';
import { api } from '../lib/api.js';

// ── SVG chart helpers ────────────────────────────────────────────────────────

function AreaChart({ data, yKey1, yKey2, color1, color2, label1, label2, style = 'area', height = 240 }) {
  const ref = useRef(null);
  const [hover, setHover] = useState(null);
  const [w, setW] = useState(800);
  const H = height;
  const padL = 44, padR = 22, padT = 18, padB = 30;

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setW(Math.max(320, Math.round(e.contentRect.width)));
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  if (!data || data.length < 2) {
    return (
      <div ref={ref} style={{ width: '100%', height: H, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--pencil)' }}>No data yet.</span>
      </div>
    );
  }

  const max = Math.max(...data.map(d => Math.max(d[yKey1] || 0, d[yKey2] || 0))) * 1.1 || 1;
  const xs = (i) => padL + i * ((w - padL - padR) / Math.max(1, data.length - 1));
  const ys = (v) => padT + (H - padT - padB) * (1 - v / max);

  const buildPath = (key, close) => {
    const pts = data.map((d, i) => [xs(i), ys(d[key] || 0)]);
    let path = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
      const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
      const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
      const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
    }
    if (close) path += ` L ${xs(data.length - 1)} ${H - padB} L ${xs(0)} ${H - padB} Z`;
    return path;
  };

  const yTicks = 4;
  const yVals = Array.from({ length: yTicks + 1 }, (_, i) => max * (i / yTicks));
  const xStep = Math.ceil(data.length / 8);

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (w / rect.width);
    const i = Math.min(data.length - 1, Math.max(0, Math.round((x - padL) / ((w - padL - padR) / (data.length - 1)))));
    setHover(i);
  };

  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg width="100%" viewBox={`0 0 ${w} ${H}`} preserveAspectRatio="none"
        onMouseMove={onMove} onMouseLeave={() => setHover(null)}
        style={{ display: 'block', overflow: 'visible' }}>
        {yVals.map((v, i) => (
          <g key={i}>
            <line x1={padL} x2={w - padR} y1={ys(v)} y2={ys(v)} stroke="var(--hair)" strokeWidth="0.5" strokeDasharray={i === 0 ? '' : '2 4'} />
            <text x={padL - 10} y={ys(v) + 3} textAnchor="end" style={{ fontFamily: 'var(--mono)', fontSize: 9.5, fill: 'var(--pencil)', letterSpacing: '0.06em' }}>
              {fmt(Math.round(v))}
            </text>
          </g>
        ))}
        {style === 'area' && (
          <>
            <path d={buildPath(yKey1, true)} fill={color1} opacity="0.14" />
            <path d={buildPath(yKey2, true)} fill={color2} opacity="0.14" />
          </>
        )}
        {style !== 'bars' && (
          <>
            <path d={buildPath(yKey1, false)} fill="none" stroke={color1} strokeWidth="1.5" strokeLinejoin="round" />
            <path d={buildPath(yKey2, false)} fill="none" stroke={color2} strokeWidth="1.5" strokeLinejoin="round" />
          </>
        )}
        {style === 'bars' && data.map((d, i) => {
          const bw = Math.max(2, (w - padL - padR) / data.length * 0.4);
          return (
            <g key={i}>
              <rect x={xs(i) - bw - 1} y={ys(d[yKey1] || 0)} width={bw} height={H - padB - ys(d[yKey1] || 0)} fill={color1} opacity="0.85" />
              <rect x={xs(i) + 1}      y={ys(d[yKey2] || 0)} width={bw} height={H - padB - ys(d[yKey2] || 0)} fill={color2} opacity="0.85" />
            </g>
          );
        })}
        {data.map((d, i) => i % xStep === 0 ? (
          <text key={i} x={xs(i)} y={H - 10} textAnchor="middle" style={{ fontFamily: 'var(--mono)', fontSize: 9.5, fill: 'var(--pencil)', letterSpacing: '0.06em' }}>
            d{d.d}
          </text>
        ) : null)}
        {hover != null && (
          <g>
            <line x1={xs(hover)} x2={xs(hover)} y1={padT} y2={H - padB} stroke="var(--hair-strong)" strokeWidth="0.5" strokeDasharray="3 3" />
            <circle cx={xs(hover)} cy={ys(data[hover][yKey1] || 0)} r="3.5" fill="var(--paper)" stroke={color1} strokeWidth="1.2" />
            <circle cx={xs(hover)} cy={ys(data[hover][yKey2] || 0)} r="3.5" fill="var(--paper)" stroke={color2} strokeWidth="1.2" />
          </g>
        )}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 4px 0', borderTop: '0.5px solid var(--hair)', marginTop: 8 }}>
        <div style={{ display: 'flex', gap: 22 }}>
          <LegendItem color={color1} label={label1} value={hover != null ? fmt(data[hover][yKey1] || 0) : fmt(data.reduce((s, d) => s + (d[yKey1] || 0), 0))} suffix={hover != null ? `day ${data[hover].d}` : 'sum'} />
          <LegendItem color={color2} label={label2} value={hover != null ? fmt(data[hover][yKey2] || 0) : fmt(data.reduce((s, d) => s + (d[yKey2] || 0), 0))} suffix={hover != null ? `day ${data[hover].d}` : 'sum'} />
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--pencil)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {hover != null ? `hover · d${data[hover].d}` : 'hover for daily'}
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label, value, suffix }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: 'inline-block', alignSelf: 'center' }} />
      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--pencil)', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontFamily: 'var(--serif)', fontSize: 20, lineHeight: 1, color: 'var(--ink)' }}>{value}</span>
      {suffix && <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--pencil)', letterSpacing: '0.08em' }}>{suffix}</span>}
    </div>
  );
}

function CompareBar({ label, yt, ig, ytColor, igColor }) {
  const max = Math.max(yt, ig, 1) * 1.18;
  const ytPct = (yt / max) * 100;
  const igPct = (ig / max) * 100;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '14px 0', borderBottom: '0.5px solid var(--hair)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--pencil)', textTransform: 'uppercase' }}>{label}</span>
        {yt > 0 && <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--pencil)' }}>
          IG {ig > yt ? '+' : '−'}{Math.round(Math.abs(ig - yt) / Math.max(1, yt) * 100)}%
        </span>}
      </div>
      {['YT', 'IG'].map((lbl, idx) => {
        const pct = idx === 0 ? ytPct : igPct;
        const val = idx === 0 ? yt : ig;
        const col = idx === 0 ? ytColor : igColor;
        return (
          <div key={lbl} style={{ display: 'grid', gridTemplateColumns: '54px 1fr 70px', gap: 12, alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink)', letterSpacing: '0.06em' }}>{lbl}</span>
            <div style={{ height: 6, background: 'var(--surface)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: col, borderRadius: 999, transition: 'width 700ms cubic-bezier(.2,.7,.2,1)' }} />
            </div>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 18, textAlign: 'right', letterSpacing: '-0.01em' }}>{fmt(val)}</span>
          </div>
        );
      })}
    </div>
  );
}

function Donut({ yt, ig, ytColor, igColor, size = 180 }) {
  const total = Math.max(yt + ig, 1);
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  const ytFrac = yt / total;
  const ytDash = c * ytFrac;
  return (
    <svg className="donut-svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} stroke={igColor} strokeWidth="14" fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke={ytColor} strokeWidth="14" fill="none"
        strokeDasharray={`${ytDash} ${c}`} transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2 - 4} textAnchor="middle" style={{ fontFamily: 'var(--serif)', fontSize: 32, fill: 'var(--ink)', letterSpacing: '-0.02em' }}>
        {fmt(total)}
      </text>
      <text x={size/2} y={size/2 + 16} textAnchor="middle" style={{ fontFamily: 'var(--mono)', fontSize: 9.5, fill: 'var(--pencil)', letterSpacing: '0.14em' }}>
        TOTAL REACH
      </text>
    </svg>
  );
}

function Sparkline({ data, color, height = 38 }) {
  const W = 140;
  const max = Math.max(...data) * 1.05 || 1;
  const min = Math.min(...data) * 0.85;
  const xs = (i) => i * (W / Math.max(1, data.length - 1));
  const ys = (v) => height - ((v - min) / (max - min || 1)) * height;
  let d = `M ${xs(0)} ${ys(data[0])}`;
  for (let i = 1; i < data.length; i++) d += ` L ${xs(i)} ${ys(data[i])}`;
  const dFill = d + ` L ${xs(data.length - 1)} ${height} L ${xs(0)} ${height} Z`;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <path d={dFill} fill={color} opacity="0.12" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function RetentionCurve({ data1, data2, color1, color2, width = 200, height = 70 }) {
  const xs = (i, len) => i * (width / Math.max(1, len - 1));
  const ys = (v) => height - 6 - (v / 100) * (height - 12);
  const make = (data) => {
    let d = `M ${xs(0, data.length)} ${ys(data[0])}`;
    for (let i = 1; i < data.length; i++) d += ` L ${xs(i, data.length)} ${ys(data[i])}`;
    return d;
  };
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <line x1="0" x2={width} y1={ys(0)} y2={ys(0)} stroke="var(--hair)" strokeWidth="0.5" />
      <line x1="0" x2={width} y1={ys(50)} y2={ys(50)} stroke="var(--hair)" strokeWidth="0.5" strokeDasharray="2 3" />
      {data1.length > 1 && <path d={make(data1)} fill="none" stroke={color1} strokeWidth="1.4" />}
      {data2.length > 1 && <path d={make(data2)} fill="none" stroke={color2} strokeWidth="1.4" />}
    </svg>
  );
}

// ── Per-reel grid ─────────────────────────────────────────────────────────────

function PerReelGrid({ videos, ytColor, igColor }) {
  const [open, setOpen] = useState(null);
  const ytHex = ytColor === 'var(--terracotta)' ? '#C4856A' : '#8FAF8A';
  const igHex = igColor === 'var(--terracotta)' ? '#C4856A' : '#8FAF8A';

  if (!videos || videos.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--pencil)' }}>
        No video data available. Connect your platforms to see per-reel analytics.
      </div>
    );
  }

  return (
    <div className="analytics-perreel-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>
      {videos.map((v, i) => {
        const totalViews = (v.yt?.views || 0) + (v.ig?.views || 0);
        const winner = (v.ig?.views || 0) > (v.yt?.views || 0) ? 'IG' : 'YT';
        const ratio = Math.max(1, Math.round(
          (winner === 'IG' ? (v.ig?.views || 1) / Math.max(1, v.yt?.views || 1) : (v.yt?.views || 1) / Math.max(1, v.ig?.views || 1)) * 10
        ) / 10);
        const isOpen = open === v.id;
        return (
          <div key={v.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 22px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14 }}>
                <span className="num-badge">No. {String(i + 1).padStart(2, '0')}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.15 }}>
                    {v.title}{v.part && <span style={{ fontStyle: 'italic', color: 'var(--pencil)' }}> — {v.part}</span>}
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--pencil)', letterSpacing: '0.1em', marginTop: 4 }}>
                    published {v.published} &nbsp;·&nbsp; {fmt(totalViews)} total {totalViews > 0 && <>&nbsp;·&nbsp; <b style={{ color: winner === 'IG' ? igHex : ytHex }}>{winner} ×{ratio}</b></>}
                  </div>
                </div>
              </div>

              <div className="analytics-platform-inner" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {['yt', 'ig'].map(p => {
                  const m = v[p] || {};
                  const c = p === 'yt' ? ytHex : igHex;
                  const sparkData = v.daily?.length ? v.daily.map(d => d[p] || 0) : [0, 1, 0];
                  return (
                    <div key={p} style={{ padding: '14px 14px 12px', background: 'var(--surface)', borderRadius: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ width: 7, height: 7, borderRadius: 2, background: c }} />
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink)' }}>
                          {p === 'yt' ? 'YouTube' : 'Instagram'}
                        </span>
                        {m.watchAvg && <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--pencil)', letterSpacing: '0.06em' }}>{m.watchAvg} avg</span>}
                      </div>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: 30, lineHeight: 1, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                        {fmt(m.views || 0)}
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <Sparkline data={sparkData} color={c} height={32} />
                      </div>
                      <div style={{ display: 'flex', gap: 14, marginTop: 10, fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--pencil)', letterSpacing: '0.06em', flexWrap: 'wrap' }}>
                        <span>♥ {fmt(m.likes || 0)}</span>
                        <span>✎ {fmt(m.comments || 0)}</span>
                        <span>↗ {fmt(m.shares || 0)}</span>
                        <span>☆ {fmt(m.saves || 0)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {(v.retYt?.length > 1 || v.retIg?.length > 1) && (
                <button onClick={() => setOpen(isOpen ? null : v.id)} style={{ marginTop: 14, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink)', textTransform: 'uppercase', borderBottom: '0.5px solid var(--hair-strong)', paddingBottom: 1 }}>
                  {isOpen ? 'Collapse −' : 'Retention + details →'}
                </button>
              )}
            </div>

            {isOpen && (
              <div style={{ padding: '18px 22px 22px', background: 'var(--surface)', borderTop: '0.5px solid var(--hair)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <div className="eyebrow" style={{ marginBottom: 8 }}>retention</div>
                    <RetentionCurve data1={v.retYt || []} data2={v.retIg || []} color1={ytHex} color2={igHex} width={280} height={80} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--pencil)', letterSpacing: '0.08em' }}>
                      <span>0s</span><span>50% mark</span><span>end</span>
                    </div>
                  </div>
                  <div>
                    <div className="eyebrow" style={{ marginBottom: 8 }}>per-platform avg</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      {['yt', 'ig'].map(p => {
                        const m = v[p] || {};
                        const c = p === 'yt' ? ytHex : igHex;
                        return (
                          <div key={p}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ width: 6, height: 6, borderRadius: 1.5, background: c }} />
                              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{p === 'yt' ? 'YouTube' : 'Instagram'}</span>
                            </div>
                            <div style={{ marginTop: 8, fontFamily: 'var(--serif)', fontSize: 22 }}>{m.avgPct || 0}<span style={{ fontSize: 13, color: 'var(--pencil)' }}>%</span></div>
                            <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--pencil)', letterSpacing: '0.06em' }}>watched · {m.watchAvg || '—'}</div>
                            <div style={{ marginTop: 6, fontFamily: 'var(--serif)', fontSize: 18 }}>{m.ctr || 0}<span style={{ fontSize: 12, color: 'var(--pencil)' }}>%</span></div>
                            <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--pencil)', letterSpacing: '0.06em' }}>click-through</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Platform connector ────────────────────────────────────────────────────────

function PlatformCard({ platform, status, ytColor, igColor, onSync, syncing }) {
  const isYt = platform === 'youtube';
  const color = isYt ? ytColor : igColor;
  const label = isYt ? 'YouTube' : 'Instagram';
  const icon = isYt ? '▶' : '◈';

  const connectHref = `/api/analytics/connect/${platform}`;

  const disconnect = async () => {
    if (!confirm(`Disconnect ${label}?`)) return;
    try { await api.delete(`/api/analytics/disconnect/${platform}`); window.location.reload(); } catch {}
  };

  return (
    <div className="card" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 6, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--paper)', fontSize: 16, flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>{label}</div>
          {status?.connected ? (
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--pencil)', letterSpacing: '0.08em', marginTop: 2 }}>
              {status.account} &nbsp;·&nbsp;
              <span style={{ color: '#6aad86' }}>● connected</span>
            </div>
          ) : (
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--pencil)', letterSpacing: '0.08em', marginTop: 2 }}>
              {status?.configured ? 'not connected' : 'api keys not configured'}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {status?.connected ? (
            <>
              <button onClick={onSync} disabled={syncing} className="settings-secondary" style={{ fontSize: 10.5, padding: '5px 12px' }}>
                {syncing ? 'syncing…' : '↻ Sync'}
              </button>
              <button onClick={disconnect} className="settings-secondary" style={{ fontSize: 10.5, padding: '5px 12px', color: 'var(--terracotta)' }}>
                Disconnect
              </button>
            </>
          ) : status?.configured ? (
            <a href={connectHref} className="settings-primary" style={{ fontSize: 10.5, padding: '5px 14px', textDecoration: 'none' }}>
              Connect →
            </a>
          ) : (
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--pencil)', letterSpacing: '0.06em' }}>add keys in .env</span>
          )}
        </div>
      </div>
      {!status?.configured && (
        <div style={{ padding: '10px 12px', background: 'var(--surface)', borderRadius: 4, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--pencil)', letterSpacing: '0.08em', lineHeight: 1.6 }}>
          Set <code style={{ background: 'var(--surface-2)', padding: '1px 4px', borderRadius: 2 }}>
            {isYt ? 'YOUTUBE_CLIENT_ID + YOUTUBE_CLIENT_SECRET' : 'INSTAGRAM_APP_ID + INSTAGRAM_APP_SECRET'}
          </code> in .env to enable OAuth.
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Analytics({ tweaks }) {
  const [range, setRange] = useState('30d');
  const [chartStyle, setChartStyle] = useState(tweaks.chartStyle || 'area');
  const [syncing, setSyncing] = useState(false);
  const [showConnections, setShowConnections] = useState(false);

  useEffect(() => setChartStyle(tweaks.chartStyle || 'area'), [tweaks.chartStyle]);

  const { data: status, refetch: refetchStatus } = useResource('/api/analytics/status');
  const { data: realData, loading: realLoading, refetch: refetchData } = useResource(
    `/api/analytics/data?period=${range}`
  );

  const ytColor = tweaks.ytFirst ? 'var(--terracotta)' : 'var(--sage)';
  const igColor = tweaks.ytFirst ? 'var(--sage)' : 'var(--terracotta)';
  const ytHex = ytColor === 'var(--terracotta)' ? '#C4856A' : '#8FAF8A';
  const igHex = igColor === 'var(--terracotta)' ? '#C4856A' : '#8FAF8A';

  // Decide what data to show
  const isConnected = realData && !realData.isDemo;

  const daily = useMemo(() => {
    if (isConnected && realData?.daily?.length) return realData.daily;
    // Demo data fallback
    if (range === '7d') return ANALYTICS.daily.slice(-7);
    if (range === '90d') {
      const base = ANALYTICS.daily;
      return [
        ...base,
        ...base.map(d => ({ ...d, d: d.d + 30, yt: Math.round(d.yt * 0.88), ig: Math.round(d.ig * 1.12) })),
        ...base.map(d => ({ ...d, d: d.d + 60, yt: Math.round(d.yt * 0.74), ig: Math.round(d.ig * 1.26) })),
      ];
    }
    return ANALYTICS.daily;
  }, [range, isConnected, realData]);

  const totals = useMemo(() => {
    if (isConnected) {
      const yt = realData?.youtube?.totals || { views: 0, likes: 0, comments: 0, shares: 0, saves: 0 };
      const ig = realData?.instagram?.totals || { views: 0, likes: 0, comments: 0, shares: 0, saves: 0 };
      return { yt, ig };
    }
    return ANALYTICS.totals;
  }, [isConnected, realData]);

  const videos = useMemo(() => {
    if (isConnected && realData?.videos?.length) return realData.videos;
    return ANALYTICS.videos;
  }, [isConnected, realData]);

  const totalReach = (totals.yt.views || 0) + (totals.ig.views || 0);
  const totalEng = Object.values(totals.yt).reduce((s, v) => s + (v || 0), 0) - (totals.yt.views || 0) - (totals.yt.watchMins || 0) - (totals.yt.subscribers || 0) +
                   Object.values(totals.ig).reduce((s, v) => s + (v || 0), 0) - (totals.ig.views || 0);

  const doSync = async () => {
    setSyncing(true);
    try { await api.post('/api/analytics/sync'); await refetchData(); } catch {}
    setSyncing(false);
  };

  return (
    <div className="page-enter">
      <div className="greeting">
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>[ 02 ] &nbsp; Analytics &nbsp;— &nbsp; cross-platform</div>
          <h1>Two channels, <span style={{ fontStyle: 'italic' }}>one mirror.</span></h1>
          <div className="sub">
            {isConnected ? 'Live data from your connected accounts.' : `${ANALYTICS.videos.length} reels · demo data — connect YouTube & Instagram below.`}
          </div>
        </div>
        <div className="right">
          <div className="label">Total reach · {range}</div>
          <div className="value">{fmt(totalReach)}</div>
          <div className="note">{fmt(Math.max(0, totalEng))} engagements</div>
        </div>
      </div>

      {/* Connection manager */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => setShowConnections(p => !p)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'var(--ink)',
            border: '0.5px solid var(--hair-strong)', padding: '7px 14px', borderRadius: 4,
          }}>
          {showConnections ? '▲' : '▼'} &nbsp; Platform connections
          {status && (
            <span style={{ marginLeft: 6, display: 'flex', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: status.youtube?.connected ? '#6aad86' : 'var(--pencil-soft)' }} />
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: status.instagram?.connected ? '#6aad86' : 'var(--pencil-soft)' }} />
            </span>
          )}
        </button>

        {showConnections && status && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 14 }}>
            <PlatformCard platform="youtube" status={status.youtube} ytColor={ytHex} igColor={igHex} onSync={doSync} syncing={syncing} />
            <PlatformCard platform="instagram" status={status.instagram} ytColor={ytHex} igColor={igHex} onSync={doSync} syncing={syncing} />
          </div>
        )}

        {!realData?.isDemo && !isConnected && !showConnections && (
          <div style={{
            marginTop: 12, padding: '10px 16px',
            background: 'var(--terracotta-soft)', border: '0.5px solid rgba(196,133,106,0.3)',
            borderRadius: 4, fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink)', letterSpacing: '0.08em',
          }}>
            Showing demo data. Click "Platform connections" above to connect YouTube &amp; Instagram.
          </div>
        )}
      </div>

      {/* Platform totals */}
      <div className="analytics-platform-totals" style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
        border: '0.5px solid var(--hair)', borderRadius: 6, overflow: 'hidden', marginBottom: 20,
      }}>
        {['yt', 'ig'].map((p, i) => {
          const t = totals[p];
          const color = p === 'yt' ? ytColor : igColor;
          const hex = p === 'yt' ? ytHex : igHex;
          const isYt = p === 'yt';
          const connInfo = isYt ? realData?.youtube?.channel : realData?.instagram?.account;
          return (
            <div key={p} style={{ padding: '24px 20px 22px', borderRight: i === 0 ? '0.5px solid var(--hair)' : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                <span className="eyebrow">{isYt ? 'YouTube Shorts' : 'Instagram Reels'}</span>
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--pencil)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                  {connInfo?.name || connInfo?.account || (isConnected ? '—' : '@demo')}
                </span>
              </div>
              <div className="analytics-stat-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 24px', alignItems: 'baseline' }}>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--pencil)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Views</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 42, lineHeight: 1, marginTop: 6, color: hex, letterSpacing: '-0.02em' }}>{fmt(t.views || 0)}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--pencil)', letterSpacing: '0.06em', marginTop: 8 }}>{fmtFull(t.views || 0)} total</div>
                </div>
                {[
                  { l: 'Likes', v: t.likes },
                  { l: 'Comments', v: t.comments },
                  { l: 'Saves', v: t.saves },
                ].map(m => (
                  <div key={m.l}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--pencil)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{m.l}</div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 22, marginTop: 4, letterSpacing: '-0.01em' }}>{fmt(m.v || 0)}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="analytics-toolbar" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <span className="eyebrow">range</span>
        <div className="filter-row">
          {['7d', '30d', '90d'].map(r => (
            <button key={r} className={clsx('filter', range === r && 'on')} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="eyebrow">view</span>
          <div className="filter-row">
            {['area', 'line', 'bars'].map(s => (
              <button key={s} className={clsx('filter', chartStyle === s && 'on')} onClick={() => setChartStyle(s)}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '24px 22px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 14 }}>
          <span className="num-badge">A1</span>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>Views over time</span>
          <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--pencil)' }}>both platforms, daily</span>
          {realLoading && <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--pencil)', letterSpacing: '0.1em' }}>loading…</span>}
        </div>
        <AreaChart
          data={daily}
          yKey1="yt" yKey2="ig"
          color1={ytHex} color2={igHex}
          label1="YouTube" label2="Instagram"
          style={chartStyle}
        />
      </div>

      <div className="analytics-engagement-row" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginTop: 20 }}>
        <div className="card" style={{ padding: '24px 22px 4px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 8 }}>
            <span className="num-badge">A2</span>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>Engagement</span>
            <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--pencil)' }}>where the audience reacts</span>
          </div>
          {[
            { l: 'Likes',    yt: totals.yt.likes    || 0, ig: totals.ig.likes    || 0 },
            { l: 'Comments', yt: totals.yt.comments  || 0, ig: totals.ig.comments  || 0 },
            { l: 'Shares',   yt: totals.yt.shares   || 0, ig: totals.ig.shares   || 0 },
            { l: 'Saves',    yt: totals.yt.saves    || 0, ig: totals.ig.saves    || 0 },
          ].map(m => (
            <CompareBar key={m.l} label={m.l} yt={m.yt} ig={m.ig} ytColor={ytHex} igColor={igHex} />
          ))}
        </div>

        <div className="card" style={{ padding: '24px 22px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 14 }}>
            <span className="num-badge">A3</span>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>Reach split</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 14px' }}>
            <Donut yt={totals.yt.views || 0} ig={totals.ig.views || 0} ytColor={ytHex} igColor={igHex} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto', paddingTop: 14, borderTop: '0.5px solid var(--hair)' }}>
            {['yt', 'ig'].map(p => {
              const c = p === 'yt' ? ytColor : igColor;
              const v = totals[p]?.views || 0;
              const total = (totals.yt.views || 0) + (totals.ig.views || 0);
              const pct = total ? Math.round(v / total * 100) : 0;
              return (
                <div key={p} style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    {p === 'yt' ? 'YouTube' : 'Instagram'}
                  </span>
                  <span style={{ marginLeft: 'auto', fontFamily: 'var(--serif)', fontSize: 18 }}>{pct}%</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--pencil)', letterSpacing: '0.06em' }}>{fmt(v)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <SectionHead num="A4" title="Per-reel breakdown" sub="every published piece, both platforms"
        right={<a style={{ cursor: 'pointer' }} onClick={() => {
          const q = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
          const rows = videos.map(v => [
            q(v.title), q(v.published),
            v.yt?.views || 0, v.ig?.views || 0,
            v.yt?.likes || 0, v.ig?.likes || 0,
            v.yt?.comments || 0, v.ig?.comments || 0,
          ].join(','));
          const csv = ['title,published,yt_views,ig_views,yt_likes,ig_likes,yt_comments,ig_comments', ...rows].join('\n');
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = `reelstudio-analytics-${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        }}>Export CSV →</a>}
      />
      <PerReelGrid videos={videos} ytColor={ytColor} igColor={igColor} />
    </div>
  );
}
