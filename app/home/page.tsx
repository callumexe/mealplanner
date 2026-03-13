import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{background:#0a0a0a;color:#e8e4d8;font-family:'DM Mono',monospace;overflow-x:hidden}
        body::before{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");pointer-events:none;z-index:0;opacity:.4}

        .hp-hero{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;padding-top:72px;position:relative;border-bottom:1px solid #1a1a1a}
        .hp-hero-left{padding:6rem 3rem;display:flex;flex-direction:column;justify-content:center;border-right:1px solid #1a1a1a;position:relative}
        .hp-hero-left::before{content:'';position:absolute;top:-200px;left:-200px;width:600px;height:600px;background:radial-gradient(circle,rgba(212,175,55,.06) 0%,transparent 70%);pointer-events:none}
        .hp-eyebrow{font-size:.62rem;letter-spacing:.25em;text-transform:uppercase;color:#d4af37;margin-bottom:1.5rem;display:flex;align-items:center;gap:.75rem;animation:fadeUp .6s ease both}
        .hp-eyebrow::before{content:'';width:24px;height:1px;background:#d4af37}
        .hp-title{font-family:'DM Serif Display',serif;font-size:clamp(3rem,5.5vw,5rem);line-height:1.0;letter-spacing:-.01em;color:#f0ece0;margin-bottom:2rem;animation:fadeUp .6s ease .1s both}
        .hp-title em{color:#d4af37;font-style:italic}
        .hp-body{font-size:.8rem;line-height:1.8;color:#555;max-width:420px;margin-bottom:3rem;animation:fadeUp .6s ease .2s both}
        .hp-actions{display:flex;align-items:center;gap:1.5rem;animation:fadeUp .6s ease .3s both}
        .hp-btn{background:#d4af37;color:#0a0a0a;font-family:'DM Mono',monospace;font-size:.68rem;letter-spacing:.18em;text-transform:uppercase;padding:.85rem 2rem;font-weight:500;text-decoration:none;display:inline-block;transition:background .2s}
        .hp-btn:hover{background:#e8c84a}
        .hp-btn-ghost{font-size:.68rem;letter-spacing:.15em;text-transform:uppercase;color:#3a3a3a;text-decoration:none;transition:color .2s;display:flex;align-items:center;gap:.5rem}
        .hp-btn-ghost:hover{color:#e8e4d8}
        .hp-hero-right{padding:6rem 3rem;display:flex;flex-direction:column;justify-content:center;gap:1px;background:#0a0a0a}
        .hp-stat{border:1px solid #1a1a1a;padding:2rem}
        .hp-stat-num{font-family:'DM Serif Display',serif;font-style:italic;font-size:3rem;color:#d4af37;line-height:1;margin-bottom:.5rem}
        .hp-stat-label{font-size:.62rem;letter-spacing:.2em;text-transform:uppercase;color:#3a3a3a}

        .hp-section{padding:7rem 3rem;border-bottom:1px solid #1a1a1a;position:relative}
        .hp-tag{font-size:.6rem;letter-spacing:.25em;text-transform:uppercase;color:#d4af37;display:flex;align-items:center;gap:.75rem;margin-bottom:1rem}
        .hp-tag::before{content:'';width:20px;height:1px;background:#d4af37}
        .hp-section-title{font-family:'DM Serif Display',serif;font-size:clamp(2rem,3.5vw,3rem);line-height:1.1;color:#f0ece0;max-width:560px;margin-bottom:1.5rem}
        .hp-section-title em{color:#d4af37;font-style:italic}
        .hp-section-body{font-size:.8rem;line-height:1.9;color:#555;max-width:560px}

        .hp-why-grid{display:grid;grid-template-columns:1fr 1fr;gap:0;margin-top:5rem;border:1px solid #1a1a1a}
        .hp-why-card{padding:2.5rem;border:1px solid #1a1a1a;transition:background .2s}
        .hp-why-card:hover{background:#0f0f0f}
        .hp-why-num{font-family:'DM Serif Display',serif;font-style:italic;font-size:2.5rem;color:#1e1e1e;line-height:1;margin-bottom:1.25rem;transition:color .3s}
        .hp-why-card:hover .hp-why-num{color:#d4af37}
        .hp-why-title{font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:#e8e4d8;margin-bottom:.75rem;font-weight:500}
        .hp-why-desc{font-size:.75rem;line-height:1.8;color:#444}

        .hp-about-inner{display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid #1a1a1a;margin-top:4rem}
        .hp-about-left{padding:3rem;border-right:1px solid #1a1a1a}
        .hp-about-right{padding:3rem}
        .hp-quote{font-family:'DM Serif Display',serif;font-style:italic;font-size:1.6rem;line-height:1.4;color:#f0ece0;margin-bottom:2rem;border-left:2px solid #d4af37;padding-left:1.5rem}
        .hp-about-body{font-size:.78rem;line-height:1.9;color:#555;margin-bottom:1.5rem}
        .hp-about-sig{font-size:.65rem;letter-spacing:.15em;text-transform:uppercase;color:#d4af37;margin-top:2rem;display:flex;align-items:center;gap:.75rem}
        .hp-about-sig::before{content:'';width:20px;height:1px;background:#d4af37}
        .hp-timeline{display:flex;flex-direction:column}
        .hp-tl-item{display:grid;grid-template-columns:80px 1fr;gap:1.5rem;padding:1.5rem 0;border-bottom:1px solid #141414;align-items:start}
        .hp-tl-item:last-child{border-bottom:none}
        .hp-tl-year{font-size:.62rem;letter-spacing:.1em;color:#3a3a3a;padding-top:.1rem}
        .hp-tl-text{font-size:.75rem;line-height:1.7;color:#555}
        .hp-tl-text strong{color:#e8e4d8;font-weight:500;display:block;margin-bottom:.25rem;font-size:.72rem;letter-spacing:.05em;text-transform:uppercase}

        .hp-feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#1a1a1a;border:1px solid #1a1a1a;margin-top:4rem}
        .hp-feat{background:#0a0a0a;padding:2.5rem;transition:background .2s;position:relative;overflow:hidden}
        .hp-feat::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,#d4af37,transparent);transform:scaleX(0);transition:transform .4s ease}
        .hp-feat:hover{background:#0d0d0d}
        .hp-feat:hover::before{transform:scaleX(1)}
        .hp-feat-icon{font-size:1.5rem;margin-bottom:1.5rem}
        .hp-feat-title{font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;color:#e8e4d8;margin-bottom:.75rem;font-weight:500}
        .hp-feat-desc{font-size:.73rem;line-height:1.8;color:#444}

        .hp-cta{padding:8rem 3rem;text-align:center;position:relative;overflow:hidden}
        .hp-cta::before{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:800px;height:400px;background:radial-gradient(ellipse,rgba(212,175,55,.05) 0%,transparent 70%);pointer-events:none}
        .hp-cta-label{font-size:.62rem;letter-spacing:.25em;text-transform:uppercase;color:#d4af37;margin-bottom:1.5rem}
        .hp-cta-title{font-family:'DM Serif Display',serif;font-style:italic;font-size:clamp(2.5rem,5vw,4.5rem);color:#f0ece0;line-height:1.05;margin-bottom:2.5rem}
        .hp-cta-actions{display:flex;align-items:center;justify-content:center;gap:2rem}

        .hp-footer{padding:2rem 3rem;display:flex;align-items:center;justify-content:space-between;border-top:1px solid #141414}
        .hp-footer-copy{font-size:.62rem;letter-spacing:.1em;color:#2a2a2a}
        .hp-footer-links{display:flex;gap:2rem}
        .hp-footer-link{font-size:.62rem;letter-spacing:.1em;color:#2a2a2a;text-decoration:none;transition:color .2s}
        .hp-footer-link:hover{color:#d4af37}

        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}

        @media(max-width:768px){
          .hp-nav{padding:1rem 1.25rem}
          .hp-nav-links{display:none}
          .hp-hero{grid-template-columns:1fr}
          .hp-hero-right{display:none}
          .hp-hero-left{padding:4rem 1.5rem}
          .hp-section{padding:4rem 1.5rem}
          .hp-why-grid,.hp-about-inner,.hp-feat-grid{grid-template-columns:1fr}
          .hp-footer{flex-direction:column;gap:1rem;text-align:center}
        }
      `}</style>

      {/* HERO */}
      <div className="hp-hero">
        <div className="hp-hero-left">
          <div className="hp-eyebrow">Eat with intention</div>
          <h1 className="hp-title">Plan smarter.<br />Eat <em>better.</em><br />Live well.</h1>
          <p className="hp-body">MealPlanner takes the daily grind out of deciding what to eat. Built for real people with real schedules — not nutritionists with spreadsheets.</p>
          <div className="hp-actions">
            <Link href="/register" className="hp-btn">Start for free</Link>
            <a href="#why" className="hp-btn-ghost">See how it works →</a>
          </div>
        </div>
        <div className="hp-hero-right">
          <div className="hp-stat"><div className="hp-stat-num">500+</div><div className="hp-stat-label">Recipes in the library</div></div>
          <div className="hp-stat"><div className="hp-stat-num">7</div><div className="hp-stat-label">Days planned in minutes</div></div>
          <div className="hp-stat"><div className="hp-stat-num">0</div><div className="hp-stat-label">Spreadsheets required</div></div>
        </div>
      </div>

      {/* WHY */}
      <section id="why" className="hp-section">
        <div className="hp-tag">Why we built this</div>
        <h2 className="hp-section-title">Meal planning shouldn't feel like <em>homework.</em></h2>
        <p className="hp-section-body">Families often get tired of the Sunday panic — staring into the fridge, ordering takeaway for the fourth time that week, and feeling vaguely guilty about it. So we built the tool we actually wanted to use.</p>
        <div className="hp-why-grid">
          {[
            ["01","Decision fatigue is real","The average person makes over 200 food-related decisions a day. We automate the boring ones so you can focus on actually enjoying your meals."],
            ["02","Food waste costs everyone","The average UK household throws away £730 of food a year. Smart planning built around what you already have fixes that quietly in the background."],
            ["03","Consistency beats perfection","You don't need a perfect diet. You need a sustainable rhythm. MealPlanner is designed around realistic weeks, not aspirational ones."],
          ].map(([num, title, desc]) => (
            <div key={num} className="hp-why-card">
              <div className="hp-why-num">{num}</div>
              <div className="hp-why-title">{title}</div>
              <div className="hp-why-desc">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="hp-section">
        <div className="hp-tag">About us</div>
        <h2 className="hp-section-title">A small project with a <em>genuine</em> purpose.</h2>
        <div className="hp-about-inner">
          <div className="hp-about-left">
            <div className="hp-quote">"I just wanted to stop asking 'what's for dinner' every single night."</div>
            <p className="hp-about-body">MealPlanner started as a personal side project — a Next.js app thrown together over a few weekends because the alternatives were either bloated, paywalled, or just ugly.</p>
            <p className="hp-about-body">It's still early. The library is growing, the features are expanding, and the community is just starting to form. If that sounds like something you want to be part of — you're early, and that's a good thing.</p>
            <div className="hp-about-sig">The MealPlanner team</div>
          </div>
          <div className="hp-about-right">
            <div className="hp-timeline">
              {[
                ["Early March 26","A very buggy, yet working version. Not ready for production... I noticed that"],
                ["2026","Now","The new version. Still scrappy. Still improving. Building in the open with the people who use it."],
              ].map(([year, title, desc]) => (
                <div key={year} className="hp-tl-item">
                  <span className="hp-tl-year">{year}</span>
                  <div className="hp-tl-text"><strong>{title}</strong>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="hp-section">
        <div className="hp-tag">What's inside?</div>
        <h2 className="hp-section-title">Everything you need. <em>Nothing you don't.</em></h2>
        <div className="hp-feat-grid">
          {[
            ["Weekly Planner","Drag, drop, and fill your week in minutes. Swap meals on the fly without losing your whole plan."],
            ["Smart Shopping List","Auto-generated from your plan. Grouped by aisle. Quantities scaled to your household size."],
            ["Recipe Library","500+ recipes and growing. Filter by time, cuisine, or what's already in your fridge."],
            ["Custom Recipes","Add your own. They live in your library forever, available on any device."],
            ["Repeat & Rotate","Save meal plans you love and roll them out again with one click. Build a rotation that works."],
            ["Private by Default","Your plans, preferences, and recipes are yours. No social feed. No public profiles. No noise."],
          ].map(([icon, title, desc]) => (
            <div key={title} className="hp-feat">
              <div className="hp-feat-icon">{icon}</div>
              <div className="hp-feat-title">{title}</div>
              <div className="hp-feat-desc">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="hp-cta">
        <div className="hp-cta-label">Ready when you are</div>
        <h2 className="hp-cta-title">Start planning this week.</h2>
        <div className="hp-cta-actions">
          <Link href="/auth" className="hp-btn">Create free account</Link>
          <Link href="/auth" className="hp-btn-ghost">Already have one? Sign in →</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="hp-footer">
        <div className="hp-footer-copy">2026 MealPlanner — Built with care</div>
        <div className="hp-footer-links">
          <a href="#" className="hp-footer-link">Privacy</a>
          <a href="#" className="hp-footer-link">Terms</a>
          <a href="#" className="hp-footer-link">Contact</a>
        </div>
      </footer>
    </>
  );
}