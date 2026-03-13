"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type Tab = "login" | "register";
type Field = { name: string; email: string; password: string; confirm: string };

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");
  const [fields, setFields] = useState<Field>({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof Field) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }));

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email: fields.email,
      password: fields.password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) return setError("Invalid email or password.");
    router.push("/dashboard");
  }

// In your register submit handler on app/auth/page.tsx
// Replace the existing handleRegister function with this:

// Replace handleRegister in app/auth/page.tsx with this:

async function handleRegister(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);
  setError("");

  if (fields.password !== fields.confirm) {
    setError("Passwords don't match.");
    setLoading(false);
    return;
  }

  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: fields.name,
      email: fields.email,
      password: fields.password,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    setError(data.error);
    setLoading(false);
    return;
  }

  // Redirect with email + token only — no password in URL
  router.push(
    `/verify?email=${encodeURIComponent(fields.email)}&token=${encodeURIComponent(data.token)}`
  );
}

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-root {
          min-height: 100vh;
          background: #0a0a0a;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'DM Mono', monospace;
        }

        /* Left panel */
        .auth-left {
          padding: 3rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-right: 1px solid #1e1e1e;
          position: relative;
          overflow: hidden;
        }
        .auth-left::before {
          content: '';
          position: absolute;
          top: -120px; left: -120px;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .brand-mark {
          width: 36px; height: 36px;
          border: 1.5px solid #d4af37;
          display: grid;
          place-items: center;
          font-size: 1rem;
          color: #d4af37;
          font-family: 'DM Serif Display', serif;
          font-style: italic;
        }
        .brand-name {
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #555;
        }
        .auth-headline {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(2.5rem, 4vw, 3.5rem);
          line-height: 1.1;
          color: #f0ece0;
          max-width: 360px;
        }
        .auth-headline em {
          color: #d4af37;
          font-style: italic;
        }
        .auth-sub {
          font-size: 0.72rem;
          color: #3a3a3a;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-top: 1.5rem;
        }
        .corner-deco {
          position: absolute;
          bottom: 3rem; right: 3rem;
          width: 80px; height: 80px;
          border-right: 1px solid #222;
          border-bottom: 1px solid #222;
        }

        /* Right panel */
        .auth-right {
          padding: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .auth-card {
          width: 100%;
          max-width: 380px;
        }

        /* Tabs */
        .tabs {
          display: flex;
          border-bottom: 1px solid #1e1e1e;
          margin-bottom: 2.5rem;
        }
        .tab-btn {
          flex: 1;
          background: none;
          border: none;
          padding: 0.75rem 0;
          font-family: 'DM Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          color: #3a3a3a;
          position: relative;
          transition: color 0.2s;
        }
        .tab-btn.active { color: #d4af37; }
        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px; left: 0; right: 0;
          height: 1px;
          background: #d4af37;
        }

        /* Form */
        form { display: flex; flex-direction: column; gap: 1.25rem; }

        .field { display: flex; flex-direction: column; gap: 0.4rem; }
        .field label {
          font-size: 0.65rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #444;
        }
        .field input {
          background: #111;
          border: 1px solid #1e1e1e;
          color: #e8e4d8;
          font-family: 'DM Mono', monospace;
          font-size: 0.85rem;
          padding: 0.75rem 1rem;
          outline: none;
          transition: border-color 0.2s;
          -webkit-appearance: none;
        }
        .field input:focus { border-color: #d4af37; }
        .field input::placeholder { color: #2a2a2a; }

        .submit-btn {
          margin-top: 0.5rem;
          background: #d4af37;
          border: none;
          color: #0a0a0a;
          font-family: 'DM Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 1rem;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s, opacity 0.2s;
          position: relative;
          overflow: hidden;
        }
        .submit-btn:hover { background: #e8c84a; }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .error-msg {
          font-size: 0.7rem;
          color: #c0392b;
          letter-spacing: 0.05em;
          padding: 0.6rem 0.75rem;
          background: rgba(192,57,43,0.08);
          border-left: 2px solid #c0392b;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 0.25rem 0;
        }
        .divider-line { flex: 1; height: 1px; background: #1a1a1a; }
        .divider-text { font-size: 0.6rem; color: #2a2a2a; letter-spacing: 0.1em; }

        /* Spinner */
        .spinner {
          display: inline-block;
          width: 10px; height: 10px;
          border: 1.5px solid #0a0a0a;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          margin-right: 0.5rem;
          vertical-align: middle;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Fade-in animation */
        .fade-in {
          animation: fadeIn 0.25s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 700px) {
          .auth-root { grid-template-columns: 1fr; }
          .auth-left { display: none; }
        }
      `}</style>

      <div className="auth-root">
        {/* Left decorative panel */}
        <div className="auth-left">
          <div>
            <h1 className="auth-headline">
              Planning meals,<br /><em>done with ease</em>
            </h1>
            <p className="auth-sub">Still in early access...</p>
          </div>
          <div className="corner-deco" />
        </div>

        {/* Right form panel */}
        <div className="auth-right">
          <div className="auth-card">
            <div className="tabs">
              <button className={`tab-btn ${tab === "login" ? "active" : ""}`} onClick={() => { setTab("login"); setError(""); }}>
                Sign In
              </button>
              <button className={`tab-btn ${tab === "register" ? "active" : ""}`} onClick={() => { setTab("register"); setError(""); }}>
                Register
              </button>
            </div>

            {tab === "login" && (
              <form key="login" className="fade-in" onSubmit={handleLogin}>
                <div className="field">
                  <label>Email</label>
                  <input type="email" placeholder="you@example.com" value={fields.email} onChange={set("email")} required />
                </div>
                <div className="field">
                  <label>Password</label>
                  <input type="password" placeholder="••••••••" value={fields.password} onChange={set("password")} required />
                </div>
                {error && <div className="error-msg">{error}</div>}
                <button className="submit-btn" type="submit" disabled={loading}>
                  {loading && <span className="spinner" />}
                  {loading ? "Signing in…" : "Sign In →"}
                </button>
              </form>
            )}

            {tab === "register" && (
              <form key="register" className="fade-in" onSubmit={handleRegister}>
                <div className="field">
                  <label>Name</label>
                  <input type="text" placeholder="Jane Smith" value={fields.name} onChange={set("name")} required />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input type="email" placeholder="you@example.com" value={fields.email} onChange={set("email")} required />
                </div>
                <div className="divider">
                  <div className="divider-line" />
                  <span className="divider-text">password</span>
                  <div className="divider-line" />
                </div>
                <div className="field">
                  <label>Password</label>
                  <input type="password" placeholder="Min. 8 characters" value={fields.password} onChange={set("password")} required minLength={8} />
                </div>
                <div className="field">
                  <label>Confirm Password</label>
                  <input type="password" placeholder="Repeat password" value={fields.confirm} onChange={set("confirm")} required />
                </div>
                {error && <div className="error-msg">{error}</div>}
                <button className="submit-btn" type="submit" disabled={loading}>
                  {loading && <span className="spinner" />}
                  {loading ? "Creating account…" : "Create Account →"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
