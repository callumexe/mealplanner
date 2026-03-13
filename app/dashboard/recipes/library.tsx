"use client";

import { useEffect, useState, useCallback, useRef } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
interface MealSummary {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory?: string;
  strArea?: string;
}

interface MealDetail extends MealSummary {
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strYoutube: string;
  strSource: string;
  [key: string]: string | null | undefined;
}

interface Category {
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

// ── API helpers ────────────────────────────────────────────────────────────
const BASE = "https://www.themealdb.com/api/json/v1/1";

async function searchMeals(query: string): Promise<MealSummary[]> {
  const res = await fetch(`${BASE}/search.php?s=${encodeURIComponent(query)}`);
  const data = await res.json();
  return data.meals ?? [];
}

async function getMealById(id: string): Promise<MealDetail | null> {
  const res = await fetch(`${BASE}/lookup.php?i=${id}`);
  const data = await res.json();
  return data.meals?.[0] ?? null;
}

async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE}/categories.php`);
  const data = await res.json();
  return data.categories ?? [];
}

async function filterByCategory(cat: string): Promise<MealSummary[]> {
  const res = await fetch(`${BASE}/filter.php?c=${encodeURIComponent(cat)}`);
  const data = await res.json();
  return data.meals ?? [];
}

async function getRandomMeal(): Promise<MealDetail | null> {
  const res = await fetch(`${BASE}/random.php`);
  const data = await res.json();
  return data.meals?.[0] ?? null;
}

function getIngredients(meal: MealDetail): { ingredient: string; measure: string }[] {
  const result = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      result.push({ ingredient: ingredient.trim(), measure: measure?.trim() ?? "" });
    }
  }
  return result;
}

// ── Component ──────────────────────────────────────────────────────────────
export default function RecipeLibrary() {
  const [query, setQuery] = useState("");
  const [meals, setMeals] = useState<MealSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedMeal, setSelectedMeal] = useState<MealDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load categories on mount + initial popular meals
  useEffect(() => {
    getCategories().then(setCategories);
    setLoading(true);
    searchMeals("chicken").then((m) => { setMeals(m); setLoading(false); setHasSearched(true); });
  }, []);

  // Debounced search
  const handleSearch = useCallback((val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setActiveCategory("All");
      setLoading(true);
      searchMeals("chicken").then((m) => { setMeals(m); setLoading(false); });
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setActiveCategory("All");
      const results = await searchMeals(val);
      setMeals(results);
      setHasSearched(true);
      setLoading(false);
    }, 400);
  }, []);

  const handleCategory = async (cat: string) => {
    setActiveCategory(cat);
    setQuery("");
    setLoading(true);
    if (cat === "All") {
      const results = await searchMeals("chicken");
      setMeals(results);
    } else {
      const results = await filterByCategory(cat);
      setMeals(results);
    }
    setLoading(false);
    setHasSearched(true);
  };

  const openMeal = async (id: string) => {
    setDetailLoading(true);
    setSelectedMeal(null);
    setExportDone(false);
    const detail = await getMealById(id);
    setSelectedMeal(detail);
    setDetailLoading(false);
  };

  const handleRandom = async () => {
    setDetailLoading(true);
    setExportDone(false);
    const meal = await getRandomMeal();
    setSelectedMeal(meal);
    setDetailLoading(false);
  };

  const exportToShoppingList = async (meal: MealDetail) => {
    setExporting(true);
    try {
      const existing = await fetch("/api/shopping").then((r) => r.json());
      const currentItems: { id: string; name: string; quantity: string; unit: string; checked: boolean; category: string }[] = existing.items ?? [];

      const newItems = getIngredients(meal).map(({ ingredient, measure }) => {
        const parts = measure.trim().split(/\s+/);
        const quantity = parts[0] ?? "";
        const unit = parts.slice(1).join(" ");
        return {
          id: Math.random().toString(36).slice(2, 10),
          name: ingredient,
          quantity,
          unit,
          checked: false,
          category: "Other",
        };
      });

      const existingNames = new Set(currentItems.map((i) => i.name.toLowerCase()));
      const toAdd = newItems.filter((i) => !existingNames.has(i.name.toLowerCase()));
      const merged = [...currentItems, ...toAdd];

      await fetch("/api/shopping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: merged }),
      });

      setExportDone(true);
      setTimeout(() => setExportDone(false), 2500);
    } catch { /* silently fail */ }
    setExporting(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e4d8] font-mono flex flex-col">

      {/* ── HEADER ── */}
      <div className="px-8 pt-10 pb-6 border-b border-[#1a1a1a]">
        <p className="text-[0.58rem] uppercase tracking-[.25em] text-[#d4af37] mb-2 flex items-center gap-3">
          <span className="w-4 h-px bg-[#d4af37] inline-block" />
          Recipe Library
        </p>
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-serif italic text-4xl text-[#f0ece0] leading-none">
              Find your next meal.
            </h1>
            <p className="text-[0.6rem] text-[#3a3a3a] tracking-widest mt-2">
              Powered by TheMealDB · {meals.length > 0 ? `${meals.length} results` : "Search to explore"}
            </p>
          </div>
          <button
            onClick={handleRandom}
            className="text-[0.62rem] uppercase tracking-[.15em] border border-[#d4af37] text-[#d4af37] px-5 py-2 hover:bg-[#d4af37] hover:text-[#0a0a0a] transition-colors cursor-pointer"
          >
            ↻ Random meal
          </button>
        </div>

        {/* Search bar */}
        <div className="mt-6 relative max-w-xl">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search recipes… e.g. pasta, chicken tikka"
            className="w-full bg-[#111] border border-[#1e1e1e] text-[#e8e4d8] text-sm px-4 py-3 pr-10 outline-none focus:border-[#d4af37] transition-colors font-mono placeholder:text-[#252525]"
          />
          {query && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3a3a3a] hover:text-[#e8e4d8] transition-colors text-lg leading-none cursor-pointer"
            >
              ×
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => handleCategory("All")}
            className={`text-[0.58rem] uppercase tracking-[.15em] px-3 py-1 border transition-colors cursor-pointer ${
              activeCategory === "All"
                ? "border-[#d4af37] text-[#d4af37] bg-[#d4af37]/5"
                : "border-[#1e1e1e] text-[#3a3a3a] hover:border-[#2a2a2a] hover:text-[#555]"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.strCategory}
              onClick={() => handleCategory(c.strCategory)}
              className={`text-[0.58rem] uppercase tracking-[.15em] px-3 py-1 border transition-colors cursor-pointer ${
                activeCategory === c.strCategory
                  ? "border-[#d4af37] text-[#d4af37] bg-[#d4af37]/5"
                  : "border-[#1e1e1e] text-[#3a3a3a] hover:border-[#2a2a2a] hover:text-[#555]"
              }`}
            >
              {c.strCategory}
            </button>
          ))}
        </div>
      </div>

      {/* ── GRID ── */}
      <div className="flex-1 p-8">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border border-[#d4af37] border-t-transparent rounded-full animate-spin" />
              <p className="text-[0.6rem] uppercase tracking-widest text-[#2a2a2a]">Fetching recipes…</p>
            </div>
          </div>
        ) : meals.length === 0 && hasSearched ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <p className="font-serif italic text-2xl text-[#1e1e1e]">No recipes found.</p>
            <p className="text-[0.62rem] uppercase tracking-widest text-[#2a2a2a]">Try a different search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-px bg-[#1a1a1a] border border-[#1a1a1a]">
            {meals.map((meal) => (
              <button
                key={meal.idMeal}
                onClick={() => openMeal(meal.idMeal)}
                className="group bg-[#0a0a0a] hover:bg-[#0e0e0e] transition-colors text-left relative overflow-hidden cursor-pointer"
              >
                {/* Image */}
                <div className="aspect-square overflow-hidden relative">
                  <img
                    src={`${meal.strMealThumb}/medium`}
                    alt={meal.strMeal}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                </div>
                {/* Title */}
                <div className="p-3">
                  <p className="text-[0.72rem] text-[#e8e4d8] leading-snug line-clamp-2 group-hover:text-[#f0ece0] transition-colors">
                    {meal.strMeal}
                  </p>
                  {meal.strCategory && (
                    <p className="text-[0.55rem] uppercase tracking-[.12em] text-[#3a3a3a] mt-1">{meal.strCategory}</p>
                  )}
                </div>
                {/* Hover gold line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-[#d4af37] scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── DETAIL MODAL ── */}
      {(detailLoading || selectedMeal) && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-end bg-black/70 backdrop-blur-sm"
          onClick={() => { setSelectedMeal(null); }}
        >
          <div
            className="relative bg-[#0e0e0e] border-l border-[#1e1e1e] w-full max-w-xl h-full overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {detailLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border border-[#d4af37] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : selectedMeal && (
              <>
                {/* Hero image */}
                <div className="relative h-64 overflow-hidden shrink-0">
                  <img
                    src={`${selectedMeal.strMealThumb}/large`}
                    alt={selectedMeal.strMeal}
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/30 to-transparent" />
                  <button
                    onClick={() => setSelectedMeal(null)}
                    className="absolute top-4 right-4 w-8 h-8 bg-[#0e0e0e]/80 border border-[#1e1e1e] text-[#555] hover:text-[#e8e4d8] transition-colors text-lg leading-none grid place-items-center cursor-pointer"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-4 left-6 right-16">
                    <div className="flex gap-2 mb-2">
                      {selectedMeal.strCategory && (
                        <span className="text-[0.55rem] uppercase tracking-[.15em] text-[#d4af37] border border-[#d4af37]/30 px-2 py-0.5 bg-[#d4af37]/5">
                          {selectedMeal.strCategory}
                        </span>
                      )}
                      {selectedMeal.strArea && (
                        <span className="text-[0.55rem] uppercase tracking-[.15em] text-[#555] border border-[#1e1e1e] px-2 py-0.5">
                          {selectedMeal.strArea}
                        </span>
                      )}
                    </div>
                    <h2 className="font-serif italic text-2xl text-[#f0ece0] leading-tight">
                      {selectedMeal.strMeal}
                    </h2>
                  </div>
                </div>

                <div className="p-6 space-y-8">

                  {/* Ingredients */}
                  <div>
                    <p className="text-[0.58rem] uppercase tracking-[.2em] text-[#d4af37] mb-4 flex items-center gap-2">
                      <span className="w-3 h-px bg-[#d4af37] inline-block" />
                      Ingredients
                    </p>
                    <div className="grid grid-cols-2 gap-px bg-[#1a1a1a] border border-[#1a1a1a]">
                      {getIngredients(selectedMeal).map(({ ingredient, measure }) => (
                        <div key={ingredient} className="bg-[#0e0e0e] px-3 py-2 flex items-center justify-between gap-2">
                          <span className="text-[0.7rem] text-[#e8e4d8]">{ingredient}</span>
                          <span className="text-[0.65rem] text-[#555] shrink-0">{measure}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Export button — visible without scrolling */}
                  <button
                    onClick={() => exportToShoppingList(selectedMeal)}
                    disabled={exporting}
                    className={`w-full py-3 text-[0.62rem] uppercase tracking-[.18em] font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                      exportDone
                        ? "bg-green-500/10 border border-green-500/30 text-green-400"
                        : "bg-[#d4af37] text-[#0a0a0a] hover:bg-[#e8c84a]"
                    }`}
                  >
                    {exporting ? "Adding…" : exportDone
                      ? `✓ ${getIngredients(selectedMeal).length} ingredients added`
                      : `→ Add ${getIngredients(selectedMeal).length} ingredients to shopping list`}
                  </button>

                  {/* Instructions */}
                  <div>
                    <p className="text-[0.58rem] uppercase tracking-[.2em] text-[#d4af37] mb-4 flex items-center gap-2">
                      <span className="w-3 h-px bg-[#d4af37] inline-block" />
                      Method
                    </p>
                    <div className="space-y-3">
                      {selectedMeal.strInstructions
                        .split(/\r?\n/)
                        .filter((s) => s.trim())
                        .map((step, i) => (
                          <div key={i} className="flex gap-3">
                            <span className="font-serif italic text-[#d4af37]/40 text-sm shrink-0 w-5 text-right">{i + 1}</span>
                            <p className="text-[0.72rem] text-[#555] leading-relaxed">{step.trim()}</p>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Export to shopping list */}
                  <div className="border border-[#1e1e1e] p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[0.68rem] text-[#e8e4d8]">Add ingredients to shopping list</p>
                      <p className="text-[0.6rem] text-[#3a3a3a] mt-0.5">
                        {getIngredients(selectedMeal).length} ingredients · duplicates skipped automatically
                      </p>
                    </div>
                    <button
                      onClick={() => exportToShoppingList(selectedMeal)}
                      disabled={exporting}
                      className={`shrink-0 text-[0.62rem] uppercase tracking-[.15em] px-5 py-2 font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                        exportDone
                          ? "bg-green-500/10 border border-green-500/30 text-green-400"
                          : "bg-[#d4af37] text-[#0a0a0a] hover:bg-[#e8c84a]"
                      }`}
                    >
                      {exporting ? "Adding…" : exportDone ? "Added ✓" : "→ Shopping list"}
                    </button>
                  </div>

                  {/* Links */}
                  <div className="flex gap-3 pt-2 border-t border-[#1a1a1a]">
                    {selectedMeal.strYoutube && (
                      <a
                        href={selectedMeal.strYoutube}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[0.62rem] uppercase tracking-[.15em] text-[#3a3a3a] border border-[#1e1e1e] px-4 py-2 hover:border-[#d4af37] hover:text-[#d4af37] transition-colors"
                      >
                        ▶ Watch on YouTube
                      </a>
                    )}
                    {selectedMeal.strSource && (
                      <a
                        href={selectedMeal.strSource}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[0.62rem] uppercase tracking-[.15em] text-[#3a3a3a] border border-[#1e1e1e] px-4 py-2 hover:border-[#d4af37] hover:text-[#d4af37] transition-colors"
                      >
                        ↗ View source
                      </a>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}