"use client";

import { useState } from "react";
import Link from "next/link";

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
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; }
      `}</style>

      <div className="min-h-screen bg-[#0a0a0a] text-[#e8e4d8] font-mono grid grid-cols-2">

        {/* ── LEFT ── */}
        <div className="relative flex flex-col justify-between p-12 border-r border-[#1a1a1a] overflow-hidden">
          {/* Glow */}
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)" }} />

          {/* Hero text */}
          <div>
            <p className="text-[0.6rem] uppercase tracking-[.25em] text-[#d4af37] mb-4 flex items-center gap-3">
              <span className="w-5 h-px bg-[#d4af37] inline-block" />
              Coming soon
            </p>
            <h1 className="font-serif italic text-[clamp(2.5rem,4.5vw,4rem)] text-[#f0ece0] leading-[1.05] mb-6">
              Be the first to<br />eat <em className="text-[#d4af37]">smarter.</em>
            </h1>
            <p className="text-[0.78rem] text-[#444] leading-relaxed max-w-sm">
              MealPlanner is a simple, no-nonsense tool for planning your week,
              discovering recipes, and building your shopping list — all in one place.
              We're opening up soon. Get early access.
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-3">
            {[
              ["📅", "Weekly meal planner"],
              ["📖", "Thousands of recipes"],
              ["🛒", "Smart shopping list"],
              ["🔒", "Private by default"],
            ].map(([icon, label]) => (
              <div key={label} className="flex items-center gap-3 text-[0.68rem] text-[#3a3a3a]">
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Corner decoration */}
          <div className="absolute bottom-12 right-12 w-16 h-16 border-r border-b border-[#1e1e1e]" />
        </div>

        {/* ── RIGHT ── */}
        <div className="flex items-center justify-center p-12">
          <div className="w-full max-w-sm">

            {status === "success" ? (
              // ── SUCCESS STATE ──
              <div className="text-center">
                <div className="w-16 h-16 border border-[#d4af37] grid place-items-center mx-auto mb-8 font-serif italic text-[#d4af37] text-2xl">
                  ✓
                </div>
                <p className="text-[0.58rem] uppercase tracking-[.25em] text-[#d4af37] mb-3 flex items-center justify-center gap-3">
                  <span className="w-4 h-px bg-[#d4af37] inline-block" />
                  You're in
                  <span className="w-4 h-px bg-[#d4af37] inline-block" />
                </p>
                <h2 className="font-serif italic text-3xl text-[#f0ece0] leading-tight mb-4">
                  Thanks for joining.
                </h2>
                <p className="text-[0.72rem] text-[#444] leading-relaxed mb-8">
                  We'll email you at <span className="text-[#e8e4d8]">{email}</span> when
                  we're ready to let people in. Sit tight — it won't be long.
                </p>
                <div className="border border-[#1e1e1e] p-4 text-left space-y-2">
                  {[
                    "Early access before public launch",
                    "No spam, ever",
                    "One email when we're live",
                  ].map((t) => (
                    <div key={t} className="flex items-center gap-3 text-[0.65rem] text-[#3a3a3a]">
                      <span className="w-1 h-1 bg-[#d4af37] rounded-full shrink-0" />
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // ── FORM STATE ──
              <>
                <p className="text-[0.58rem] uppercase tracking-[.25em] text-[#d4af37] mb-3 flex items-center gap-3">
                  <span className="w-4 h-px bg-[#d4af37] inline-block" />
                  Early access
                </p>
                <h2 className="font-serif italic text-3xl text-[#f0ece0] leading-tight mb-2">
                  Join the waitlist.
                </h2>
                <p className="text-[0.7rem] text-[#444] leading-relaxed mb-8">
                  Drop your email and we'll let you know the moment we open up.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[0.58rem] uppercase tracking-[.15em] text-[#444] mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === "error") setStatus("idle");
                      }}
                      placeholder="you@example.com"
                      required
                      className="w-full bg-[#111] border border-[#1e1e1e] text-[#e8e4d8] text-sm px-4 py-3 outline-none focus:border-[#d4af37] transition-colors font-mono placeholder:text-[#252525]"
                    />
                  </div>

                  {status === "error" && (
                    <p className="text-[0.65rem] text-[#c0392b] border-l-2 border-[#c0392b] pl-3">
                      {message}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading" || !email.trim()}
                    className="w-full bg-[#d4af37] text-[#0a0a0a] text-[0.65rem] uppercase tracking-[.2em] py-3.5 font-medium hover:bg-[#e8c84a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {status === "loading" ? "Joining…" : "Notify me →"}
                  </button>
                </form>

                <p className="text-[0.58rem] text-[#2a2a2a] mt-5 text-center tracking-wider">
                  No spam. No nonsense. Unsubscribe anytime.
                </p>

                <div className="mt-8 pt-6 border-t border-[#1a1a1a] text-center">
                  <p className="text-[0.6rem] text-[#2a2a2a] mb-2">Already have an account?</p>
                  <Link
                    href="/login"
                    className="text-[0.62rem] uppercase tracking-[.15em] text-[#d4af37] hover:text-[#e8c84a] transition-colors"
                  >
                    Sign in →
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}