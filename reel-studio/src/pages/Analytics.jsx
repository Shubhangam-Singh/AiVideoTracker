import { useState, useEffect, useRef, useMemo } from 'react';
import clsx from 'clsx';
import { ANALYTICS, fmt, fmtFull } from '../data/index.js';
import { SectionHead } from '../components/shared.jsx';

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

  const max = Math.max(...data.map(d => Math.max(d[yKey1], d[yKey2]))) * 1.1;
  const xs = (i) => padL + i * ((w - padL - padR) / Math.max(1, data.length - 1));
  const ys = (v) => padT + (H - padT - padB) * (1 - v / max);

  const buildPath = (key, close) => {
    const pts = data.map((d, i) => [xs(i), ys(d[key])]);
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
            <line x1={padL} x2={w - padR} y1={ys(v)} y2={ys(v)}
              stroke="var(--hair)" strokeWidth="0.5" strokeDasharray={i === 0 ? '' : '2 4'} />
            <text x={padL - 10} y={ys(v) + 3} textAnchor="end"
              style={{ fontFamily: 'var(--mono)', fontSize: 9.5, fill: 'var(--pencil)', letterSpacing: '0.06em' }}>
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
              <rect x={xs(i) - bw - 1} y={ys(d[yKey1])} width={bw} height={H - padB - ys(d[yKey1])} fill={color1} opacity="0.85" />
              <rect x={xs(i) + 1}      y={ys(d[yKey2])} width={bw} height={H - padB - ys(d[yKey2])} fill={color2} opacity="0.85" />
            </g>
          );
        })}

        {data.map((d, i) => i % xStep === 0 ? (
          <text key={i} x={xs(i)} y={H - 10} textAnchor="middle"
            style={{ fontFamily: 'var(--mono)', fontSize: 9.5, fill: 'var(--pencil)', letterSpacing: '0.06em' }}>
            d{d.d}
          </text>
        ) : null)}

        {hover != null && (
          <g>
            <line x1={xs(hover)} x2={xs(hover)} y1={padT} y2={H - padB}
              stroke="var(--hair-strong)" strokeWidth="0.5" strokeDasharray="3 3" />
            <circle cx={xs(hover)} cy={ys(data[hover][yKey1])} r="3.5" fill="var(--paper)" stroke={color1} strokeWidth="1.2" />
            <circle cx={xs(hover)} cy={ys(data[hover][yKey2])} r="3.5" fill="var(--paper)" stroke={color2} strokeWidth="1.2" />
          </g>
        )}
      </svg>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 4px 0', borderTop: '0.5px solid var(--hair)', marginTop: 8,
      }}>
        <div style={{ display: 'flex', gap: 22 }}>
          <LegendItem color={color1} label={label1} value={hover != null ? fmt(data[hover][yKey1]) : fmt(data.reduce((s, d) => s + d[yKey1], 0))} suffix={hover != null ? `day ${data[hover].d}` : 'sum'} />
          <LegendItem color={color2} label={label2} value={hover != null ? fmt(data[hover][yKey2]) : fmt(data.reduce((s, d) => s + d[yKey2], 0))} suffix={hover != null ? `day ${data[hover].d}` : 'sum'} />
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
  const max = Math.max(yt, ig) * 1.18;
  const ytPct = (yt / max) * 100;
  const igPct = (ig / max) * 100;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '14px 0', borderBottom: '0.5px solid var(--hair)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--pencil)', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--pencil)' }}>
          IG {ig > yt ? '+' : '−'}{Math.round(Math.abs(ig - yt) / Math.max(1, yt) * 100)}%
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '54px 1fr 70px', gap: 12, alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink)', letterSpacing: '0.06em' }}>YT</span>
        <div style={{ height: 6, background: 'var(--surface)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${ytPct}%`, height: '100%', background: ytColor, borderRadius: 999, transition: 'width 700ms cubic-bezier(.2,.7,.2,1)' }} />
        </div>
        <span style={{ fontFamily: 'var(--serif)', fontSize: 18, textAlign: 'right', letterSpacing: '-0.01em' }}>{fmt(yt)}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '54px 1fr 70px', gap: 12, alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink)', letterSpacing: '0.06em' }}>IG</span>
        <div style={{ height: 6, background: 'var(--surface)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${igPct}%`, height: '100%', background: igColor, borderRadius: 999, transition: 'width 700ms cubic-bezier(.2,.7,.2,1)' }} />
        </div>
        <span style={{ fontFamily: 'var(--serif)', fontSize: 18, textAlign: 'right', letterSpacing: '-0.01em' }}>{fmt(ig)}</span>
      </div>
    </div>
  );
}

function Donut({ yt, ig, ytColor, igColor, size = 180 }) {
  const total = yt + ig;
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  const ytFrac = yt / total;
  const ytDash = c * ytFrac;
  return (
    <svg className="donut-svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} stroke={igColor} strokeWidth="14" fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke={ytColor} strokeWidth="14" fill="none"
        strokeDasharray={`${ytDash} ${c}`}
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2 - 4} textAnchor="middle"
        style={{ fontFamily: 'var(--serif)', fontSize: 32, fill: 'var(--ink)', letterSpacing: '-0.02em' }}>
        {fmt(total)}
      </text>
      <text x={size/2} y={size/2 + 16} textAnchor="middle"
        style={{ fontFamily: 'var(--mono)', fontSize: 9.5, fill: 'var(--pencil)', letterSpacing: '0.14em' }}>
        TOTAL REACH
      </text>
    </svg>
  );
}

