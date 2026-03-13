"use client";

import { useEffect, useState, useCallback } from "react";

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  verified: boolean;
  createdAt: string;
}

interface ChartPoint {
  _id: string;
  count: number;
}

function BarChart({ data }: { data: ChartPoint[] }) {
  const filled: ChartPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const found = data.find((p) => p._id === key);
    filled.push({ _id: key, count: found?.count ?? 0 });
  }
  const max = Math.max(...filled.map((p) => p.count), 1);

  return (
    <div className="flex items-end gap-px h-20 w-full">
      {filled.map((p) => (
        <div key={p._id} className="flex-1 flex flex-col items-center justify-end group relative">
          <div
            className="w-full bg-[#d4af37]/20 group-hover:bg-[#d4af37] transition-colors"
            style={{ height: `${(p.count / max) * 100}%`, minHeight: p.count > 0 ? "2px" : "0" }}
          />
          {p.count > 0 && (
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-[#2a2a2a] px-2 py-1 text-[0.5rem] text-[#e8e4d8] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {p._id} · {p.count}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function AdminClient({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [chart, setChart] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.users ?? []);
    setChart(data.signupChart ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const deleteUser = async (id: string) => {
    setActionLoading(id);
    const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      setUsers((u) => u.filter((x) => x._id !== id));
      showToast("User deleted.");
    } else {
      showToast(data.error);
    }
    setActionLoading(null);
    setConfirmDelete(null);
  };

  const toggleRole = async (id: string, current: "user" | "admin") => {
    const newRole = current === "admin" ? "user" : "admin";
    setActionLoading(id);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role: newRole }),
    });
    const data = await res.json();
    if (res.ok) {
      setUsers((u) => u.map((x) => x._id === id ? { ...x, role: newRole } : x));
      showToast(`Role updated to ${newRole}.`);
    } else {
      showToast(data.error);
    }
    setActionLoading(null);
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const adminCount = users.filter((u) => u.role === "admin").length;
  const verifiedCount = users.filter((u) => u.verified).length;
  const newThisMonth = chart.reduce((a, c) => a + c.count, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e4d8] font-mono">

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#1a1a1a] border border-[#d4af37]/30 text-[#d4af37] text-[0.65rem] uppercase tracking-[.15em] px-4 py-2.5">
          {toast}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-8 py-12">

        {/* Header */}
        <div className="mb-12 pb-8 border-b border-[#1a1a1a]">
          <p className="text-[0.58rem] uppercase tracking-[.25em] text-[#d4af37] mb-2 flex items-center gap-3">
            <span className="w-4 h-px bg-[#d4af37] inline-block" />
            Admin
          </p>
          <h1 className="font-serif italic text-4xl text-[#f0ece0] leading-none mt-2">
            Control Panel
          </h1>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-px bg-[#1a1a1a] border border-[#1a1a1a] mb-10">
          {[
            { label: "Total Users", value: users.length },
            { label: "Verified", value: verifiedCount },
            { label: "Admins", value: adminCount },
            { label: "New (30d)", value: newThisMonth },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#0a0a0a] px-6 py-5">
              <p className="text-[0.55rem] uppercase tracking-[.2em] text-[#3a3a3a] mb-1">{label}</p>
              <p className="font-serif italic text-3xl text-[#d4af37] leading-none">{value}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="border border-[#1a1a1a] p-6 mb-10">
          <p className="text-[0.58rem] uppercase tracking-[.2em] text-[#d4af37] mb-4 flex items-center gap-3">
            <span className="w-3 h-px bg-[#d4af37] inline-block" />
            Signups — last 30 days
          </p>
          {chart.length === 0 && !loading ? (
            <div className="flex items-center justify-center h-20 text-[0.6rem] text-[#2a2a2a] uppercase tracking-widest">
              No data yet
            </div>
          ) : (
            <BarChart data={chart} />
          )}
          <div className="flex justify-between mt-2">
            <span className="text-[0.52rem] text-[#2a2a2a]">
              {new Date(Date.now() - 29 * 86400000).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </span>
            <span className="text-[0.52rem] text-[#2a2a2a]">Today</span>
          </div>
        </div>

        {/* User table */}
        <div>
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <p className="text-[0.58rem] uppercase tracking-[.2em] text-[#d4af37] flex items-center gap-3">
              <span className="w-3 h-px bg-[#d4af37] inline-block" />
              Users ({filtered.length})
            </p>
            <div className="flex items-center gap-2">
              {(["all", "admin", "user"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setRoleFilter(f)}
                  className={`text-[0.58rem] uppercase tracking-[.12em] px-3 py-1.5 border transition-colors cursor-pointer ${
                    roleFilter === f
                      ? "border-[#d4af37] text-[#d4af37] bg-[#d4af37]/5"
                      : "border-[#1e1e1e] text-[#3a3a3a] hover:border-[#2a2a2a]"
                  }`}
                >
                  {f}
                </button>
              ))}
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#111] border border-[#1e1e1e] text-[#e8e4d8] text-[0.7rem] px-3 py-1.5 outline-none focus:border-[#d4af37] transition-colors font-mono placeholder:text-[#252525] w-44"
              />
            </div>
          </div>

          <div className="border border-[#1a1a1a] divide-y divide-[#1a1a1a]">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_1fr_90px_90px_110px_120px] gap-4 px-4 py-2 bg-[#0d0d0d]">
              {["Name", "Email", "Role", "Verified", "Joined", "Actions"].map((h) => (
                <span key={h} className="text-[0.55rem] uppercase tracking-[.15em] text-[#3a3a3a]">{h}</span>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-5 h-5 border border-[#d4af37] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-[0.65rem] text-[#2a2a2a]">No users found.</div>
            ) : filtered.map((u) => (
              <div
                key={u._id}
                className={`grid grid-cols-[1fr_1fr_90px_90px_110px_120px] gap-4 px-4 py-3 items-center transition-colors ${
                  u._id === currentUserId ? "bg-[#d4af37]/3" : "hover:bg-[#0d0d0d]"
                }`}
              >
                {/* Name */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 bg-[#1a1a1a] border border-[#2a2a2a] grid place-items-center text-[0.5rem] text-[#d4af37] font-serif shrink-0">
                    {u.name[0]?.toUpperCase()}
                  </div>
                  <span className="text-[0.72rem] truncate">
                    {u.name}
                    {u._id === currentUserId && (
                      <span className="ml-1 text-[0.5rem] text-[#d4af37]/50 uppercase tracking-widest">you</span>
                    )}
                  </span>
                </div>

                {/* Email */}
                <span className="text-[0.65rem] text-[#555] truncate">{u.email}</span>

                {/* Role */}
                <span className={`text-[0.58rem] uppercase tracking-[.1em] px-2 py-0.5 border w-fit ${
                  u.role === "admin"
                    ? "text-[#d4af37] border-[#d4af37]/30 bg-[#d4af37]/5"
                    : "text-[#3a3a3a] border-[#1e1e1e]"
                }`}>
                  {u.role}
                </span>

                {/* Verified */}
                <span className={`text-[0.58rem] uppercase tracking-[.1em] ${
                  u.verified ? "text-green-600" : "text-[#c0392b]"
                }`}>
                  {u.verified ? "Yes" : "No"}
                </span>

                {/* Joined */}
                <span className="text-[0.62rem] text-[#3a3a3a]">
                  {new Date(u.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>

                {/* Actions */}
                {u._id === currentUserId ? (
                  <span className="text-[0.55rem] text-[#2a2a2a]">—</span>
                ) : confirmDelete === u._id ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteUser(u._id)}
                      disabled={actionLoading === u._id}
                      className="text-[0.55rem] uppercase tracking-[.1em] text-white bg-[#c0392b] px-2 py-1 hover:bg-[#e74c3c] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading === u._id ? "…" : "Confirm"}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="text-[0.55rem] uppercase tracking-[.1em] text-[#3a3a3a] hover:text-[#e8e4d8] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleRole(u._id, u.role)}
                      disabled={actionLoading === u._id}
                      className="text-[0.58rem] uppercase tracking-[.1em] text-[#3a3a3a] hover:text-[#d4af37] transition-colors cursor-pointer disabled:opacity-40"
                    >
                      {u.role === "admin" ? "Demote" : "Promote"}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(u._id)}
                      className="text-[0.58rem] uppercase tracking-[.1em] text-[#3a3a3a] hover:text-[#c0392b] transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}