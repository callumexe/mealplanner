"use client";

import { useEffect, useState, useCallback } from "react";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_LABELS: Record<string, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed",
  thursday: "Thu", friday: "Fri", saturday: "Sat", sunday: "Sun",
};

interface Meal {
  id: string;
  label: string;
  recipe: string;
  notes: string;
}

interface DayPlan {
  day: string;
  meals: Meal[];
}

function getMonday(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

function weekLabel(weekStart: string): string {
  const start = new Date(weekStart);
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  return `${start.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} — ${end.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
}

function emptyDays(): DayPlan[] {
  return DAYS.map((day) => ({ day, meals: [] }));
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function PlannerClient() {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [days, setDays] = useState<DayPlan[]>(emptyDays());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Modal state
  const [modal, setModal] = useState<{
    open: boolean;
    dayIndex: number;
    mealIndex: number | null;
    meal: Meal;
  }>({ open: false, dayIndex: 0, mealIndex: null, meal: { id: "", label: "", recipe: "", notes: "" } });

  const fetchPlan = useCallback(async (ws: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/planner?weekStart=${ws}`);
      const data = await res.json();
      if (data.days && data.days.length > 0) {
        // Ensure all 7 days present
        const merged = DAYS.map((day) => data.days.find((d: DayPlan) => d.day === day) ?? { day, meals: [] });
        setDays(merged);
      } else {
        setDays(emptyDays());
      }
    } catch {
      setDays(emptyDays());
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPlan(weekStart); }, [weekStart, fetchPlan]);

  const savePlan = async () => {
    setSaving(true);
    await fetch("/api/planner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekStart, days }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const shiftWeek = (delta: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + delta * 7);
    setWeekStart(d.toISOString().split("T")[0]);
  };

  // Meal CRUD
  const openAdd = (dayIndex: number) => {
    setModal({ open: true, dayIndex, mealIndex: null, meal: { id: uid(), label: "", recipe: "", notes: "" } });
  };
  const openEdit = (dayIndex: number, mealIndex: number) => {
    const meal = days[dayIndex].meals[mealIndex];
    setModal({ open: true, dayIndex, mealIndex, meal: { ...meal } });
  };
  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  const saveMeal = () => {
    if (!modal.meal.recipe.trim()) return;
    setDays((prev) => {
      const next = prev.map((d, i) => {
        if (i !== modal.dayIndex) return d;
        const meals = [...d.meals];
        if (modal.mealIndex === null) {
          meals.push(modal.meal);
        } else {
          meals[modal.mealIndex] = modal.meal;
        }
        return { ...d, meals };
      });
      return next;
    });
    closeModal();
  };

  const deleteMeal = (dayIndex: number, mealIndex: number) => {
    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== dayIndex) return d;
        return { ...d, meals: d.meals.filter((_, j) => j !== mealIndex) };
      })
    );
  };

  const totalMeals = days.reduce((acc, d) => acc + d.meals.length, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e4d8] font-mono">

      {/* HEADER */}
      <div className="px-8 pt-10 pb-6 border-b border-[#1a1a1a]">
        <p className="text-[0.58rem] uppercase tracking-[.25em] text-[#d4af37] mb-2 flex items-center gap-3">
          <span className="w-4 h-px bg-[#d4af37] inline-block" />
          Weekly Planner
        </p>

        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-serif italic text-4xl text-[#f0ece0] leading-none">
              {weekLabel(weekStart)}
            </h1>
            <p className="text-[0.6rem] text-[#3a3a3a] tracking-widest mt-2">
              {totalMeals} meal{totalMeals !== 1 ? "s" : ""} planned this week
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Week navigation */}
            <button
              onClick={() => shiftWeek(-1)}
              className="w-8 h-8 border border-[#1e1e1e] text-[#555] hover:border-[#d4af37] hover:text-[#d4af37] transition-colors text-sm"
            >
              ←
            </button>
            <button
              onClick={() => setWeekStart(getMonday(new Date()))}
              className="text-[0.6rem] uppercase tracking-[.15em] border border-[#1e1e1e] px-3 py-1.5 text-[#555] hover:border-[#d4af37] hover:text-[#d4af37] transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => shiftWeek(1)}
              className="w-8 h-8 border border-[#1e1e1e] text-[#555] hover:border-[#d4af37] hover:text-[#d4af37] transition-colors text-sm"
            >
              →
            </button>

            {/* Save */}
            <button
              onClick={savePlan}
              disabled={saving}
              className="text-[0.62rem] uppercase tracking-[.15em] bg-[#d4af37] text-[#0a0a0a] px-5 py-2 font-medium hover:bg-[#e8c84a] transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : saved ? "Saved ✓" : "Save Week"}
            </button>
          </div>
        </div>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="flex items-center justify-center py-32 text-[0.65rem] text-[#2a2a2a] tracking-widest uppercase">
          Loading…
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-px bg-[#1a1a1a] border-b border-[#1a1a1a]">
          {days.map((day, dayIndex) => {
            const isToday = getMonday(new Date()) === weekStart &&
              DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1] === day.day;

            return (
              <div key={day.day} className="bg-[#0a0a0a] flex flex-col min-h-[420px]">
                {/* Day header */}
                <div className={`px-3 py-3 border-b border-[#1a1a1a] ${isToday ? "bg-[#d4af37]/5" : ""}`}>
                  <p className={`text-[0.6rem] uppercase tracking-[.2em] font-medium ${isToday ? "text-[#d4af37]" : "text-[#3a3a3a]"}`}>
                    {DAY_LABELS[day.day]}
                  </p>
                  {isToday && (
                    <span className="text-[0.5rem] uppercase tracking-widest text-[#d4af37]/60">Today</span>
                  )}
                </div>

                {/* Meals */}
                <div className="flex-1 p-2 flex flex-col gap-2">
                  {day.meals.map((meal, mealIndex) => (
                    <div
                      key={meal.id}
                      className="group relative bg-[#111] border border-[#1e1e1e] p-2.5 hover:border-[#2a2a2a] transition-colors cursor-pointer"
                      onClick={() => openEdit(dayIndex, mealIndex)}
                    >
                      {meal.label && (
                        <p className="text-[0.5rem] uppercase tracking-[.15em] text-[#d4af37]/70 mb-1">{meal.label}</p>
                      )}
                      <p className="text-[0.68rem] text-[#e8e4d8] leading-snug">{meal.recipe}</p>
                      {meal.notes && (
                        <p className="text-[0.6rem] text-[#444] mt-1 leading-snug">{meal.notes}</p>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteMeal(dayIndex, mealIndex); }}
                        className="absolute top-1.5 right-1.5 w-4 h-4 text-[#2a2a2a] hover:text-[#c0392b] transition-colors opacity-0 group-hover:opacity-100 text-xs leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {/* Add meal */}
                  <button
                    onClick={() => openAdd(dayIndex)}
                    className="mt-auto w-full py-2 text-[0.58rem] uppercase tracking-[.15em] text-[#2a2a2a] border border-dashed border-[#1e1e1e] hover:border-[#d4af37] hover:text-[#d4af37] transition-colors"
                  >
                    + Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {modal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-[#0e0e0e] border border-[#1e1e1e] w-full max-w-md p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-[#2a2a2a] hover:text-[#e8e4d8] transition-colors text-lg leading-none"
            >
              ×
            </button>

            <p className="text-[0.58rem] uppercase tracking-[.2em] text-[#d4af37] mb-1 flex items-center gap-2">
              <span className="w-3 h-px bg-[#d4af37] inline-block" />
              {modal.mealIndex === null ? "Add meal" : "Edit meal"} — {DAYS[modal.dayIndex]}
            </p>
            <h2 className="font-serif italic text-2xl text-[#f0ece0] mb-6">
              {modal.mealIndex === null ? "New meal" : "Edit meal"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[0.6rem] uppercase tracking-[.15em] text-[#444] mb-1.5">
                  Meal type <span className="text-[#2a2a2a]">(e.g. Breakfast, Lunch, Dinner)</span>
                </label>
                <input
                  type="text"
                  placeholder="Dinner"
                  value={modal.meal.label}
                  onChange={(e) => setModal((m) => ({ ...m, meal: { ...m.meal, label: e.target.value } }))}
                  className="w-full bg-[#111] border border-[#1e1e1e] text-[#e8e4d8] text-sm px-3 py-2.5 outline-none focus:border-[#d4af37] transition-colors font-mono placeholder:text-[#2a2a2a]"
                />
              </div>

              <div>
                <label className="block text-[0.6rem] uppercase tracking-[.15em] text-[#444] mb-1.5">
                  Recipe <span className="text-[#c0392b]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Spaghetti Bolognese"
                  value={modal.meal.recipe}
                  onChange={(e) => setModal((m) => ({ ...m, meal: { ...m.meal, recipe: e.target.value } }))}
                  className="w-full bg-[#111] border border-[#1e1e1e] text-[#e8e4d8] text-sm px-3 py-2.5 outline-none focus:border-[#d4af37] transition-colors font-mono placeholder:text-[#2a2a2a]"
                />
              </div>

              <div>
                <label className="block text-[0.6rem] uppercase tracking-[.15em] text-[#444] mb-1.5">Notes</label>
                <textarea
                  placeholder="e.g. Use leftover mince, serves 4"
                  value={modal.meal.notes}
                  onChange={(e) => setModal((m) => ({ ...m, meal: { ...m.meal, notes: e.target.value } }))}
                  rows={3}
                  className="w-full bg-[#111] border border-[#1e1e1e] text-[#e8e4d8] text-sm px-3 py-2.5 outline-none focus:border-[#d4af37] transition-colors font-mono placeholder:text-[#2a2a2a] resize-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={saveMeal}
                disabled={!modal.meal.recipe.trim()}
                className="flex-1 bg-[#d4af37] text-[#0a0a0a] text-[0.65rem] uppercase tracking-[.15em] py-2.5 font-medium hover:bg-[#e8c84a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {modal.mealIndex === null ? "Add meal" : "Save changes"}
              </button>
              {modal.mealIndex !== null && (
                <button
                  onClick={() => { deleteMeal(modal.dayIndex, modal.mealIndex!); closeModal(); }}
                  className="text-[0.65rem] uppercase tracking-[.15em] text-[#c0392b] border border-[#c0392b]/30 px-4 py-2.5 hover:bg-[#c0392b]/10 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}