function Sparkline({ data, color, height = 38 }) {
  const W = 140;
  const max = Math.max(...data) * 1.05;
  const min = Math.min(...data) * 0.85;
  const xs = (i) => i * (W / (data.length - 1));
  const ys = (v) => height - ((v - min) / (max - min)) * height;
  let d = `M ${xs(0)} ${ys(data[0])}`;
  for (let i = 1; i < data.length; i++) d += ` L ${xs(i)} ${ys(data[i])}`;
  let dFill = d + ` L ${xs(data.length - 1)} ${height} L ${xs(0)} ${height} Z`;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <path d={dFill} fill={color} opacity="0.12" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function RetentionCurve({ data1, data2, color1, color2, width = 200, height = 70 }) {
  const xs = (i, len) => i * (width / (len - 1));
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
      <path d={make(data1)} fill="none" stroke={color1} strokeWidth="1.4" />
      <path d={make(data2)} fill="none" stroke={color2} strokeWidth="1.4" />
    </svg>
  );
}

function PerReelGrid({ ytColor, igColor }) {
  const [open, setOpen] = useState(null);
  const ytHex = ytColor === 'var(--terracotta)' ? '#C4856A' : '#8FAF8A';
  const igHex = igColor === 'var(--terracotta)' ? '#C4856A' : '#8FAF8A';

  return (
    <>
      <div className="analytics-perreel-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
        {ANALYTICS.videos.map((v, i) => {
          const totalViews = v.yt.views + v.ig.views;
          const winner = v.ig.views > v.yt.views ? 'IG' : 'YT';
          const ratio = Math.round((winner === 'IG' ? v.ig.views / v.yt.views : v.yt.views / v.ig.views) * 10) / 10;
          const isOpen = open === v.id;
          return (
            <div key={v.id} className="card" style={{ padding: 0, overflow: 'hidden', transition: 'border-color 200ms' }}>
              <div style={{ padding: '20px 22px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14 }}>
                  <span className="num-badge">No. {String(i + 1).padStart(2, '0')}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.15, letterSpacing: '-0.005em' }}>
                      {v.title}{v.part && <span style={{ fontStyle: 'italic', color: 'var(--pencil)' }}> — {v.part}</span>}
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--pencil)', letterSpacing: '0.1em', marginTop: 4 }}>
                      published {v.published} &nbsp;·&nbsp; {fmt(totalViews)} total &nbsp;·&nbsp; <b style={{ color: winner === 'IG' ? igHex : ytHex }}>{winner} ×{ratio}</b>
                    </div>
                  </div>
                </div>

                <div className="analytics-platform-inner" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {['yt', 'ig'].map(p => {
                    const m = v[p];
                    const c = p === 'yt' ? ytHex : igHex;
                    return (
                      <div key={p} style={{ padding: '14px 14px 12px', background: 'var(--surface)', borderRadius: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ width: 7, height: 7, borderRadius: 2, background: c }} />
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink)' }}>
                            {p === 'yt' ? 'YouTube' : 'Instagram'}
                          </span>
                          <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--pencil)', letterSpacing: '0.06em' }}>
                            {m.watchAvg} avg
                          </span>
                        </div>
                        <div style={{ fontFamily: 'var(--serif)', fontSize: 30, lineHeight: 1, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                          {fmt(m.views)}
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <Sparkline data={v.daily.map(d => d[p])} color={c} height={32} />
                        </div>
                        <div style={{ display: 'flex', gap: 14, marginTop: 10, fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--pencil)', letterSpacing: '0.06em' }}>
                          <span>♥ {fmt(m.likes)}</span>
                          <span>✎ {fmt(m.comments)}</span>
                          <span>↗ {fmt(m.shares)}</span>
                          <span>☆ {fmt(m.saves)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => setOpen(isOpen ? null : v.id)}
                  style={{
                    marginTop: 14,
                    fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em',
                    color: 'var(--ink)', textTransform: 'uppercase',
                    borderBottom: '0.5px solid var(--hair-strong)', paddingBottom: 1,
                  }}>
                  {isOpen ? 'Collapse −' : 'Retention + details →'}
                </button>
              </div>

              {isOpen && (
                <div style={{ padding: '18px 22px 22px', background: 'var(--surface)', borderTop: '0.5px solid var(--hair)' }}>
                  <div className="analytics-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div>
                      <div className="eyebrow" style={{ marginBottom: 8 }}>retention</div>
                      <div className="ret-scroll">
                      <RetentionCurve data1={v.retYt} data2={v.retIg} color1={ytHex} color2={igHex} width={280} height={80} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--pencil)', letterSpacing: '0.08em' }}>
                        <span>0s</span><span>50% mark</span><span>end</span>
                      </div>
                    </div>
                    <div>
                      <div className="eyebrow" style={{ marginBottom: 8 }}>per-platform avg</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        {['yt', 'ig'].map(p => {
                          const m = v[p];
                          const c = p === 'yt' ? ytHex : igHex;
                          return (
                            <div key={p}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ width: 6, height: 6, borderRadius: 1.5, background: c }} />
                                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{p === 'yt' ? 'YouTube' : 'Instagram'}</span>
                              </div>
                              <div style={{ marginTop: 8, fontFamily: 'var(--serif)', fontSize: 22 }}>{m.avgPct}<span style={{ fontSize: 13, color: 'var(--pencil)' }}>%</span></div>
                              <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--pencil)', letterSpacing: '0.06em' }}>watched · {m.watchAvg}</div>
                              <div style={{ marginTop: 6, fontFamily: 'var(--serif)', fontSize: 18 }}>{m.ctr}<span style={{ fontSize: 12, color: 'var(--pencil)' }}>%</span></div>
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
    </>
  );
}

export default function Analytics({ tweaks }) {
  const [range, setRange] = useState('30d');
  const [chartStyle, setChartStyle] = useState(tweaks.chartStyle || 'area');
  useEffect(() => setChartStyle(tweaks.chartStyle || 'area'), [tweaks.chartStyle]);

  const ytColor = tweaks.ytFirst ? 'var(--terracotta)' : 'var(--sage)';
  const igColor = tweaks.ytFirst ? 'var(--sage)' : 'var(--terracotta)';

  const totals = ANALYTICS.totals;
  const daily = useMemo(() => {
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
  }, [range]);

  const totalReach = totals.yt.views + totals.ig.views;
  const totalEng   = (totals.yt.likes + totals.yt.comments + totals.yt.shares + totals.yt.saves
                    + totals.ig.likes + totals.ig.comments + totals.ig.shares + totals.ig.saves);

  return (
    <div className="page-enter">
      <div className="greeting">
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>[ 02 ] &nbsp; Analytics &nbsp;— &nbsp; cross-platform</div>
          <h1>Two channels, <span style={{ fontStyle: 'italic' }}>one mirror.</span></h1>
          <div className="sub">{ANALYTICS.videos.length} published reels measured across YouTube + Instagram.</div>
        </div>
        <div className="right">
          <div className="label">Total reach · 30d</div>
          <div className="value">{fmt(totalReach)}</div>
          <div className="note">{fmt(totalEng)} engagements</div>
        </div>
      </div>

      <div className="analytics-platform-totals" style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
        border: '0.5px solid var(--hair)', borderRadius: 6, overflow: 'hidden',
        marginBottom: 20,
      }}>
        {['yt', 'ig'].map((p, i) => {
          const t = totals[p];
          const color = p === 'yt' ? ytColor : igColor;
          const isYt = p === 'yt';
          return (
            <div key={p} style={{ padding: '28px 32px', borderRight: i === 0 ? '0.5px solid var(--hair)' : 0, position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                <span className="eyebrow">{isYt ? 'YouTube Shorts' : 'Instagram Reels'}</span>
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--pencil)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                  @reelstudio
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 24, alignItems: 'baseline' }}>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--pencil)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Views</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 48, lineHeight: 1, marginTop: 6, color, letterSpacing: '-0.02em' }}>{fmt(t.views)}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--pencil)', letterSpacing: '0.06em', marginTop: 8 }}>
                    {fmtFull(t.views)} total
                  </div>
                </div>
                {[
                  { l: 'Likes', v: t.likes },
                  { l: 'Comments', v: t.comments },
                  { l: 'Saves', v: t.saves },
                ].map(m => (
                  <div key={m.l}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--pencil)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{m.l}</div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 26, marginTop: 4, letterSpacing: '-0.01em' }}>{fmt(m.v)}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="analytics-toolbar" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
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
        </div>
        <AreaChart
          data={daily}
          yKey1="yt" yKey2="ig"
          color1={ytColor === 'var(--terracotta)' ? '#C4856A' : '#8FAF8A'}
          color2={igColor === 'var(--terracotta)' ? '#C4856A' : '#8FAF8A'}
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
            { l: 'Likes',    yt: totals.yt.likes,    ig: totals.ig.likes },
            { l: 'Comments', yt: totals.yt.comments, ig: totals.ig.comments },
            { l: 'Shares',   yt: totals.yt.shares,   ig: totals.ig.shares },
            { l: 'Saves',    yt: totals.yt.saves,    ig: totals.ig.saves },
          ].map(m => (
            <CompareBar key={m.l} label={m.l} yt={m.yt} ig={m.ig}
              ytColor={ytColor === 'var(--terracotta)' ? '#C4856A' : '#8FAF8A'}
              igColor={igColor === 'var(--terracotta)' ? '#C4856A' : '#8FAF8A'} />
          ))}
        </div>

        <div className="card" style={{ padding: '24px 22px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 14 }}>
            <span className="num-badge">A3</span>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>Reach split</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 14px' }}>
            <Donut yt={totals.yt.views} ig={totals.ig.views}
              ytColor={ytColor === 'var(--terracotta)' ? '#C4856A' : '#8FAF8A'}
              igColor={igColor === 'var(--terracotta)' ? '#C4856A' : '#8FAF8A'} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto', paddingTop: 14, borderTop: '0.5px solid var(--hair)' }}>
            {['yt', 'ig'].map(p => {
              const c = p === 'yt' ? ytColor : igColor;
              const v = totals[p].views;
              const pct = Math.round(v / (totals.yt.views + totals.ig.views) * 100);
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

      <SectionHead
        num="A4"
        title="Per-reel breakdown"
        sub="every published piece, both platforms"
        right={<a>Export CSV →</a>}
      />
      <PerReelGrid ytColor={ytColor} igColor={igColor} />
    </div>
  );
}
