"use client";

import { useEffect, useState, useCallback } from "react";

const CATEGORIES = ["Produce", "Meat & Fish", "Dairy", "Bakery", "Pantry", "Frozen", "Drinks", "Other"];

const UNITS = ["", "g", "kg", "ml", "l", "tsp", "tbsp", "cup", "oz", "lb", "piece", "pinch", "handful", "slice", "can", "bag", "bunch"];

interface Item {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  checked: boolean;
  category: string;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const emptyForm = (): Omit<Item, "id" | "checked"> => ({
  name: "", quantity: "", unit: "", category: "Other",
});

export default function ShoppingClient() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [editId, setEditId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "checked">("all");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/shopping");
      const data = await res.json();
      setItems(data.items ?? []);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  const saveList = async (updated: Item[]) => {
    setSaving(true);
    await fetch("/api/shopping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: updated }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const setAndSave = (updated: Item[]) => {
    setItems(updated);
    saveList(updated);
  };

  const addItem = () => {
    if (!form.name.trim()) return;
    const updated = [...items, { ...form, id: uid(), checked: false }];
    setAndSave(updated);
    setForm(emptyForm());
  };

  const startEdit = (item: Item) => {
    setEditId(item.id);
    setForm({ name: item.name, quantity: item.quantity, unit: item.unit, category: item.category });
  };

  const saveEdit = () => {
    if (!form.name.trim()) return;
    const updated = items.map((i) => i.id === editId ? { ...i, ...form } : i);
    setAndSave(updated);
    setEditId(null);
    setForm(emptyForm());
  };

  const cancelEdit = () => { setEditId(null); setForm(emptyForm()); };

  const toggleCheck = (id: string) => {
    const updated = items.map((i) => i.id === id ? { ...i, checked: !i.checked } : i);
    setAndSave(updated);
  };

  const deleteItem = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    setAndSave(updated);
  };

  const clearChecked = () => {
    const updated = items.filter((i) => !i.checked);
    setAndSave(updated);
  };

  // Derived
  const checkedCount = items.filter((i) => i.checked).length;
  const usedCategories = ["All", ...CATEGORIES.filter((c) => items.some((i) => i.category === c))];

  const visible = items.filter((i) => {
    const matchFilter = filter === "all" || (filter === "pending" && !i.checked) || (filter === "checked" && i.checked);
    const matchCat = activeCategory === "All" || i.category === activeCategory;
    return matchFilter && matchCat;
  });

  const grouped = usedCategories
    .filter((c) => c !== "All")
    .reduce<Record<string, Item[]>>((acc, cat) => {
      const catItems = visible.filter((i) => i.category === cat);
      if (catItems.length) acc[cat] = catItems;
      return acc;
    }, {});

  // If "All" is active, group by category; otherwise flat list
  const showGrouped = activeCategory === "All";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e4d8] font-mono">

