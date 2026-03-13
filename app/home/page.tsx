import Link from "next/link";
import styles from "@/styles/home.css";

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* HERO */}
      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.eyebrow}>Eat with intention</div>

          <h1 className={styles.title}>
            Plan smarter.<br />Eat <em>better.</em><br />Live well.
          </h1>

          <p className={styles.body}>
            MealPlanner takes the daily grind out of deciding what to eat.
            Built for real people with real schedules — not nutritionists with spreadsheets.
          </p>

          <div className={styles.actions}>
            <Link href="/register" className={styles.btn}>Start for free</Link>
            <a href="#why" className={styles.btnGhost}>See how it works →</a>
          </div>
        </div>

        <div className={styles.heroRight}>
          <div className={styles.stat}>
            <div className={styles.statNum}>500+</div>
            <div className={styles.statLabel}>Recipes in the library</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNum}>7</div>
            <div className={styles.statLabel}>Days planned in minutes</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNum}>0</div>
            <div className={styles.statLabel}>Spreadsheets required</div>
          </div>
        </div>
      </div>

      {/* WHY */}
      <section id="why" className={styles.section}>
        <div className={styles.tag}>Why we built this</div>

        <h2 className={styles.sectionTitle}>
          Meal planning shouldn't feel like <em>homework.</em>
        </h2>

        <p className={styles.sectionBody}>
          Families often get tired of the Sunday panic — staring into the fridge,
          ordering takeaway for the fourth time that week, and feeling vaguely guilty about it.
          So we built the tool we actually wanted to use.
        </p>

        <div className={styles.whyGrid}>
          {[
            ["01","Decision fatigue is real","The average person makes over 200 food-related decisions a day. We automate the boring ones so you can focus on actually enjoying your meals."],
            ["02","Food waste costs everyone","The average UK household throws away £730 of food a year. Smart planning built around what you already have fixes that quietly in the background."],
            ["03","Consistency beats perfection","You don't need a perfect diet. You need a sustainable rhythm. MealPlanner is designed around realistic weeks, not aspirational ones."],
          ].map(([num, title, desc]) => (
            <div key={num} className={styles.whyCard}>
              <div className={styles.whyNum}>{num}</div>
              <div className={styles.whyTitle}>{title}</div>
              <div className={styles.whyDesc}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className={styles.section}>
        <div className={styles.tag}>About us</div>

        <h2 className={styles.sectionTitle}>
          A small project with a <em>genuine</em> purpose.
        </h2>

        <div className={styles.aboutGrid}>
          <div className={styles.aboutLeft}>
            <div className={styles.quote}>
              "I just wanted to stop asking 'what's for dinner' every single night."
            </div>

            <p className={styles.aboutBody}>
              MealPlanner started as a personal side project — a Next.js app thrown together
              over a few weekends because the alternatives were either bloated, paywalled,
              or just ugly.
            </p>

            <p className={styles.aboutBody}>
              It's still early. The library is growing, the features are expanding,
              and the community is just starting to form. If that sounds like something
              you want to be part of — you're early, and that's a good thing.
            </p>

            <div className={styles.aboutSig}>The MealPlanner team</div>
          </div>

          <div className={styles.aboutRight}>
            <div className={styles.timeline}>
              {[
                ["Early March 26","A very buggy, yet working version.","Not ready for production... I noticed that"],
                ["2026","Now","The new version. Still scrappy. Still improving. Building in the open with the people who use it."],
              ].map(([year, title, desc]) => (
                <div key={year} className={styles.timelineItem}>
                  <span className={styles.timelineYear}>{year}</span>
                  <div className={styles.timelineText}>
                    <strong>{title}</strong>
                    {desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className={styles.section}>
        <div className={styles.tag}>What's inside?</div>

        <h2 className={styles.sectionTitle}>
          Everything you need. <em>Nothing you don't.</em>
        </h2>

        <div className={styles.featGrid}>
          {[
            ["🍽️","Weekly Planner","Drag, drop, and fill your week in minutes. Swap meals on the fly without losing your whole plan."],
            ["🛒","Smart Shopping List","Auto-generated from your plan. Grouped by aisle. Quantities scaled to your household size."],
            ["📚","Recipe Library","500+ recipes and growing. Filter by time, cuisine, or what's already in your fridge."],
            ["✏️","Custom Recipes","Add your own. They live in your library forever, available on any device."],
            ["🔁","Repeat & Rotate","Save meal plans you love and roll them out again with one click. Build a rotation that works."],
            ["🔒","Private by Default","Your plans, preferences, and recipes are yours. No social feed. No public profiles. No noise."],
          ].map(([icon, title, desc]) => (
            <div key={title} className={styles.feat}>
              <div className={styles.featIcon}>{icon}</div>
              <div className={styles.featTitle}>{title}</div>
              <div className={styles.featDesc}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaLabel}>Ready when you are</div>
        <h2 className={styles.ctaTitle}>Start planning this week.</h2>

        <div className={styles.ctaActions}>
          <Link href="/auth" className={styles.btn}>Create free account</Link>
          <Link href="/auth" className={styles.btnGhost}>Already have one? Sign in →</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerCopy}>2026 MealPlanner — Built with care</div>

        <div className={styles.footerLinks}>
          <a href="#" className={styles.footerLink}>Privacy</a>
          <a href="#" className={styles.footerLink}>Terms</a>
          <a href="#" className={styles.footerLink}>Contact</a>
        </div>
      </footer>
    </div>
  );
}
