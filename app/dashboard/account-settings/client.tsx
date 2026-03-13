"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

interface Props {
  initialName: string;
  initialEmail: string;
}

type Section = "name" | "email" | "password" | "delete";

interface FieldState {
  loading: boolean;
  success: string;
  error: string;
}

const idle = (): FieldState => ({ loading: false, success: "", error: "" });

export default function AccountClient({ initialName, initialEmail }: Props) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);

  const [nameVal, setNameVal] = useState(initialName);
  const [emailVal, setEmailVal] = useState(initialEmail);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [deletePw, setDeletePw] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const [states, setStates] = useState<Record<Section, FieldState>>({
    name: idle(), email: idle(), password: idle(), delete: idle(),
  });

  const [openSection, setOpenSection] = useState<Section | null>("name");

  const setState = (section: Section, patch: Partial<FieldState>) =>
    setStates((s) => ({ ...s, [section]: { ...s[section], ...patch } }));

  async function submit(section: Section, body: object) {
    setState(section, { loading: true, success: "", error: "" });
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: section, ...body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState(section, { loading: false, error: data.error });
      } else {
        setState(section, { loading: false, success: data.message });
        if (section === "name") setName(nameVal);
        if (section === "email") setEmail(emailVal);
        if (section === "password") { setCurrentPw(""); setNewPw(""); setConfirmPw(""); }
      }
    } catch {
      setState(section, { loading: false, error: "Something went wrong." });
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "DELETE") {
      setState("delete", { error: 'Type DELETE to confirm', loading: false, success: "" });
      return;
    }
    setState("delete", { loading: true, success: "", error: "" });
    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePw }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState("delete", { loading: false, error: data.error, success: "" });
      } else {
        await signOut({ callbackUrl: "/" });
      }
    } catch {
      setState("delete", { loading: false, error: "Something went wrong.", success: "" });
    }
  }

  const sections: { id: Section; label: string; danger?: boolean }[] = [
    { id: "name", label: "Change name" },
    { id: "email", label: "Change email" },
    { id: "password", label: "Change password" },
    { id: "delete", label: "Delete account", danger: true },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e4d8] font-mono">
      <div className="max-w-2xl mx-auto px-8 py-12">

        {/* Header */}
        <div className="mb-12 pb-10 border-b border-[#1a1a1a]">
          <p className="text-[0.58rem] uppercase tracking-[.25em] text-[#d4af37] mb-2 flex items-center gap-3">
            <span className="w-4 h-px bg-[#d4af37] inline-block" />
            Account Settings
          </p>
          <h1 className="font-serif italic text-4xl text-[#f0ece0] leading-none mt-2">
            {name}
          </h1>
          <p className="text-[0.65rem] text-[#3a3a3a] tracking-widest mt-2">{email}</p>
        </div>

        {/* Accordion sections */}
        <div className="space-y-px border border-[#1a1a1a]">
          {sections.map(({ id, label, danger }) => {
            const open = openSection === id;
            const st = states[id];
            return (
              <div key={id} className={`border-b border-[#1a1a1a] last:border-b-0 ${danger ? "bg-[#0d0808]" : "bg-[#0a0a0a]"}`}>
                {/* Accordion header */}
                <button
                  onClick={() => setOpenSection(open ? null : id)}
                  className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors cursor-pointer ${
                    open ? "bg-[#0e0e0e]" : "hover:bg-[#0d0d0d]"
                  }`}
                >
                  <span className={`text-[0.68rem] uppercase tracking-[.15em] font-medium ${danger ? "text-[#c0392b]" : "text-[#e8e4d8]"}`}>
                    {label}
                  </span>
                  <span className={`text-[#3a3a3a] transition-transform duration-200 text-sm ${open ? "rotate-180" : ""}`}>
                    ↓
                  </span>
                </button>

                {/* Accordion body */}
                {open && (
                  <div className="px-6 pb-6 pt-2 border-t border-[#1a1a1a]">

                    {/* NAME */}
                    {id === "name" && (
                      <div className="space-y-4 mt-4">
                        <div>
                          <label className="block text-[0.58rem] uppercase tracking-[.15em] text-[#444] mb-1.5">Full name</label>
                          <input
                            type="text"
                            value={nameVal}
                            onChange={(e) => setNameVal(e.target.value)}
                            className="w-full bg-[#111] border border-[#1e1e1e] text-[#e8e4d8] text-sm px-3 py-2.5 outline-none focus:border-[#d4af37] transition-colors font-mono"
                          />
                        </div>
                        {st.error && <p className="text-[0.65rem] text-[#c0392b]">{st.error}</p>}
                        {st.success && <p className="text-[0.65rem] text-green-400">{st.success}</p>}
                        <button
                          onClick={() => submit("name", { name: nameVal })}
                          disabled={st.loading || !nameVal.trim() || nameVal === name}
                          className="bg-[#d4af37] text-[#0a0a0a] text-[0.62rem] uppercase tracking-[.15em] px-6 py-2.5 font-medium hover:bg-[#e8c84a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {st.loading ? "Saving…" : "Save name"}
                        </button>
                      </div>
                    )}

                    {/* EMAIL */}
                    {id === "email" && (
                      <div className="space-y-4 mt-4">
                        <div>
                          <label className="block text-[0.58rem] uppercase tracking-[.15em] text-[#444] mb-1.5">Email address</label>
                          <input
                            type="email"
                            value={emailVal}
                            onChange={(e) => setEmailVal(e.target.value)}
                            className="w-full bg-[#111] border border-[#1e1e1e] text-[#e8e4d8] text-sm px-3 py-2.5 outline-none focus:border-[#d4af37] transition-colors font-mono"
                          />
                        </div>
                        {st.error && <p className="text-[0.65rem] text-[#c0392b]">{st.error}</p>}
                        {st.success && <p className="text-[0.65rem] text-green-400">{st.success}</p>}
                        <button
                          onClick={() => submit("email", { email: emailVal })}
                          disabled={st.loading || !emailVal.trim() || emailVal === email}
                          className="bg-[#d4af37] text-[#0a0a0a] text-[0.62rem] uppercase tracking-[.15em] px-6 py-2.5 font-medium hover:bg-[#e8c84a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {st.loading ? "Saving…" : "Save email"}
                        </button>
                      </div>
                    )}

                    {/* PASSWORD */}
                    {id === "password" && (
                      <div className="space-y-4 mt-4">
                        {[
                          { label: "Current password", val: currentPw, set: setCurrentPw },
                          { label: "New password", val: newPw, set: setNewPw },
                          { label: "Confirm new password", val: confirmPw, set: setConfirmPw },
                        ].map(({ label, val, set }) => (
                          <div key={label}>
                            <label className="block text-[0.58rem] uppercase tracking-[.15em] text-[#444] mb-1.5">{label}</label>
                            <input
                              type="password"
                              value={val}
                              onChange={(e) => set(e.target.value)}
                              className="w-full bg-[#111] border border-[#1e1e1e] text-[#e8e4d8] text-sm px-3 py-2.5 outline-none focus:border-[#d4af37] transition-colors font-mono"
                            />
                          </div>
                        ))}
                        {st.error && <p className="text-[0.65rem] text-[#c0392b]">{st.error}</p>}
                        {st.success && <p className="text-[0.65rem] text-green-400">{st.success} — please sign in again.</p>}
                        <button
                          onClick={() => {
                            if (newPw !== confirmPw) {
                              setState("password", { error: "Passwords don't match", loading: false, success: "" });
                              return;
                            }
                            submit("password", { currentPassword: currentPw, newPassword: newPw });
                          }}
                          disabled={st.loading || !currentPw || !newPw || !confirmPw}
                          className="bg-[#d4af37] text-[#0a0a0a] text-[0.62rem] uppercase tracking-[.15em] px-6 py-2.5 font-medium hover:bg-[#e8c84a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {st.loading ? "Updating…" : "Update password"}
                        </button>
                      </div>
                    )}

                    {/* DELETE */}
                    {id === "delete" && (
                      <div className="space-y-4 mt-4">
                        <p className="text-[0.7rem] text-[#555] leading-relaxed">
                          This permanently deletes your account, weekly plans, and shopping list. This cannot be undone.
                        </p>
                        <div>
                          <label className="block text-[0.58rem] uppercase tracking-[.15em] text-[#444] mb-1.5">Your password</label>
                          <input
                            type="password"
                            placeholder="Enter your password"
                            value={deletePw}
                            onChange={(e) => setDeletePw(e.target.value)}
                            className="w-full bg-[#111] border border-[#1e1e1e] text-[#e8e4d8] text-sm px-3 py-2.5 outline-none focus:border-[#c0392b] transition-colors font-mono placeholder:text-[#252525]"
                          />
                        </div>
                        <div>
                          <label className="block text-[0.58rem] uppercase tracking-[.15em] text-[#444] mb-1.5">
                            Type <span className="text-[#c0392b]">DELETE</span> to confirm
                          </label>
                          <input
                            type="text"
                            placeholder="DELETE"
                            value={deleteConfirm}
                            onChange={(e) => setDeleteConfirm(e.target.value)}
                            className="w-full bg-[#111] border border-[#1e1e1e] text-[#e8e4d8] text-sm px-3 py-2.5 outline-none focus:border-[#c0392b] transition-colors font-mono placeholder:text-[#252525]"
                          />
                        </div>
                        {st.error && <p className="text-[0.65rem] text-[#c0392b]">{st.error}</p>}
                        <button
                          onClick={handleDeleteAccount}
                          disabled={st.loading || !deletePw || deleteConfirm !== "DELETE"}
                          className="bg-[#c0392b] text-white text-[0.62rem] uppercase tracking-[.15em] px-6 py-2.5 font-medium hover:bg-[#e74c3c] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {st.loading ? "Deleting…" : "Permanently delete account"}
                        </button>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}