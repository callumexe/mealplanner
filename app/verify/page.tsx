"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

function VerifyForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const loginToken = searchParams.get("token") ?? "";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [error, setError] = useState("");
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      inputs.current[5]?.focus();
    }
  }

  async function handleVerify() {
    const code = digits.join("");
    if (code.length < 6) return;

    setStatus("loading");
    setError("");

    // Step 1: Verify the code
    const res = await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus("error");
      setError(data.error);
      return;
    }

    setStatus("success");

    // Step 2: Sign in using the loginToken (no password needed)
    await signIn("credentials", {
      email,
      loginToken,
      callbackUrl: "/dashboard",
    });
  }

  const code = digits.join("");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e4d8] font-mono flex items-center justify-center px-6">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-8 border border-[#d4af37] grid place-items-center font-serif italic text-[#d4af37] text-sm">
            M
          </div>
          <span className="text-[0.65rem] uppercase tracking-[.2em] text-[#555]">Meal Planner</span>
        </div>

        {/* Header */}
        <p className="text-[0.58rem] uppercase tracking-[.25em] text-[#d4af37] mb-3 flex items-center gap-3">
          <span className="w-4 h-px bg-[#d4af37] inline-block" />
          Verify your email
        </p>
        <h1 className="font-serif italic text-3xl text-[#f0ece0] leading-tight mb-3">
          Check your inbox.
        </h1>
        <p className="text-[0.7rem] text-[#444] leading-relaxed mb-8">
          We sent a 6-digit code to{" "}
          <span className="text-[#e8e4d8]">{email || "your email"}</span>.
          Enter it below to verify your account.
        </p>

        {/* Code inputs */}
        <div className="flex gap-2 mb-6" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-full aspect-square text-center text-xl bg-[#111] border transition-colors outline-none font-mono text-[#d4af37] ${
                d ? "border-[#d4af37]" : "border-[#1e1e1e] focus:border-[#d4af37]"
              }`}
            />
          ))}
        </div>

        {/* Error */}
        {status === "error" && (
          <p className="text-[0.65rem] text-[#c0392b] border-l-2 border-[#c0392b] pl-3 mb-4">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          onClick={handleVerify}
          disabled={code.length < 6 || status === "loading" || status === "success"}
          className="w-full bg-[#d4af37] text-[#0a0a0a] text-[0.65rem] uppercase tracking-[.2em] py-3.5 font-medium hover:bg-[#e8c84a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer mb-6"
        >
          {status === "loading" ? "Verifying…" : status === "success" ? "Verified — signing in…" : "Verify →"}
        </button>

        <p className="text-[0.6rem] text-[#2a2a2a] text-center">
          Didn&apos;t receive it? Check your spam folder. The code expires in 15 minutes.
        </p>

      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border border-[#d4af37] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerifyForm />
    </Suspense>
  );
}
