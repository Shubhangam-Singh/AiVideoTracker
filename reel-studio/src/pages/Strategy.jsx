export default function Strategy() {
  return (
    <div className="page-enter">
      <div className="greeting">
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>[ 07 ] &nbsp; Strategy</div>
          <h1>The <span style={{ fontStyle: 'italic' }}>working notebook.</span></h1>
          <div className="sub">A living record. Added to when something becomes true.</div>
        </div>
        <div className="right">
          <div className="label">Last edited</div>
          <div className="value">2 d ago</div>
          <div className="note">by Sanjeevani</div>
        </div>
      </div>

      <div className="notebook">
        <div className="nb-page">
          <div className="nb-head">
            <h1>Channel notes — <span style={{ fontStyle: 'italic' }}>spring drafts.</span></h1>
            <div className="date">May 14, 2026</div>
          </div>

          <div className="nb-section">
            <h3>Niche</h3>
            <div className="body">
              Cinematic short-form storytelling — <span className="highlight">AI-assisted, but never AI-feeling</span>. We sit between film grain and algorithm.
              Adjacent to: visual essays, lo-fi narrative TikTok, art-school b-roll.
              Not: tutorials, talking-head, motivational. <span className="strike">Tech news.</span>
            </div>
          </div>

          <div className="nb-section">
            <h3>Audience</h3>
            <ul className="nb-list">
              <li>18–28, design/film-curious, scrolls at night.</li>
              <li>Saves over likes. Reshares to one friend, not the feed.</li>
              <li>Watches in full screen, sound on, with the lights off.</li>
            </ul>
          </div>

          <div className="nb-section">
            <h3>Content style</h3>
            <div className="body">
              45 – 90 seconds. One feeling per video. Slow opener (1.5 s of empty frame before motion). Captions only when necessary, set in <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>DM Mono</span>.
              Color: warm desaturated, never neon. Sound: ambient pad + one foley detail.
            </div>
          </div>

          <div className="nb-section">
            <h3>Channel name — candidates</h3>
            <ul className="nb-list">
              <li><span className="highlight">reel.studio</span> &nbsp;<span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--pencil)' }}>— winner, for now</span></li>
              <li>two hands films</li>
              <li>quiet hours</li>
              <li className="strike">brainrot.mov</li>
              <li>the soft channel</li>
            </ul>
          </div>

          <div className="nb-section">
            <h3>Monetisation — eventually</h3>
            <div className="body">
              <b style={{ fontWeight: 400 }}>Year 1:</b> no money, only craft. Build 100 videos.
              <b style={{ fontWeight: 400 }}> &nbsp; Year 2:</b> brand films for small studios (3 per quarter, hand-picked).
              <b style={{ fontWeight: 400 }}> &nbsp; Year 3:</b> a small print zine of stills. A LUT pack. Maybe a Patreon for process notes.
              <span style={{ fontStyle: 'italic', color: 'var(--pencil)' }}> &nbsp;Refuse: dropshipping ads, AI tool affiliate, get-rich threads.</span>
            </div>
          </div>

          <div className="nb-section" style={{ marginBottom: 0 }}>
            <h3>Promise to ourselves</h3>
            <div className="body" style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 19 }}>
              We will not ship anything we wouldn't watch with the sound on.
            </div>
            <div style={{ marginTop: 16, fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--pencil)', textTransform: 'uppercase' }}>
              — S &amp; S, May 2026
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
