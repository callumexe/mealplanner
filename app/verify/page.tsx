"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import styles from "@/styles/verify.css";

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

    await signIn("credentials", {
      email,
      loginToken,
      callbackUrl: "/dashboard",
    });
  }

  const code = digits.join("");

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>

        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.brandBox}>M</div>
          <span className={styles.brandText}>Meal Planner</span>
        </div>

        {/* Header */}
        <p className={styles.eyebrow}>
          <span className={styles.line} />
          Verify your email
        </p>

        <h1 className={styles.title}>Check your inbox.</h1>

        <p className={styles.body}>
          We sent a 6-digit code to{" "}
          <span className={styles.email}>{email || "your email"}</span>.
          Enter it below to verify your account.
        </p>

        {/* Code inputs */}
        <div className={styles.codeGrid} onPaste={handlePaste}>
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
              className={styles.codeInput}
            />
          ))}
        </div>

        {/* Error */}
        {status === "error" && (
          <p className={styles.error}>{error}</p>
        )}

        {/* Submit */}
        <button
          onClick={handleVerify}
          disabled={code.length < 6 || status === "loading" || status === "success"}
          className={styles.button}
        >
          {status === "loading"
            ? "Verifying…"
            : status === "success"
            ? "Verified — signing in…"
            : "Verify →"}
        </button>

        <p className={styles.footerNote}>
          Didn&apos;t receive it? Check your spam folder. The code expires in 15 minutes.
        </p>

      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.page}>
          <div className={styles.spinner} />
        </div>
      }
    >
      <VerifyForm />
    </Suspense>
  );
}