      {/* HEADER */}
      <div className="px-8 pt-10 pb-6 border-b border-[#1a1a1a]">
        <p className="text-[0.58rem] uppercase tracking-[.25em] text-[#d4af37] mb-2 flex items-center gap-3">
          <span className="w-4 h-px bg-[#d4af37] inline-block" />
          Shopping List
        </p>
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-serif italic text-4xl text-[#f0ece0] leading-none">
              {items.length === 0 ? "Nothing here yet." : `${items.length - checkedCount} item${items.length - checkedCount !== 1 ? "s" : ""} remaining`}
            </h1>
            <p className="text-[0.6rem] text-[#3a3a3a] tracking-widest mt-2">
              {checkedCount > 0 ? `${checkedCount} checked off` : "Add items below to get started"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {saving && <span className="text-[0.58rem] uppercase tracking-widest text-[#3a3a3a]">Saving…</span>}
            {saved && <span className="text-[0.58rem] uppercase tracking-widest text-green-500">Saved ✓</span>}
            {checkedCount > 0 && (
              <button
                onClick={clearChecked}
                className="text-[0.6rem] uppercase tracking-[.15em] text-[#c0392b] border border-[#c0392b]/30 px-4 py-1.5 hover:bg-[#c0392b]/10 transition-colors cursor-pointer"
              >
                Clear checked ({checkedCount})
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">

        {/* SIDEBAR */}
        <div className="w-full lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r border-[#1a1a1a] p-6 flex flex-col gap-6">

          {/* Add / Edit form */}
          <div>
            <p className="text-[0.58rem] uppercase tracking-[.2em] text-[#d4af37] mb-4 flex items-center gap-2">
              <span className="w-3 h-px bg-[#d4af37] inline-block" />
              {editId ? "Edit item" : "Add item"}
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[0.58rem] uppercase tracking-[.15em] text-[#444] mb-1">Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Olive oil"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && (editId ? saveEdit() : addItem())}
                  className="w-full bg-[#111] border border-[#1e1e1e] text-[#e8e4d8] text-[0.78rem] px-3 py-2 outline-none focus:border-[#d4af37] transition-colors font-mono placeholder:text-[#252525]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[0.58rem] uppercase tracking-[.15em] text-[#444] mb-1">Qty</label>
                  <input
                    type="text"
                    placeholder="2"
                    value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                    className="w-full bg-[#111] border border-[#1e1e1e] text-[#e8e4d8] text-[0.78rem] px-3 py-2 outline-none focus:border-[#d4af37] transition-colors font-mono placeholder:text-[#252525]"
                  />
                </div>
                <div>
                  <label className="block text-[0.58rem] uppercase tracking-[.15em] text-[#444] mb-1">Unit</label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                    className="w-full bg-[#111] border border-[#1e1e1e] text-[#e8e4d8] text-[0.78rem] px-3 py-2 outline-none focus:border-[#d4af37] transition-colors font-mono cursor-pointer"
                  >
                    {UNITS.map((u) => <option key={u} value={u}>{u || "—"}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[0.58rem] uppercase tracking-[.15em] text-[#444] mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full bg-[#111] border border-[#1e1e1e] text-[#e8e4d8] text-[0.78rem] px-3 py-2 outline-none focus:border-[#d4af37] transition-colors font-mono cursor-pointer"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex gap-2 pt-1">
                {editId ? (
                  <>
                    <button
                      onClick={saveEdit}
                      disabled={!form.name.trim()}
                      className="flex-1 bg-[#d4af37] text-[#0a0a0a] text-[0.62rem] uppercase tracking-[.15em] py-2 font-medium hover:bg-[#e8c84a] transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-2 border border-[#1e1e1e] text-[#555] text-[0.62rem] uppercase tracking-[.15em] hover:border-[#3a3a3a] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={addItem}
                    disabled={!form.name.trim()}
                    className="w-full bg-[#d4af37] text-[#0a0a0a] text-[0.62rem] uppercase tracking-[.15em] py-2 font-medium hover:bg-[#e8c84a] transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    + Add to list
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div>
            <p className="text-[0.55rem] uppercase tracking-[.2em] text-[#2a2a2a] mb-3">Filter</p>
            <div className="flex flex-col gap-1">
              {(["all", "pending", "checked"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-left text-[0.62rem] uppercase tracking-[.12em] px-3 py-1.5 transition-colors cursor-pointer ${
                    filter === f ? "text-[#d4af37] bg-[#d4af37]/5 border-l border-[#d4af37]" : "text-[#3a3a3a] hover:text-[#555] border-l border-transparent"
                  }`}
                >
                  {f === "all" ? "All items" : f === "pending" ? "Still needed" : "Checked off"}
                </button>
              ))}
            </div>
          </div>

          {/* Category filter */}
          {usedCategories.length > 1 && (
            <div>
              <p className="text-[0.55rem] uppercase tracking-[.2em] text-[#2a2a2a] mb-3">Category</p>
              <div className="flex flex-col gap-1">
                {usedCategories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveCategory(c)}
                    className={`text-left text-[0.62rem] uppercase tracking-[.12em] px-3 py-1.5 transition-colors cursor-pointer ${
                      activeCategory === c ? "text-[#d4af37] bg-[#d4af37]/5 border-l border-[#d4af37]" : "text-[#3a3a3a] hover:text-[#555] border-l border-transparent"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* LIST */}
        <div className="flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-32 text-[0.62rem] uppercase tracking-widest text-[#2a2a2a]">
              Loading…
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
              <p className="font-serif italic text-2xl text-[#1e1e1e]">Nothing here.</p>
              <p className="text-[0.62rem] uppercase tracking-widest text-[#2a2a2a]">
                {items.length === 0 ? "Add your first item on the left." : "Try a different filter."}
              </p>
            </div>
          ) : showGrouped ? (
            <div className="space-y-8">
              {Object.entries(grouped).map(([cat, catItems]) => (
                <div key={cat}>
                  <p className="text-[0.58rem] uppercase tracking-[.2em] text-[#d4af37] mb-3 flex items-center gap-3">
                    <span className="w-3 h-px bg-[#d4af37] inline-block" />
                    {cat}
                    <span className="text-[#2a2a2a]">({catItems.length})</span>
                  </p>
                  <div className="border border-[#1a1a1a] divide-y divide-[#1a1a1a]">
                    {catItems.map((item) => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        isEditing={editId === item.id}
                        onCheck={() => toggleCheck(item.id)}
                        onEdit={() => startEdit(item)}
                        onDelete={() => deleteItem(item.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-[#1a1a1a] divide-y divide-[#1a1a1a]">
              {visible.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  isEditing={editId === item.id}
                  onCheck={() => toggleCheck(item.id)}
                  onEdit={() => startEdit(item)}
                  onDelete={() => deleteItem(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ItemRow({
  item, isEditing, onCheck, onEdit, onDelete,
}: {
  item: Item;
  isEditing: boolean;
  onCheck: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={`group flex items-center gap-4 px-4 py-3 transition-colors ${item.checked ? "bg-[#0d0d0d]" : "hover:bg-[#0d0d0d]"} ${isEditing ? "border-l-2 border-[#d4af37]" : "border-l-2 border-transparent"}`}>
      {/* Checkbox */}
      <button
        onClick={onCheck}
        className={`w-4 h-4 shrink-0 border transition-colors cursor-pointer ${item.checked ? "bg-[#d4af37] border-[#d4af37]" : "border-[#2a2a2a] hover:border-[#d4af37]"}`}
      >
        {item.checked && (
          <svg viewBox="0 0 10 10" className="w-full h-full p-0.5">
            <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="#0a0a0a" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <span className={`text-[0.78rem] transition-colors ${item.checked ? "line-through text-[#2a2a2a]" : "text-[#e8e4d8]"}`}>
          {item.name}
        </span>
      </div>

      {/* Qty + unit */}
      {(item.quantity || item.unit) && (
        <span className={`text-[0.65rem] shrink-0 font-mono ${item.checked ? "text-[#2a2a2a]" : "text-[#555]"}`}>
          {item.quantity}{item.unit ? ` ${item.unit}` : ""}
        </span>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={onEdit}
          className="text-[0.58rem] uppercase tracking-[.1em] text-[#3a3a3a] hover:text-[#d4af37] transition-colors cursor-pointer"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="text-[0.58rem] text-[#2a2a2a] hover:text-[#c0392b] transition-colors cursor-pointer"
        >
          ×
        </button>
      </div>
    </div>
  );
}