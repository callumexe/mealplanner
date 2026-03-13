"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "@/styles/waitlist.css";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");

    const res = await fetch("/api/registerWaitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok) {
      setStatus("success");
      setMessage(data.message);
    } else {
      setStatus("error");
      setMessage(data.error);
    }
  }

  return (
    <div className={styles.page}>
      {/* LEFT */}
      <div className={styles.left}>
        <div className={styles.leftGlow} />

        <div>
          <p className={styles.eyebrow}>
            <span className={styles.line} />
            Coming soon
          </p>

          <h1 className={styles.title}>
            Be the first to<br />eat <em>smarter.</em>
          </h1>

          <p className={styles.body}>
            MealPlanner is a simple, no-nonsense tool for planning your week,
            discovering recipes, and building your shopping list — all in one place.
            We're opening up soon. Get early access.
          </p>
        </div>

        <div className={styles.featureList}>
          {[
            ["📅", "Weekly meal planner"],
            ["📖", "Thousands of recipes"],
            ["🛒", "Smart shopping list"],
            ["🔒", "Private by default"],
          ].map(([icon, label]) => (
            <div key={label} className={styles.feature}>
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className={styles.corner} />
      </div>

      {/* RIGHT */}
      <div className={styles.right}>
        <div className={styles.formWrap}>
          {status === "success" ? (
            <div className={styles.success}>
              <div className={styles.successIcon}>✓</div>

              <p className={styles.eyebrowCenter}>
                <span className={styles.lineSmall} />
                You're in
                <span className={styles.lineSmall} />
              </p>

              <h2 className={styles.successTitle}>Thanks for joining.</h2>

              <p className={styles.successBody}>
                We'll email you at <span className={styles.email}>{email}</span> when
                we're ready to let people in. Sit tight — it won't be long.
              </p>

              <div className={styles.successBox}>
                {[
                  "Early access before public launch",
                  "No spam, ever",
                  "One email when we're live",
                ].map((t) => (
                  <div key={t} className={styles.successItem}>
                    <span className={styles.dot} />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <p className={styles.eyebrow}>
                <span className={styles.lineSmall} />
                Early access
              </p>

              <h2 className={styles.formTitle}>Join the waitlist.</h2>

              <p className={styles.formBody}>
                Drop your email and we'll let you know the moment we open up.
              </p>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div>
                  <label className={styles.label}>Email address</label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    placeholder="you@example.com"
                    required
                    className={styles.input}
                  />
                </div>

                {status === "error" && (
                  <p className={styles.error}>{message}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading" || !email.trim()}
                  className={styles.button}
                >
                  {status === "loading" ? "Joining…" : "Notify me →"}
                </button>
              </form>

              <p className={styles.disclaimer}>
                No spam. No nonsense. Unsubscribe anytime.
              </p>

              <div className={styles.signinBox}>
                <p className={styles.signinText}>Already have an account?</p>
                <Link href="/login" className={styles.signinLink}>
                  Sign in →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
