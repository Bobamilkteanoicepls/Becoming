import React, { useState, useRef, useEffect } from "react";

/* ============================================================
   BECOMING v3 — "I just talk. You remember everything."
   ------------------------------------------------------------
   Three tabs only:
   Coach   → conversation IS the app. Morning briefing arrives
             as chat. All logging, questions, venting, photos
             happen here. Four quick starters, no pages.
   Journal → auto-organized life. Calendar (Apple-Photos style)
             → tap any day → visual timeline of meals, workouts,
             photos, coach notes. Long-press-style edit menu.
   Me      → small Body Model (top insights only), perceived
             body observations, weekly story.

   Rule applied throughout: before adding any feature, ask
   "can this happen naturally inside the conversation?"
   ============================================================ */

/* ---------------- theme ---------------- */

const T = {
  bg: "#F3EEE5", surface: "#FFFDF7", surfaceSoft: "#FAF6EC",
  ink: "#2C2A25", inkSoft: "#6E6A5E", inkFaint: "#9B968A",
  green: "#5E7B62", greenDeep: "#3D5743", greenTint: "#E4EBE1",
  amber: "#D9A05B", amberTint: "#F6E9D6", line: "#E7E0D2",
  userBubble: "#3D5743",
};
const FONT_HEAD = "'Fraunces', Georgia, serif";
const FONT_BODY = "'Instrument Sans', -apple-system, sans-serif";
const cardShadow = "0 10px 30px rgba(72,62,40,0.08), 0 2px 6px rgba(72,62,40,0.05)";
const card = { background: T.surface, boxShadow: cardShadow, border: `1px solid ${T.line}` };

/* ---------------- knowledge: body model + food + training ---------------- */

const BODY_MODEL = [
  { icon: "🥣", text: "Cottage cheese keeps you full ~3 hours.", evidence: "9 logs", confidence: "Solid" },
  { icon: "🍫", text: "Upper-body days usually trigger evening snack cravings.", evidence: "4 of last 5", confidence: "Solid" },
  { icon: "💃", text: "Dance days improve your mood — every time.", evidence: "5 of 5", confidence: "Solid" },
  { icon: "🌙", text: "Skipping lunch leads to late-night hunger.", evidence: "6 observations", confidence: "Emerging" },
];

/* per-item estimates with EXPLICIT assumed portions.
   Showing the assumption is what makes a range trustworthy. */
const FOOD_DB = [
  { k: ["eggs", "egg"], name: "2 eggs", lo: 140, hi: 160, p: 12 },
  { k: ["turkey"], name: "turkey (4 slices)", lo: 90, hi: 130, p: 16 },
  { k: ["sourdough", "toast", "bread"], name: "sourdough (1 slice)", lo: 130, hi: 170, p: 5 },
  { k: ["oat latte", "latte"], name: "oat latte (12 oz)", lo: 150, hi: 220, p: 4 },
  { k: ["cottage cheese", "cottage"], name: "cottage cheese (\u00bd cup)", lo: 90, hi: 120, p: 13 },
  { k: ["protein bar"], name: "protein bar", lo: 190, hi: 230, p: 20 },
  { k: ["wings"], name: "chicken wings (6)", lo: 400, hi: 600, p: 34 },
  { k: ["sausage"], name: "chicken sausage (2 links)", lo: 150, hi: 200, p: 15 },
  { k: ["smoothie"], name: "fruit smoothie (12 oz)", lo: 200, hi: 300, p: 4 },
  { k: ["salmon"], name: "salmon (5 oz)", lo: 280, hi: 360, p: 32 },
  { k: ["chicken"], name: "chicken breast (5 oz)", lo: 230, hi: 300, p: 40 },
  { k: ["rice"], name: "rice (1 cup cooked)", lo: 200, hi: 240, p: 4 },
  { k: ["salad"], name: "side salad + dressing", lo: 120, hi: 220, p: 3 },
  { k: ["yogurt", "greek"], name: "greek yogurt (170 g)", lo: 100, hi: 150, p: 16 },
  { k: ["banana"], name: "banana", lo: 90, hi: 120, p: 1 },
  { k: ["avocado"], name: "avocado (\u00bd)", lo: 120, hi: 160, p: 2 },
  { k: ["oatmeal", "oats", "porridge"], name: "oatmeal (1 bowl)", lo: 150, hi: 250, p: 6 },
  { k: ["ramen", "noodle"], name: "noodles (1 bowl)", lo: 400, hi: 600, p: 15 },
  { k: ["sushi"], name: "sushi (8 pc)", lo: 300, hi: 450, p: 18 },
  { k: ["burrito"], name: "burrito", lo: 550, hi: 800, p: 28 },
  { k: ["pasta"], name: "pasta (1 plate)", lo: 450, hi: 650, p: 15 },
  { k: ["pizza"], name: "pizza (2 slices)", lo: 450, hi: 650, p: 20 },
  { k: ["matcha"], name: "matcha latte (12 oz)", lo: 140, hi: 220, p: 4 },
  { k: ["tofu"], name: "tofu (1 cup)", lo: 150, hi: 200, p: 18 },
  { k: ["beef", "steak"], name: "beef (5 oz)", lo: 300, hi: 400, p: 36 },
  { k: ["shrimp"], name: "shrimp (5 oz)", lo: 130, hi: 180, p: 28 },
  { k: ["dumpling"], name: "dumplings (8)", lo: 350, hi: 500, p: 16 },
  { k: ["poke"], name: "poke bowl", lo: 500, hi: 700, p: 35 },
  { k: ["acai"], name: "acai bowl", lo: 350, hi: 550, p: 6 },
  { k: ["protein shake"], name: "protein shake", lo: 150, hi: 250, p: 25 },
  { k: ["granola"], name: "granola (\u00bd cup)", lo: 200, hi: 280, p: 5 },
  { k: ["fruit", "berries", "apple", "orange", "grapes"], name: "fruit", lo: 60, hi: 120, p: 1 },
  { k: ["cookie", "chocolate", "cake", "dessert", "ice cream", "boba"], name: "sweet treat", lo: 150, hi: 280, p: 2, treat: true },
];

const MUSCLES = [
  { k: ["glute", "leg day", "legs"], group: "Glutes & legs", emoji: "🍑" },
  { k: ["back", "pull"], group: "Back", emoji: "🏋️" },
  { k: ["chest", "shoulder", "push"], group: "Chest & shoulders", emoji: "🏋️" },
  { k: ["hip hop", "hiphop"], group: "Hip hop", emoji: "💃" },
  { k: ["jazz", "kpop", "k-pop", "ballet", "heels", "contemporary", "salsa", "choreo", "dance"], group: "Dance", emoji: "💃", styled: true },
  { k: ["swim"], group: "Swimming", emoji: "🏊" },
  { k: ["walk"], group: "Walk", emoji: "🚶" },
];
const RECOVERY_NEEDS = { "Glutes & legs": 3, "Back": 2, "Chest & shoulders": 2 };

/* rough burn ranges at ~54 kg body weight, per DEFAULT duration below.
   burnFor() scales them to the actual minutes logged. */
const BURN_BASE_MIN = { "Back": 45, "Chest & shoulders": 45, "Glutes & legs": 50, "Hip hop": 60, "Dance": 60, "Swimming": 30, "Walk": 30 };
const burnFor = (group, min) => {
  const b = BURN[group] || [100, 180];
  const base = BURN_BASE_MIN[group] || 45;
  const f = min / base;
  return [Math.round(b[0] * f / 10) * 10, Math.round(b[1] * f / 10) * 10];
};
const BURN = {
  "Back": [150, 220], "Chest & shoulders": [150, 220], "Glutes & legs": [180, 260],
  "Hip hop": [280, 400], "Dance": [280, 400], "Swimming": [180, 270], "Walk": [90, 130],
};

const WORKOUT_CHIPS = [
  { label: "🏋️ Back", group: "Back", min: 45 }, { label: "🏋️ Chest", group: "Chest & shoulders", min: 45 },
  { label: "🍑 Glutes", group: "Glutes & legs", min: 50 }, { label: "💃 Dance", group: "Hip hop", min: 60 },
  { label: "🏊 Swim", group: "Swimming", min: 30 }, { label: "🚶 Walk", group: "Walk", min: 30 },
];

const USUALS = [
  { label: "🍳 Usual breakfast", food: {
      items: ["2 eggs", "turkey (4 slices)", "sourdough (1 slice)", "oat latte (12 oz)"],
      breakdown: [
        { name: "2 eggs", lo: 140, hi: 160, p: 12 },
        { name: "turkey (4 slices)", lo: 90, hi: 130, p: 16 },
        { name: "sourdough (1 slice)", lo: 130, hi: 170, p: 5 },
        { name: "oat latte (12 oz)", lo: 150, hi: 220, p: 4 },
      ],
      lo: 510, hi: 680, p: 37, tags: ["High protein"] } },
  { label: "🥣 Cottage cheese + fruit", food: {
      items: ["cottage cheese (½ cup)", "mixed fruit"],
      breakdown: [
        { name: "cottage cheese (½ cup)", lo: 90, hi: 120, p: 13 },
        { name: "mixed fruit", lo: 60, hi: 100, p: 1 },
      ],
      lo: 150, hi: 220, p: 14, tags: ["Holds you ~3 h"] } },
  { label: "🍫 Protein bar", food: { items: ["protein bar"], breakdown: [{ name: "protein bar", lo: 190, hi: 230, p: 20 }], lo: 190, hi: 230, p: 20, tags: ["High protein"] } },
  { label: "☕ Oat latte", food: { items: ["oat latte (12 oz)"], breakdown: [{ name: "oat latte (12 oz)", lo: 150, hi: 220, p: 4 }], lo: 150, hi: 220, p: 4, tags: ["Fits easily"] } },
];

/* photo cycle: coach infers context — food, selfie, body check, inspo */
const MOCK_PHOTOS = [
  { emoji: "🥗", kind: "food", bg: "linear-gradient(135deg,#E4EBE1,#F6E9D6)", guess: "Chicken grain bowl — greens, roasted veg, grains.", food: { items: ["chicken grain bowl"], breakdown: [
      { name: "chicken (~5 oz)", lo: 230, hi: 300, p: 40 },
      { name: "grains (~1 cup)", lo: 180, hi: 250, p: 5 },
      { name: "veg + dressing", lo: 140, hi: 200, p: 2 },
    ], lo: 550, hi: 750, p: 47, tags: ["High protein", "Good recovery meal"] } },
  { emoji: "🤳", kind: "selfie", bg: "linear-gradient(135deg,#EADFD2,#F6E9D6)" },
  { emoji: "🪞", kind: "bodycheck", bg: "linear-gradient(135deg,#E4EBE1,#EADFD2)" },
  { emoji: "🤸‍♀️", kind: "inspo", bg: "linear-gradient(135deg,#EADFD2,#E4EBE1)" },
  { emoji: "🍜", kind: "food", bg: "linear-gradient(135deg,#F6E9D6,#EADFD2)", guess: "Pork noodle soup with greens.", food: { items: ["noodle soup, pork & greens"], breakdown: [
      { name: "noodles + broth", lo: 300, hi: 400, p: 8 },
      { name: "pork (~3 oz)", lo: 120, hi: 180, p: 16 },
      { name: "greens", lo: 30, hi: 70, p: 2 },
    ], lo: 450, hi: 650, p: 26, tags: ["Balanced"] } },
];

/* proactive notices — the coach speaks first */
const PROACTIVE = [
  "Noticed something: you've trained 5 of the last 6 days. Strong streak — protect it with sleep.",
  "You haven't danced yet this week. Thursday class still on?",
  "Heads up: upper-body days usually trigger snack cravings for you. Plan one, don't fight one.",
];

/* ---------------- journal seed (auto-organized past days) ---------------- */

const J = (type, emoji, label, detail, time, extra = {}) => ({ id: Math.random().toString(36).slice(2), type, emoji, label, detail, time, ...extra });

const dkey = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const keyOf = (date) => dkey(date.getFullYear(), date.getMonth(), date.getDate());

/* the app's sense of "today": device clock with a 3am boundary,
   so a 1am snack still belongs to tonight, not tomorrow */
const effectiveDate = () => { const d = new Date(); d.setHours(d.getHours() - 3); return d; };
const TODAY_KEY = keyOf(effectiveDate());
const shiftKey = (k, days) => { const d = new Date(k + "T12:00:00"); d.setDate(d.getDate() + days); return keyOf(d); };
const nextKey = (k) => shiftKey(k, 1);

/* safe localStorage (works deployed; harmless if unavailable) */
const loadLS = (k, def) => { try { const v = localStorage.getItem(k); return v ?? def; } catch { return def; } };
const saveLS = (k, v) => { try { localStorage.setItem(k, v); } catch {} };

/* calendar months are generated from real dates */
const buildMonths = () => {
  const end = new Date(TODAY_KEY + "T12:00:00");
  const start = new Date(end); start.setDate(start.getDate() - 11);
  const out = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur <= end) {
    out.push({
      label: cur.toLocaleString("en-US", { month: "long", year: "numeric" }),
      y: cur.getFullYear(), m: cur.getMonth(),
      days: new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate(),
    });
    cur.setMonth(cur.getMonth() + 1);
  }
  return out;
};
const MONTHS = buildMonths();

const SEED_TODAY = TODAY_KEY;
const SEED_JOURNAL = {
  [SEED_TODAY]: {
    note: "In progress — I'm writing this as your day unfolds.",
    entries: [J("meal", "🍳", "Breakfast", "Eggs, turkey, sourdough, oat latte · ~510–680 kcal · 37 g protein", "8:40 am", { lo: 510, hi: 680, p: 37 })],
  },
  [shiftKey(SEED_TODAY, -1)]: {
    note: "Great recovery day. You fueled before dance — evening cravings stayed quiet.",
    entries: [
      J("meal", "🍳", "Breakfast", "Usual · ~510–680 kcal · 37 g protein", "8:30 am"),
      J("workout", "🍑", "Glutes & legs", "~50 min · ~180–260 kcal", "5:30 pm"),
      J("photo", "🤳", "Gym selfie", "Attached to glute session", "6:25 pm"),
      J("workout", "💃", "Hip hop", "60 min · ~280–400 kcal", "7:00 pm"),
      J("meal", "🥗", "Dinner", "Salmon bowl · ~550–720 kcal · 42 g protein", "9:15 pm"),
    ],
  },
  [shiftKey(SEED_TODAY, -2)]: {
    note: "Skipping the afternoon snack made dinner cravings louder — third time this month.",
    entries: [
      J("workout", "🏋️", "Back", "~45 min · ~150–220 kcal", "6:00 pm"),
      J("meal", "🍗", "Dinner", "Chicken + potatoes · ~550–700 kcal · 45 g protein", "8:30 pm"),
      J("talk", "💬", "We talked", "Waist worry → water retention, salty lunch", "10:05 pm"),
    ],
  },
  [shiftKey(SEED_TODAY, -3)]: {
    note: "Rest day. Protein dipped — it usually does on rest days.",
    entries: [
      J("meal", "🥤", "Lunch", "Fruit smoothie · ~200–300 kcal · 4 g protein", "1:00 pm"),
      J("photo", "🪞", "Body check", "You said your waist looked smaller", "9:00 pm"),
    ],
  },
  [shiftKey(SEED_TODAY, -4)]: {
    note: "Sweet craving at 9pm — 4 of your last 5 chest days. We plan for it now.",
    entries: [
      J("workout", "🏋️", "Chest & shoulders", "~45 min · ~150–220 kcal", "5:00 pm"),
      J("meal", "🍽️", "Dinner out", "est. ~600–850 kcal · with friends — you self-regulated well", "8:00 pm"),
      J("meal", "🍫", "Sweet treat", "~150–280 kcal · 9pm craving — no drama", "9:10 pm"),
    ],
  },
  [shiftKey(SEED_TODAY, -5)]: {
    note: "Double session handled well — early solid lunch kept energy high.",
    entries: [
      J("workout", "🍑", "Glutes & legs", "~50 min · ~180–260 kcal", "11:00 am"),
      J("workout", "🏊", "Swimming", "30 min · ~180–270 kcal", "4:00 pm"),
      J("meal", "🍗", "Post-swim wings", "~400–600 kcal · 34 g protein", "6:30 pm"),
    ],
  },
  [shiftKey(SEED_TODAY, -11)]: {
    note: "Day 1. You told me your goal: lean, strong glutes, calm around food. Everything since builds on this.",
    entries: [J("talk", "💬", "First conversation", "Goals, stats, how you want to be coached", "9:00 pm")],
  },
};

/* ---------------- parsing + intent ---------------- */

function parseFood(text) {
  const l = text.toLowerCase();
  const found = []; let lo = 0, hi = 0, p = 0, treat = false;
  const used = new Set();
  for (const it of FOOD_DB) {
    if (it.k.some((kw) => l.includes(kw)) && !used.has(it.name)) {
      used.add(it.name);
      found.push({ name: it.name, lo: it.lo, hi: it.hi, p: it.p });
      lo += it.lo; hi += it.hi; p += it.p;
      if (it.treat) treat = true;
    }
  }
  if (!found.length) return null;
  const tags = [];
  if (p >= 25) tags.push("High protein"); else if (p < 10) tags.push("Light on protein");
  if (treat) tags.push("Treat — fits the day");
  if (!tags.length) tags.push("Balanced");
  return { items: found.map((f) => f.name), breakdown: found, lo, hi, p, tags };
}

/* recompute a meal's totals + tags from an edited breakdown */
function rebuildMeal(breakdown) {
  const lo = breakdown.reduce((a, b) => a + b.lo, 0);
  const hi = breakdown.reduce((a, b) => a + b.hi, 0);
  const p = breakdown.reduce((a, b) => a + b.p, 0);
  const tags = [];
  if (p >= 25) tags.push("High protein"); else if (p < 10) tags.push("Light on protein");
  if (!tags.length) tags.push("Balanced");
  return { items: breakdown.map((b) => b.name), breakdown, lo, hi, p, tags };
}

function parseWorkout(text) {
  const l = text.toLowerCase();
  const hit = MUSCLES.find((m) => m.k.some((kw) => l.includes(kw)));
  if (!hit) return null;
  const dur = l.match(/(\d+)\s*(?:min|mins|minutes)/);
  let label = hit.group;
  if (hit.styled) {
    const style = hit.k.find((kw) => l.includes(kw) && kw !== "dance");
    label = style ? style[0].toUpperCase() + style.slice(1) + " dance" : "Dance";
  }
  const isDance = hit.group === "Hip hop" || hit.group === "Dance";
  return { group: hit.group, label, emoji: hit.emoji,
    min: dur ? parseInt(dur[1]) : isDance ? 60 : ["Swimming", "Walk"].includes(hit.group) ? 30 : 45 };
}

const BODY_PARTS = ["waist", "shoulders", "glutes", "legs", "arms", "abs", "hips", "thighs"];

/* intent first: what is the user expressing? */
function classifyIntent(text) {
  const l = text.toLowerCase();
  if (/new day|\bd\+\s*\d*\b|next day|start today/.test(l)) return "newday";

  if (/actually|it was|it\u2019s \d|you forgot|forgot|you missed|also had|make it \d|^wrong|delete that|remove that|plus a /.test(l)) return "correct";
  const part = BODY_PARTS.find((b) => l.includes(b));
  if (part && /(look|feel|seem)/.test(l)) {
    return /(bigger|thicker|wider|bloat)/.test(l) ? "bodyWorry" : "bodyObserve";
  }
  if (/bloated|bloat/.test(l)) return "bodyWorry";
  if (/get fat|make me fat|ruin|fat from/.test(l)) return "anxiety";
  if (/(don'?t|do not) (want|feel like)|no energy|so tired|exhausted|lazy|unmotivated|skip (the )?gym|hate (the )?gym|ugh/.test(l)) return "vent";
  if (/love this|physique|want to look|inspo|inspiration|body like|\bgoals\b/.test(l)) return "share";
  if (/\bpr\b|personal record|finally|proud|nailed|crushed|felt (so )?great|best session/.test(l)) return "celebrate";
  if (/suddenly want|really want (chips|sweets|chocolate|boba)|want chips/.test(l)) return "craving";
  if (/better than|worse than|compare|last week|am i (making )?progress/.test(l)) return "compare";
  if (/what if|thinking about|maybe i should|considering|should i switch/.test(l)) return "brainstorm";
  if (/i noticed|i feel like|i think my|weird that|interesting/.test(l)) return "reflect";

  const q = text.includes("?") || /should|can i|am i|will i|what|how/.test(l);
  if (q) {
    if (/train today|should i train|gym today|what should i train/.test(l)) return "recommend";
    if (/hungry|craving/.test(l)) return "hunger";
    if (/before (the )?(dance|hip hop|gym|dinner)|eat before|eat now/.test(l)) return "timing";
    if (/eat over|too much|over today/.test(l)) return "overate";
    if (/order|dinner|restaurant|social/.test(l)) return "order";
    if (/latte|coffee|snack|treat|boba|dessert/.test(l)) return "treatok";
    return "ask";
  }
  if (parseFood(text)) return "logFood";
  if (parseWorkout(text)) return "logWorkout";
  return "explore";
}

/* ---------------- atoms ---------------- */

function Tag({ children, tone = "green" }) {
  const c = { green: { bg: T.greenTint, fg: T.greenDeep }, amber: { bg: T.amberTint, fg: "#9A6A28" }, faint: { bg: "#EFEAE0", fg: T.inkSoft } }[tone];
  return <span className="inline-block rounded-full px-3 py-1 text-xs font-medium" style={{ background: c.bg, color: c.fg }}>{children}</span>;
}

function MemoryEyebrow() {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.amber }} />
      <span className="text-xs font-semibold uppercase" style={{ color: "#9A6A28", letterSpacing: "0.08em" }}>Becoming remembers</span>
    </div>
  );
}

/* ---------------- chat cards ---------------- */

/* end-of-day report: short, kind, one line for tomorrow */
function ReportCard({ r }) {
  return (
    <div className="mt-2 rounded-2xl overflow-hidden" style={{ boxShadow: cardShadow }}>
      <div className="p-4" style={{ background: `linear-gradient(135deg, ${T.greenDeep}, ${T.green})` }}>
        <div className="text-xs uppercase tracking-wide mb-2" style={{ color: "#CFE0CC", letterSpacing: "0.1em" }}>Day {r.day} · closed</div>
        <div className="flex gap-5 mb-3">
          <div><div className="text-xs" style={{ color: "#CFE0CC" }}>Fuel</div><div className="text-sm font-semibold" style={{ color: "#FDFBF4" }}>~{r.lo}–{r.hi} kcal</div></div>
          <div><div className="text-xs" style={{ color: "#CFE0CC" }}>Protein</div><div className="text-sm font-semibold" style={{ color: "#FDFBF4" }}>~{r.p} g</div></div>
          <div><div className="text-xs" style={{ color: "#CFE0CC" }}>Moved</div><div className="text-sm font-semibold" style={{ color: "#FDFBF4" }}>{r.moved}</div></div>
        </div>
        <div className="text-sm mb-1" style={{ color: "#DCE8D9" }}>✓ {r.win}</div>
        <div className="text-sm" style={{ color: "#FDFBF4" }}>Tomorrow: {r.tomorrow}</div>
      </div>
    </div>
  );
}

function BriefingCard({ focus, oneThing, memoryNote }) {
  const f_ = focus || ["Chest recovered", "Hip hop tonight · 7pm"];
  const one = oneThing || "One thing: protein before dance.";
  const mem = memoryNote || "Last week you skipped the afternoon snack before dance — post-dance hunger hit hard.";
  return (
    <div className="mt-2 rounded-2xl p-4" style={card}>
      <div className="text-xs uppercase tracking-wide mb-2" style={{ color: T.inkFaint, letterSpacing: "0.08em" }}>Today</div>
      {f_.map((f) => (
        <div key={f} className="flex gap-2 text-sm mb-1.5" style={{ color: T.inkSoft }}>
          <span style={{ color: T.greenDeep }}>✓</span>{f}
        </div>
      ))}
      <div className="rounded-xl p-3 mt-3" style={{ background: T.amberTint, border: "1px solid #EBD5B4" }}>
        <MemoryEyebrow />
        <div className="text-sm font-semibold" style={{ color: "#7E561F" }}>{one}</div>
        <p className="text-xs mt-1" style={{ color: "#8A6A38", lineHeight: 1.5 }}>{mem}</p>
      </div>
    </div>
  );
}

function MealCard({ food }) {
  return (
    <div className="mt-2 rounded-2xl p-4" style={card}>
      <div className="text-xs uppercase tracking-wide mb-1.5" style={{ color: T.inkFaint, letterSpacing: "0.08em" }}>Logged</div>
      {(food.breakdown || []).map((b) => (
        <div key={b.name} className="flex justify-between text-sm py-0.5">
          <span style={{ color: T.ink }}>{b.name}</span>
          <span style={{ color: T.inkFaint }}>~{b.lo}–{b.hi}</span>
        </div>
      ))}
      {!food.breakdown && <div className="text-sm mb-1 font-medium" style={{ color: T.ink }}>{food.items.join(" · ")}</div>}
      <div className="flex justify-between text-sm py-1 mt-1 font-semibold" style={{ borderTop: `1px solid ${T.line}`, color: T.ink }}>
        <span>~{food.lo}–{food.hi} kcal</span>
        <span style={{ color: T.greenDeep }}>~{food.p} g protein</span>
      </div>
      <div className="flex flex-wrap gap-2 mt-1.5">{food.tags.map((t) => <Tag key={t} tone={t.includes("Light") ? "amber" : "green"}>{t}</Tag>)}</div>
      <div className="text-xs mt-2" style={{ color: T.inkFaint }}>Portions assumed — say “actually 3 eggs” and I’ll re-estimate.</div>
    </div>
  );
}

function WorkoutCard({ w }) {
  return (
    <div className="mt-2 rounded-2xl p-4" style={card}>
      <div className="text-xs uppercase tracking-wide mb-1" style={{ color: T.inkFaint, letterSpacing: "0.08em" }}>Workout logged</div>
      <div className="text-base font-semibold mb-1" style={{ color: T.ink, fontFamily: FONT_HEAD }}>{w.emoji} {w.group}</div>
      <div className="text-xs mb-2" style={{ color: T.inkSoft }}>~{w.min} min · ~{w.burn ? `${w.burn[0]}–${w.burn[1]}` : "150–220"} kcal · {w.recoveryNote}</div>
      {w.context && <div className="rounded-xl px-3 py-2 text-xs" style={{ background: T.surfaceSoft, color: T.inkSoft, border: `1px solid ${T.line}` }}>{w.context}</div>}
    </div>
  );
}

function DecisionCard({ title, points, memory }) {
  return (
    <div className="mt-2 rounded-2xl p-4" style={card}>
      {memory && <MemoryEyebrow />}
      <div className="text-sm font-semibold mb-2" style={{ color: T.greenDeep }}>{title}</div>
      <ul className="space-y-1.5">
        {points.map((p, i) => (
          <li key={i} className="text-sm flex gap-2" style={{ color: T.inkSoft }}>
            <span style={{ color: T.green }}>{p.startsWith("✓") ? "" : "•"}</span><span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Bubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} px-4`}>
      <div style={{ maxWidth: "84%" }}>
        {msg.text && (
          <div className="px-4 py-3 text-sm" style={{
            background: isUser ? T.userBubble : T.surface, color: isUser ? "#FDFBF4" : T.ink,
            borderRadius: isUser ? "20px 20px 6px 20px" : "20px 20px 20px 6px",
            boxShadow: isUser ? "none" : cardShadow, border: isUser ? "none" : `1px solid ${T.line}`,
            lineHeight: 1.6, whiteSpace: "pre-line",
          }}>{msg.text}</div>
        )}
        {msg.card?.kind === "briefing" && <BriefingCard focus={msg.card.focus} oneThing={msg.card.oneThing} memoryNote={msg.card.memoryNote} />}
        {msg.card?.kind === "report" && <ReportCard r={msg.card.r} />}
        {msg.card?.kind === "photo" && (
          <div className="rounded-2xl overflow-hidden ml-auto" style={{ width: 170, boxShadow: cardShadow }}>
            <div className="flex items-center justify-center" style={{ height: 120, background: msg.card.photo.bg, fontSize: 52 }}>{msg.card.photo.emoji}</div>
            <div className="px-3 py-2 text-xs font-medium" style={{ background: T.userBubble, color: "#FDFBF4" }}>📷 Photo</div>
          </div>
        )}
        {msg.card?.kind === "meal" && <MealCard food={msg.card.food} />}
        {msg.card?.kind === "workout" && <WorkoutCard w={msg.card.w} />}
        {msg.card?.kind === "decision" && <DecisionCard title={msg.card.title} points={msg.card.points} memory={msg.card.memory} />}
      </div>
    </div>
  );
}

/* ---------------- COACH screen: conversation is the app ---------------- */

function CoachScreen({ messages, typing, onSend, onUsual, onWorkoutChip, onPhoto, decisionChips, onKb, kbOpen }) {
  const [input, setInput] = useState("");
  const [starter, setStarter] = useState(null); // null | eat | train | ask
  const [sheet, setSheet] = useState(null);
  const [photoIdx, setPhotoIdx] = useState(0);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const send = (t) => { const v = (t ?? input).trim(); if (!v) return; onSend(v); setInput(""); setStarter(null); };
  const snap = () => {
    setSheet("analyzing");
    setTimeout(() => {
      const p = MOCK_PHOTOS[photoIdx % MOCK_PHOTOS.length];
      setPhotoIdx((i) => i + 1); setSheet(null); onPhoto(p);
    }, 1300);
  };
  const nextPhoto = MOCK_PHOTOS[photoIdx % MOCK_PHOTOS.length];

  const STARTERS = [
    { id: "eat", label: "🍽 Ate something" },
    { id: "train", label: "🏋 Worked out" },
    { id: "photo", label: "📸 Share photo" },
    { id: "ask", label: "🤔 Ask coach" },
  ];

  return (
    <div className="relative flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.map((m) => <Bubble key={m.id} msg={m} />)}
        {typing && (
          <div className="px-4">
            <div className="inline-flex gap-1 px-4 py-3 rounded-2xl" style={{ background: T.surface, border: `1px solid ${T.line}` }}>
              {[0, 1, 2].map((i) => <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: T.inkFaint, animationDelay: `${i * 120}ms` }} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* quick starters — hidden while the keyboard is up */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto items-center" style={{ scrollbarWidth: "none", display: kbOpen ? "none" : "flex" }}>
        {starter === null && STARTERS.map((s) => (
          <button key={s.id}
            onClick={() => (s.id === "photo" ? setSheet("preview") : setStarter(s.id))}
            className="whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-medium"
            style={{ background: T.surfaceSoft, color: T.greenDeep, border: `1px solid ${T.line}` }}>
            {s.label}
          </button>
        ))}
        {starter !== null && (
          <button onClick={() => setStarter(null)} aria-label="Back" className="rounded-full px-3 py-2 text-xs font-semibold flex-shrink-0" style={{ background: "#EFEAE0", color: T.inkSoft }}>‹</button>
        )}
        {starter === "eat" && USUALS.map((u) => (
          <button key={u.label} onClick={() => { onUsual(u); setStarter(null); }} className="whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-medium" style={{ background: T.greenTint, color: T.greenDeep, border: "1px solid #D3DFCF" }}>{u.label}</button>
        ))}
        {starter === "train" && WORKOUT_CHIPS.map((w) => (
          <button key={w.label} onClick={() => { onWorkoutChip(w); setStarter(null); }} className="whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-medium" style={{ background: T.greenTint, color: T.greenDeep, border: "1px solid #D3DFCF" }}>{w.label}</button>
        ))}
        {starter === "ask" && decisionChips.map((c) => (
          <button key={c} onClick={() => send(c)} className="whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-medium" style={{ background: T.greenTint, color: T.greenDeep, border: "1px solid #D3DFCF" }}>{c}</button>
        ))}
      </div>

      <div className="px-4 pt-1" style={{ paddingBottom: kbOpen ? 10 : "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}>
        <div className="flex items-center gap-2 rounded-full pl-2 pr-2 py-2" style={{ background: T.surface, border: `1px solid ${T.line}`, boxShadow: cardShadow }}>
          <button onClick={() => setSheet("preview")} aria-label="Share a photo" className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: T.greenTint }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.greenDeep} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
            </svg>
          </button>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
            onFocus={() => setTimeout(() => endRef.current?.scrollIntoView({ block: "end" }), 300)}
            placeholder="Just talk — I'll remember." className="flex-1 bg-transparent outline-none" style={{ color: T.ink, fontSize: 16 }} aria-label="Message your coach" />
          <button onClick={() => send()} aria-label="Send" className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: T.greenDeep }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 12h14M13 6l6 6-6 6" stroke="#FDFBF4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>

      {sheet && (
        <div className="absolute inset-0 z-20 flex flex-col justify-end" style={{ background: "rgba(44,42,37,0.5)" }} onClick={() => sheet === "preview" && setSheet(null)}>
          <div className="rounded-t-3xl p-5" style={{ background: T.surface }} onClick={(e) => e.stopPropagation()}>
            {sheet === "preview" ? (
              <>
                <div className="text-sm font-semibold mb-3" style={{ color: T.ink }}>Share a photo</div>
                <div className="rounded-2xl flex items-center justify-center" style={{ height: 170, background: nextPhoto.bg, fontSize: 60, border: `1px solid ${T.line}` }}>{nextPhoto.emoji}</div>
                <p className="text-xs mt-3 mb-4" style={{ color: T.inkFaint }}>Food, gym selfie, body check, inspo — I'll figure out which.</p>
                <div className="flex gap-2">
                  <button onClick={() => setSheet(null)} className="flex-1 rounded-full py-3 text-sm font-medium" style={{ background: T.surfaceSoft, color: T.inkSoft, border: `1px solid ${T.line}` }}>Cancel</button>
                  <button onClick={snap} className="flex-1 rounded-full py-3 text-sm font-medium" style={{ background: T.greenDeep, color: "#FDFBF4" }}>Snap</button>
                </div>
              </>
            ) : (
              <div className="py-8 flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full animate-spin" style={{ border: `3px solid ${T.greenTint}`, borderTopColor: T.greenDeep }} />
                <div className="text-sm" style={{ color: T.inkSoft }}>Looking…</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- JOURNAL: calendar + day timeline ---------------- */


function Calendar({ journal, selected, onSelect, monthIdx, setMonthIdx, todayKey }) {
  const M = MONTHS[monthIdx];
  const firstDow = new Date(M.y, M.m, 1).getDay();
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: M.days }, (_, i) => i + 1)];
  const typeColor = { workout: T.greenDeep, meal: T.amber, photo: "#B0A893" };

  return (
    <div className="rounded-3xl p-4" style={card}>
      <div className="flex items-center justify-between mb-3 px-1">
        <button onClick={() => setMonthIdx(Math.max(0, monthIdx - 1))} disabled={monthIdx === 0} aria-label="Previous month"
          className="w-8 h-8 rounded-full text-sm" style={{ color: monthIdx === 0 ? T.line : T.inkSoft }}>‹</button>
        <div className="text-sm font-semibold" style={{ color: T.ink, fontFamily: FONT_HEAD }}>{M.label}</div>
        <button onClick={() => setMonthIdx(Math.min(MONTHS.length - 1, monthIdx + 1))} disabled={monthIdx === MONTHS.length - 1} aria-label="Next month"
          className="w-8 h-8 rounded-full text-sm" style={{ color: monthIdx === MONTHS.length - 1 ? T.line : T.inkSoft }}>›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} className="text-xs" style={{ color: T.inkFaint }}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const key = dkey(M.y, M.m, d);
          const data = journal[key];
          const isSel = key === selected;
          const isToday = key === todayKey;
          const future = key > todayKey;
          const types = data ? [...new Set(data.entries.map((e) => e.type))].filter((t) => typeColor[t]) : [];
          return (
            <button key={i} onClick={() => !future && onSelect(key)} disabled={future}
              className="flex flex-col items-center rounded-xl py-1.5"
              style={{
                background: isSel ? T.greenDeep : "transparent",
                opacity: future ? 0.3 : 1,
                border: isToday && !isSel ? `1.5px solid ${T.greenDeep}` : "1.5px solid transparent",
              }}>
              <span className="text-sm" style={{ color: isSel ? "#FDFBF4" : T.ink }}>{d}</span>
              <span className="flex gap-0.5 h-1.5 mt-0.5">
                {types.slice(0, 3).map((t) => <span key={t} className="w-1 h-1 rounded-full" style={{ background: isSel ? "#FDFBF4" : typeColor[t] }} />)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EntryRow({ e, isLast, onAction }) {
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(e.detail);

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0" style={{ background: e.type === "photo" ? T.amberTint : T.greenTint }}>{e.emoji}</div>
        {!isLast && <div className="w-px flex-1 my-1" style={{ background: T.line }} />}
      </div>
      <div className="flex-1 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold" style={{ color: T.ink }}>{e.label}</span>
              <span className="text-xs" style={{ color: T.inkFaint }}>{e.time}</span>
            </div>
            {editing ? (
              <div className="flex gap-2 mt-1">
                <input value={val} onChange={(ev) => setVal(ev.target.value)} className="flex-1 text-xs rounded-lg px-2 py-1.5 outline-none" style={{ background: T.surfaceSoft, border: `1px solid ${T.line}`, color: T.ink }} />
                <button onClick={() => { onAction("edit", e.id, val); setEditing(false); }} className="text-xs font-semibold" style={{ color: T.greenDeep }}>Save</button>
              </div>
            ) : (
              <div className="text-xs mt-0.5" style={{ color: T.inkSoft }}>{e.detail}</div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => setMenu(!menu)} aria-label="Entry options" className="w-7 h-7 rounded-full text-sm" style={{ color: T.inkFaint }}>⋯</button>
            {menu && (
              <div className="absolute right-0 top-8 z-10 rounded-xl overflow-hidden" style={{ ...card, minWidth: 110 }}>
                {["Edit", "Move", "Delete"].map((a) => (
                  <button key={a} onClick={() => { setMenu(false); a === "Edit" ? setEditing(true) : onAction(a.toLowerCase(), e.id); }}
                    className="block w-full text-left px-4 py-2.5 text-sm" style={{ color: a === "Delete" ? "#A0522D" : T.ink }}>{a}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function JournalScreen({ journal, onEntryAction, todayKey }) {
  const [monthIdx, setMonthIdx] = useState(MONTHS.length - 1);
  const [selected, setSelected] = useState(todayKey);
  useEffect(() => { setSelected(todayKey); }, [todayKey]);
  const day = journal[selected];
  const nice = new Date(selected + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="h-full overflow-y-auto px-4 pb-6 space-y-4">
      <div className="pt-2">
        <h1 className="text-3xl" style={{ fontFamily: FONT_HEAD, fontWeight: 550, color: T.ink }}>Journal</h1>
        <p className="text-xs mt-1" style={{ color: T.inkFaint }}>You talked. Becoming organized.</p>
      </div>

      <Calendar journal={journal} selected={selected} onSelect={setSelected} monthIdx={monthIdx} setMonthIdx={setMonthIdx} todayKey={todayKey} />

      <div className="rounded-3xl p-5" style={card}>
        <div className="text-sm font-semibold mb-4" style={{ color: T.ink }}>{nice}{selected === todayKey ? " · Today" : ""}</div>
        {day ? (
          <>
            {day.entries.map((e, i) => <EntryRow key={e.id} e={e} isLast={i === day.entries.length - 1} onAction={(a, id, v) => onEntryAction(selected, a, id, v)} />)}
            <div className="rounded-xl px-3 py-2.5 text-sm mt-1" style={{ background: T.surfaceSoft, color: T.inkSoft, border: `1px solid ${T.line}`, lineHeight: 1.5 }}>
              <span className="font-semibold" style={{ color: T.greenDeep }}>Coach note · </span>{day.note}
            </div>
          </>
        ) : (
          <p className="text-sm" style={{ color: T.inkFaint }}>Nothing here yet — just talk to me and this day fills itself in.</p>
        )}
      </div>
    </div>
  );
}

/* ---------------- ME: body model + observations + week story ---------------- */

function MeScreen({ observations }) {
  return (
    <div className="h-full overflow-y-auto px-4 pb-6 space-y-4">
      <div className="pt-2">
        <h1 className="text-3xl" style={{ fontFamily: FONT_HEAD, fontWeight: 550, color: T.ink }}>Me</h1>
        <p className="text-xs mt-1" style={{ color: T.inkFaint }}>What Becoming knows</p>
      </div>

      {/* body model — only the strongest insights */}
      <div className="rounded-3xl p-5" style={card}>
        <div className="text-sm font-semibold mb-4" style={{ color: T.ink }}>Body Model</div>
        <div className="space-y-3.5">
          {BODY_MODEL.map((b, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="text-lg">{b.icon}</span>
              <div className="flex-1">
                <p className="text-sm" style={{ color: T.ink, lineHeight: 1.5 }}>{b.text}</p>
                <div className="flex gap-2 mt-1 items-center">
                  <Tag tone={b.confidence === "Solid" ? "green" : "faint"}>{b.confidence}</Tag>
                  <span className="text-xs" style={{ color: T.inkFaint }}>{b.evidence}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* perceived body changes — any body part, connected over time */}
      <div className="rounded-3xl p-5" style={card}>
        <div className="text-sm font-semibold mb-1" style={{ color: T.ink }}>Body observations</div>
        <p className="text-xs mb-4" style={{ color: T.inkFaint }}>What you've noticed, remembered for you</p>
        <div className="space-y-3">
          {observations.map((o, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="text-xs mt-0.5 whitespace-nowrap" style={{ color: T.inkFaint }}>{o.date}</span>
              <p className="text-sm flex-1" style={{ color: T.ink }}>"{o.text}"</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl px-3 py-2.5 text-xs mt-4" style={{ background: T.greenTint, color: T.greenDeep, lineHeight: 1.5 }}>
          3 positive observations in 10 days. Perceived change usually shows up before measured change — you're seeing real signal.
        </div>
      </div>

      {/* week story — one recommendation only */}
      <div className="rounded-3xl p-5" style={{ background: `linear-gradient(150deg, ${T.greenDeep}, ${T.green})`, boxShadow: "0 14px 34px rgba(61,87,67,0.3)" }}>
        <div className="text-xs uppercase tracking-wide mb-1" style={{ color: "#CFE0CC", letterSpacing: "0.1em" }}>This week</div>
        <div className="text-4xl mb-1" style={{ fontFamily: FONT_HEAD, color: "#FDFBF4", fontWeight: 550 }}>92%</div>
        <div className="text-xs mb-4" style={{ color: "#CFE0CC" }}>consistency — best week this month</div>
        <ul className="space-y-1 mb-4">
          {["Trained 5 days · 2 dance nights", "Protein met 6 of 7 days", "Waist stable through 2 social dinners"].map((w, i) => (
            <li key={i} className="text-sm flex gap-2" style={{ color: "#DCE8D9" }}><span>✓</span>{w}</li>
          ))}
        </ul>
        <p className="text-sm mb-4" style={{ color: "#FDFBF4" }}>Pattern: you snack more after upper-body days — never after glute days.</p>
        <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(253,251,244,0.12)", border: "1px solid rgba(253,251,244,0.2)" }}>
          <div className="text-xs mb-0.5" style={{ color: "#CFE0CC" }}>The one move</div>
          <div className="text-sm" style={{ color: "#FDFBF4" }}>20 g protein in the afternoon on upper-body days. That's it.</div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- app ---------------- */

const seedMessages = [
  { id: "m1", role: "coach", text: "Good morning — Day 12.", card: { kind: "briefing" } },
  { id: "m2", role: "coach", text: "My call today: back this afternoon · ~45 min, snack at 5.\nWant the why — or just tell me about your day?" },
];

let uid = 100;
const nid = () => `m${uid++}`;

export default function App() {
  const [tab, setTab] = useState("coach");
  const [messages, setMessages] = useState(seedMessages);
  const [journal, setJournal] = useState(SEED_JOURNAL);
  const [day, setDay] = useState({ kcalLow: 510, kcalHigh: 680, protein: 37, proteinMeals: 1 });
  const [todayKey, setTodayKey] = useState(TODAY_KEY);
  const [dayIndex, setDayIndex] = useState(() => {
    const start = loadLS("becoming_start", null);
    if (!start) return 12;
    const ms = new Date(TODAY_KEY + "T12:00:00") - new Date(start + "T12:00:00");
    return Math.max(1, Math.round(ms / 86400000) + 1);
  });
  // day index anchored to first-use date (seeded 11 days back for the demo story)
  const startKeyRef = useRef(loadLS("becoming_start", null) || (() => { const k = shiftKey(TODAY_KEY, -11); saveLS("becoming_start", k); return k; })());
  const prompted = useRef({});
  const [kbOpen, setKbOpen] = useState(false);
  // keep the app frame sized to the visible viewport (above the keyboard on iOS)
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const sync = () => {
      document.documentElement.style.setProperty("--app-h", vv.height + "px");
      setKbOpen(window.innerHeight - vv.height > 120); // keyboard covers >120px => open
    };
    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    return () => { vv.removeEventListener("resize", sync); vv.removeEventListener("scroll", sync); };
  }, []);

  /* iOS keyboard fix: keep the app exactly as tall as the visible area,
     so the composer always sits right above the keyboard */
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const fit = () => {
      document.documentElement.style.setProperty("--app-h", vv.height + "px");
      window.scrollTo(0, 0);
    };
    fit();
    vv.addEventListener("resize", fit);
    vv.addEventListener("scroll", fit);
    return () => { vv.removeEventListener("resize", fit); vv.removeEventListener("scroll", fit); };
  }, []);
  const lastMeal = useRef(null);
  const lastWorkout = useRef(null); // one nudge per slot per day
  const [observations, setObservations] = useState([
    { date: "Jun 29", text: "Waist looked smaller in the mirror" },
    { date: "Jun 27", text: "Glutes fuller — jeans fit different" },
    { date: "Jun 24", text: "Shoulders more defined after push day" },
  ]);
  const [typing, setTyping] = useState(false);
  const actionCount = useRef(0);
  const proactiveIdx = useRef(0);

  const pushCoach = (payload, delay = 700) => {
    setTyping(true);
    setTimeout(() => { setTyping(false); setMessages((m) => [...m, { id: nid(), role: "coach", ...payload }]); }, delay);
  };

  /* the coach speaks first: every few actions, surface a notice */
  const maybeProactive = () => {
    actionCount.current += 1;
    if (actionCount.current % 3 === 0 && proactiveIdx.current < PROACTIVE.length) {
      const notice = PROACTIVE[proactiveIdx.current++];
      setTimeout(() => pushCoach({ text: notice }, 400), 2200);
    }
  };

  const addJournal = (entry) => {
    setJournal((j) => ({
      ...j,
      [todayKey]: { note: j[todayKey]?.note || "In progress.", entries: [...(j[todayKey]?.entries || []), entry] },
    }));
  };

  const applyFood = (f, label = "Meal") => {
    setDay((d) => ({ ...d, kcalLow: d.kcalLow + f.lo, kcalHigh: d.kcalHigh + f.hi, protein: d.protein + f.p, proteinMeals: d.proteinMeals + (f.p >= 15 ? 1 : 0) }));
    const entry = J("meal", "🍽️", label, `${f.items.join(", ")} · ~${f.lo}–${f.hi} kcal · ${f.p} g protein`, "now", { lo: f.lo, hi: f.hi, p: f.p });
    lastMeal.current = { id: entry.id, label, food: { ...f, breakdown: [...(f.breakdown || [])] } };
    addJournal(entry);
  };

  const updateJournalEntry = (id, patch) => {
    setJournal((j) => ({
      ...j,
      [todayKey]: { ...j[todayKey], entries: (j[todayKey]?.entries || []).map((e) => (e.id === id ? { ...e, ...patch } : e)) },
    }));
  };

  const mealReplyText = (f) => {
    const totalP = day.protein + f.p;
    const nth = day.proteinMeals + (f.p >= 15 ? 1 : 0);
    if (f.p >= 15) return `Nice — protein-rich meal #${nth} today. ~${totalP} g now.\nDays like this usually mean quiet evening cravings for you.`;
    if (f.tags.includes("Treat — fits the day")) return "Enjoy it — seriously. One treat changes nothing, and your trend proves it.";
    return `Logged. ~${totalP} g so far — the 5pm protein snack is still the move.`;
  };

  const logWorkout = (group, min, label) => {
    const shown = label || group;
    const emoji = MUSCLES.find((m) => m.group === group)?.emoji || "🏋️";
    const b = burnFor(group, min);
    const entry = J("workout", emoji, shown, `~${min} min · ~${b[0]}–${b[1]} kcal`, "now");
    lastWorkout.current = { id: entry.id, group, label: shown, min };
    addJournal(entry);
    const notes = {
      "Back": { recoveryNote: "Ready again Saturday", context: "2nd back session this week — right on rhythm." },
      "Chest & shoulders": { recoveryNote: "Ready again Saturday", context: "Heads up: sweet cravings usually hit ~9pm after chest day. Plan a snack, don't fight it." },
      "Glutes & legs": { recoveryNote: "Ready again Sunday", context: "Glutes take ~3 days for you. Leg work off until then." },
      "Hip hop": { recoveryNote: "Light on muscles", context: "Dance days are your best-mood days — 5 for 5." },
      "Swimming": { recoveryNote: "Active recovery", context: "Zero interference with tonight. Good pick." },
      "Walk": { recoveryNote: "No recovery cost", context: "Counts more than people think." },
    };
    const n = notes[group] || { recoveryNote: "Logged" };
    pushCoach({ text: group === "Chest & shoulders" ? "Logged — one prediction:" : "Logged.", card: { kind: "workout", w: { group: shown, min, emoji, burn: b, ...n } } });
    maybeProactive();
  };

  const handleUsual = (u) => {
    setMessages((m) => [...m, { id: nid(), role: "user", text: u.label }]);
    applyFood(u.food, u.label.slice(u.label.indexOf(" ") + 1));
    pushCoach({ text: mealReplyText(u.food), card: { kind: "meal", food: u.food } }, 500);
    maybeProactive();
  };

  const handleWorkoutChip = (w) => {
    setMessages((m) => [...m, { id: nid(), role: "user", text: `${w.label.slice(w.label.indexOf(" ") + 1)} today.` }]);
    logWorkout(w.group, w.min);
  };

  /* photos: coach infers context — food / selfie / body check / inspo */
  const handlePhoto = (p) => {
    setMessages((m) => [...m, { id: nid(), role: "user", card: { kind: "photo", photo: p } }]);
    if (p.kind === "food") {
      applyFood(p.food);
      pushCoach({ text: `${p.guess}\n${mealReplyText(p.food)}`, card: { kind: "meal", food: p.food } }, 1000);
    } else if (p.kind === "selfie") {
      addJournal(J("photo", "🤳", "Gym selfie", "Attached to today's session", "now"));
      pushCoach({ text: "Gym selfie — attached to today's session in your journal.\nYou look strong. Noted the good mood too." }, 900);
    } else if (p.kind === "bodycheck") {
      addJournal(J("photo", "🪞", "Body check", "Saved to your body timeline", "now"));
      setObservations((o) => [{ date: "Today", text: "Body check photo — waist reads leaner vs Jun 18" }, ...o]);
      pushCoach({ text: "Saved to your body timeline.\nVs your June 18 photo: waist reads slightly leaner, glutes fuller — matches what you told me last week." }, 1100);
    } else {
      pushCoach({
        text: "Strong lines, lean waist, built glutes — basically your stated goal.",
        card: { kind: "decision", memory: true, title: "How that look is built", points: ["Glute-focused lower body + dance — your split already matches", "The lean waist is steady protein over months, not restriction", "You're closer than you think: waist stable, 12 days consistent"] },
      }, 1100);
    }
    maybeProactive();
  };

  /* chat-native editing: "actually it was 3 eggs" */
  /* corrections in plain language: "you forgot avocado", "actually 3 eggs",
     "it was 30 mins", "it was jazz not hip hop", "delete that" */
  const handleCorrection = (text) => {
    const l = text.toLowerCase();

    if (/delete|remove/.test(l)) {
      const victim = lastMeal.current || lastWorkout.current;
      if (victim) {
        setJournal((j) => ({ ...j, [todayKey]: { ...j[todayKey], entries: (j[todayKey]?.entries || []).filter((e) => e.id !== victim.id) } }));
        if (lastMeal.current && victim.id === lastMeal.current.id) {
          const f = lastMeal.current.food;
          setDay((d) => ({ ...d, kcalLow: d.kcalLow - f.lo, kcalHigh: d.kcalHigh - f.hi, protein: d.protein - f.p }));
          lastMeal.current = null;
        } else lastWorkout.current = null;
      }
      pushCoach({ text: "Done, deleted \u2014 like it never happened \ud83d\ude09" });
      return;
    }

    // --- workout corrections first: duration or style ---
    const mins = l.match(/(\d+)\s*(?:min|mins|minutes)/);
    const wk = parseWorkout(text);
    if (lastWorkout.current && (mins || wk)) {
      const cur = lastWorkout.current;
      const newMin = mins ? parseInt(mins[1]) : cur.min;
      const newLabel = wk && wk.label !== cur.label && !mins ? wk.label : (wk && wk.label !== "Dance" && wk.label !== cur.label ? wk.label : cur.label);
      const group = wk ? wk.group : cur.group;
      const b = burnFor(group, newMin);
      lastWorkout.current = { ...cur, min: newMin, label: newLabel, group };
      updateJournalEntry(cur.id, { label: newLabel, detail: `~${newMin} min \u00b7 ~${b[0]}\u2013${b[1]} kcal` });
      pushCoach({ text: `Fixed \u2014 ${newLabel.toLowerCase()}, ${newMin} min \u00b7 ~${b[0]}\u2013${b[1]} kcal. Journal updated.` });
      return;
    }

    // --- meal corrections: add missed items, adjust quantities, or replace ---
    if (lastMeal.current) {
      const cur = lastMeal.current;
      const eggs = l.match(/(\d+)\s*eggs/);
      const parsed = parseFood(text);
      const isAdd = /forgot|missed|also|add |plus |and a /.test(l);
      const isReplace = /actually|it was|make it/.test(l) && !isAdd;

      const applyPatch = (food, verb) => {
        updateJournalEntry(cur.id, { detail: `${food.items.join(", ")} \u00b7 ~${food.lo}\u2013${food.hi} kcal \u00b7 ${food.p} g protein`, lo: food.lo, hi: food.hi, p: food.p });
        lastMeal.current = { ...cur, food };
        pushCoach({ text: verb, card: { kind: "meal", food } });
      };

      if (eggs && cur.food.breakdown.some((b) => /egg/.test(b.name))) {
        const n = parseInt(eggs[1]);
        const old = cur.food.breakdown.find((b) => /egg/.test(b.name));
        const neu = { name: `${n} eggs`, lo: n * 70, hi: n * 80, p: n * 6 };
        const food = rebuildMeal(cur.food.breakdown.map((b) => (/egg/.test(b.name) ? neu : b)));
        setDay((d) => ({ ...d, kcalLow: d.kcalLow - old.lo + neu.lo, kcalHigh: d.kcalHigh - old.hi + neu.hi, protein: d.protein - old.p + neu.p }));
        applyPatch(food, `Fixed \u2014 ${n} eggs. Updated:`);
        return;
      }

      if (parsed && isAdd) {
        const food = rebuildMeal([...cur.food.breakdown, ...parsed.breakdown]);
        setDay((d) => ({ ...d, kcalLow: d.kcalLow + parsed.lo, kcalHigh: d.kcalHigh + parsed.hi, protein: d.protein + parsed.p }));
        applyPatch(food, `My bad \u2014 added. Updated:`);
        return;
      }

      if (parsed && isReplace) {
        const oldF = cur.food;
        setDay((d) => ({ ...d, kcalLow: d.kcalLow - oldF.lo + parsed.lo, kcalHigh: d.kcalHigh - oldF.hi + parsed.hi, protein: d.protein - oldF.p + parsed.p }));
        applyPatch(parsed, "Got it \u2014 replaced. Updated:");
        return;
      }

      if (isAdd && !parsed) {
        // unknown food: log it honestly with a rough placeholder instead of ignoring it
        const name = text.replace(/you forgot|forgot|you missed|missed|also had|also|add|plus|the|a |an /gi, "").trim() || "that";
        const rough = { name: `${name} (rough est.)`, lo: 80, hi: 200, p: 3 };
        const food = rebuildMeal([...cur.food.breakdown, rough]);
        setDay((d) => ({ ...d, kcalLow: d.kcalLow + rough.lo, kcalHigh: d.kcalHigh + rough.hi, protein: d.protein + rough.p }));
        applyPatch(food, `Added \u201c${name}\u201d \u2014 I don't know it well yet, so I used a rough ~80\u2013200 kcal. Correct me anytime.`);
        return;
      }

      const slot = l.match(/(lunch|dinner|breakfast|snack)/);
      if (slot) {
        const nice = slot[1][0].toUpperCase() + slot[1].slice(1);
        updateJournalEntry(cur.id, { label: nice });
        pushCoach({ text: `Got it \u2014 moved to ${slot[1]}. Journal updated.` });
        return;
      }
    }

    pushCoach({ text: "Tell me what to fix \u2014 \u201cyou forgot avocado\u201d, \u201cactually 3 eggs\u201d, \u201cit was 30 mins\u201d all work." });
  };

  const decisionChips = ["Should I train today?", "Should I eat before dance?", "Am I actually hungry?", "What should I order tonight?", "Can I drink this latte?"];

  /* ---- time-aware engine ----
     Real app: runs on open/foreground + local notifications.
     Here: runs whenever the demo clock advances. */
  const closeDay = () => {
    const moved = (journal[todayKey]?.entries || []).filter((e) => e.type === "workout").map((e) => e.label);
    pushCoach({
      text: "And that's a wrap on today \ud83d\udc9a Here's how it went:",
      card: { kind: "report", r: {
        day: dayIndex, lo: day.kcalLow, hi: day.kcalHigh, p: day.protein,
        moved: moved.length ? moved.join(" + ") : "Rest day",
        win: day.protein >= 80 ? "You hit your protein \u2014 quietly the most important win" : "You showed up today. That counts more than you think.",
        tomorrow: moved.some((m) => /Chest|Back/.test(m)) ? "a sweet craving might visit ~9pm \u2014 have a snack ready and enjoy it." : "start with a good breakfast. It sets the whole day.",
      } },
    }, 800);
  };

  const slotNudge = (hour) => {
    const key = todayKey;
    const p = prompted.current[key] || (prompted.current[key] = {});
    const meals = (journal[key]?.entries || []).filter((e) => e.type === "meal").length;
    if (hour < 11 && !p.morning) {
      p.morning = true;
      if (meals === 0) pushCoach({ text: "Good morning \u2600\ufe0f Sleep okay?\nTell me about breakfast whenever \u2014 even just a latte counts." }, 700);
      return;
    }
    if (hour >= 11 && hour < 15 && !p.midday) {
      p.midday = true;
      if (meals <= 1) pushCoach({ text: "Hey, how\u2019s your day going? Did lunch happen yet? \ud83c\udf31" }, 700);
      return;
    }
    if (hour >= 15 && hour < 19 && !p.afternoon) {
      p.afternoon = true;
      pushCoach({ text: "Almost 5 \u2014 grab that cottage cheese \ud83d\udcaa\nTrust me, tonight-you will be really glad you did." }, 700);
      return;
    }
    if (hour >= 19 && !p.evening) {
      p.evening = true;
      closeDay();
    }
  };

  const rolloverTo = (nk) => {
    prompted.current = {};
    setTodayKey(nk);
    setDayIndex((i) => i + 1);
    setDay({ kcalLow: 0, kcalHigh: 0, protein: 0, proteinMeals: 0 });
    setJournal((j) => ({ ...j, [nk]: j[nk] || { note: "In progress.", entries: [] } }));
    pushCoach({
      text: `Good morning \u2014 Day ${dayIndex + 1}.`,
      card: { kind: "briefing",
        focus: ["Glutes ready again", "Tell me the plan when you have one"],
        oneThing: "One thing: protein at breakfast.",
        memoryNote: "Your protein tends to dip on quieter days \u2014 breakfast is the easy fix." },
    }, 800);
  };

  /* real-time awareness: checks on open, on returning to the app,
     and once a minute. No buttons, no commands. */
  useEffect(() => {
    const tick = () => {
      const nk = keyOf(effectiveDate());
      if (nk > todayKey) { rolloverTo(nk); return; }
      const nowH = new Date().getHours() + new Date().getMinutes() / 60;
      slotNudge(nowH);
    };
    tick();
    const id = setInterval(tick, 60000);
    const onVis = () => { if (document.visibilityState === "visible") tick(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", onVis); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayKey, journal, day]);

  const startNewDay = () => {
    const nk = nextKey(todayKey);
    const closing = `Yesterday closed at ~${day.kcalLow + 850}–${day.kcalHigh + 1050} kcal · ${day.protein + 50} g protein.`;
    setTodayKey(nk);
    setDayIndex((i) => i + 1);
    setDay({ kcalLow: 0, kcalHigh: 0, protein: 0, proteinMeals: 0 });
    setJournal((j) => ({ ...j, [nk]: j[nk] || { note: "In progress.", entries: [] } }));
    pushCoach({
      text: `Good morning — Day ${dayIndex + 1}.\n${closing}`,
      card: {
        kind: "briefing",
        focus: ["Glutes ready again tomorrow", "No dance tonight — quiet evening"],
        oneThing: "One thing: protein early.",
        memoryNote: "On rest-ish days your protein tends to dip — breakfast is where it's easiest to lock in.",
      },
    }, 900);
  };

  const tryLLM = async (text) => {
    try {
      const history = messages
        .slice(-10)
        .map((m) => ({ role: m.role === "coach" ? "assistant" : "user", content: m.text || (m.card ? "[shared a card]" : "") }))
        .filter((m) => m.content);
      history.push({ role: "user", content: text });
      const entries = journal[todayKey]?.entries || [];
      const context = {
        day: dayIndex,
        time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        kcalLow: day.kcalLow, kcalHigh: day.kcalHigh, protein: day.protein,
        meals: entries.filter((e) => e.type === "meal").map((e) => `${e.label}: ${e.detail}`),
        workouts: entries.filter((e) => e.type === "workout").map((e) => `${e.label} (${e.detail})`),
      };
      const r = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, context }),
      });
      if (!r.ok) return false;
      const data = await r.json();
      const raw = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
      const out = JSON.parse(raw.replace(/```json|```/g, "").trim());
      if (!out.reply) return false;
      setTyping(false);
      applyLLM(out);
      return true;
    } catch (e) {
      console.warn("Coach brain offline — using local rules.", e);
      return false;
    }
  };

  const applyLLM = (out) => {
    const a = out.action;
    const danceish = (t) => /dance|hip hop|jazz|ballet|kpop|heels|salsa|contemporary/i.test(t || "");
    if (a?.type === "log_meal" && a.items?.length) {
      const food = rebuildMeal(a.items);
      if (a.tags?.length) food.tags = a.tags;
      applyFood(food, a.label || "Meal");
      pushCoach({ text: out.reply, card: { kind: "meal", food } }, 250);
      return;
    }
    if (a?.type === "update_last_meal" && a.items?.length && lastMeal.current) {
      const cur = lastMeal.current, oldF = cur.food;
      const food = rebuildMeal(a.items);
      if (a.tags?.length) food.tags = a.tags;
      setDay((d) => ({ ...d, kcalLow: d.kcalLow - oldF.lo + food.lo, kcalHigh: d.kcalHigh - oldF.hi + food.hi, protein: d.protein - oldF.p + food.p }));
      updateJournalEntry(cur.id, { detail: `${food.items.join(", ")} \u00b7 ~${food.lo}\u2013${food.hi} kcal \u00b7 ${food.p} g protein`, lo: food.lo, hi: food.hi, p: food.p });
      lastMeal.current = { ...cur, food };
      pushCoach({ text: out.reply, card: { kind: "meal", food } }, 250);
      return;
    }
    if (a?.type === "log_workout") {
      const min = a.min || 45;
      const b = a.burnLo ? [a.burnLo, a.burnHi || a.burnLo + 60] : burnFor(a.group || "Back", min);
      const emoji = danceish(a.label) ? "\ud83d\udc83" : /swim/i.test(a.label || "") ? "\ud83c\udfca" : /walk/i.test(a.label || "") ? "\ud83d\udeb6" : /glute|leg/i.test(a.label || "") ? "\ud83c\udf51" : "\ud83c\udfcb\ufe0f";
      const entry = J("workout", emoji, a.label || "Workout", `~${min} min \u00b7 ~${b[0]}\u2013${b[1]} kcal`, "now");
      lastWorkout.current = { id: entry.id, group: a.group || a.label || "Workout", label: a.label || "Workout", min };
      addJournal(entry);
      pushCoach({ text: out.reply, card: { kind: "workout", w: { group: a.label || "Workout", min, emoji, burn: b, recoveryNote: a.recovery || "Logged", context: a.note || null } } }, 250);
      return;
    }
    if (a?.type === "update_last_workout" && lastWorkout.current) {
      const cur = lastWorkout.current;
      const min = a.min || cur.min, label = a.label || cur.label;
      const b = a.burnLo ? [a.burnLo, a.burnHi || a.burnLo + 60] : burnFor(cur.group, min);
      updateJournalEntry(cur.id, { label, detail: `~${min} min \u00b7 ~${b[0]}\u2013${b[1]} kcal` });
      lastWorkout.current = { ...cur, min, label };
      pushCoach({ text: out.reply }, 250);
      return;
    }
    if (a?.type === "body_observation" && a.text) {
      setObservations((o) => [{ date: "Today", text: a.text }, ...o]);
      addJournal(J("obs", "\ud83e\ude9e", `\u201c${a.text}\u201d`, "Saved to progress", "now"));
      pushCoach({ text: out.reply }, 250);
      return;
    }
    if (a?.type === "delete_last") {
      handleCorrection("delete that");
      return;
    }
    pushCoach({ text: out.reply }, 250);
  };

  const handleSend = async (text) => {
    setMessages((m) => [...m, { id: nid(), role: "user", text }]);
    maybeProactive();
    setTyping(true);
    const ok = await tryLLM(text);
    if (!ok) { setTyping(false); localBrain(text); }
  };

  /* offline fallback brain (rules). The real brain is /api/coach (Claude). */
  const localBrain = (text) => {
    const intent = classifyIntent(text);
    const say = (t, cardObj) => pushCoach(cardObj ? { text: t, card: cardObj } : { text: t });

    switch (intent) {
      case "newday":
        startNewDay();
        return;
      case "correct": handleCorrection(text); return;
      case "logFood": {
        const f = parseFood(text); applyFood(f);
        say(mealReplyText(f), { kind: "meal", food: f }); return;
      }
      case "logWorkout": {
        const w = parseWorkout(text); logWorkout(w.group, w.min, w.label); return;
      }
      case "bodyWorry":
        say("You don't have to hold this in your head — I do:", {
          kind: "decision", memory: true, title: "You raised this 3 days ago too",
          points: ["✓ Protein up since then (84 → 91 g)", "✓ Training fully consistent", "✓ Yesterday you said your waist looked smaller", "Salty dinner last night — this fades within 2 days, every time."],
        });
        return;
      case "bodyObserve": {
        const part = BODY_PARTS.find((b) => text.toLowerCase().includes(b)) || "body";
        setObservations((o) => [{ date: "Today", text: text }, ...o]);
        const prior = observations.find((o) => o.text.toLowerCase().includes(part));
        say(prior
          ? `Noted — and it connects: "${prior.text}" (${prior.date}).\nTwo sightings in ten days. That's signal, not noise.`
          : "Noted — added to your body timeline. I'll connect it to what you notice next.");
        return;
      }
      case "vent":
        say("Fair. Which kind of tired?\nSore → recovery talking, rest wins.\nSleepy → also rest.\nJust meh → 20 min of back, leave whenever.");
        return;
      case "share":
        say("Strong lines, lean waist, built glutes — basically your stated goal.", {
          kind: "decision", memory: true, title: "How that look is built",
          points: ["Glute-focused lower body + dance — your split matches", "Lean waist = steady protein over months, not restriction", "You're closer than you think: 12 days consistent"],
        });
        return;
      case "celebrate": say("Love that. Noted — 4th 'felt great' moment this week.\nDays like this are why the trend looks good."); return;
      case "reflect": say("Good observation — matches what I've been seeing.\nWant me to add it to your Body Model?"); return;
      case "craving": say("Quick test: would cottage cheese sound good?\nYes → real hunger, eat.\nOnly chips → emotional — probably the post-upper-body pattern."); return;
      case "compare": say("Vs last week: training 5 → 5, protein 84 → 91 g, waist stable.\nNot slipping. Compounding."); return;
      case "brainstorm": say("Worth exploring. Describe it — I'll pressure-test it against your patterns."); return;
      case "anxiety": say(`Probably not. Trained today, ${day.protein} g protein, waist stable through 2 social dinners.\nOne snack doesn't move a trend. Patterns do — yours is good.`); return;
      case "recommend":
        say("My call:", {
          kind: "decision", memory: true, title: "Train back · ~45 min",
          points: ["Glutes: day 1 of 3 recovery", "Back: most rested, 4 days", "Keeps legs fresh for hip hop at 7", "Fuel: cottage cheese at 5"],
        });
        return;
      case "hunger":
        say("Honest check:", {
          kind: "decision", memory: true, title: "Hunger or craving?",
          points: ["Cottage cheese sounds good? → real hunger. Eat.", "Only sweets? → your post-upper-body pattern.", `${day.protein} g so far — if real, go protein-first.`],
        });
        return;
      case "timing": say("Yes — eat before. Cottage cheese or protein bar ~5.\nSkipped 3 of 4 times; 10pm hunger won every time."); return;
      case "overate": say(`~${day.kcalLow}–${day.kcalHigh} kcal on a training day — well within range.\nWaist stable 3 weeks. One day never moves a trend.`); return;
      case "order": say("Order what sounds good, anchored with a protein — your winning move all month.\nArrive not-starving. Skip the table math."); return;
      case "treatok": say(`Yes. ~120–180 kcal at ${day.protein} g protein on a training day. It fits.`); return;
      case "ask": say("Good question — one more detail and I'll make the call with you."); return;
      default: {
        const variants = [
          "I'm listening. A thought, a worry, a win, a plan — it all counts.",
          "Tell me more — I'll do the organizing.",
          "Go on — I'm taking notes so you don't have to.",
        ];
        say(variants[Math.floor(Math.random() * variants.length)]);
      }
    }
  };

  /* journal edit menu actions */
  const handleEntryAction = (dateKey, action, id, value) => {
    setJournal((j) => {
      const dayData = j[dateKey]; if (!dayData) return j;
      let entries = [...dayData.entries];
      if (action === "delete") entries = entries.filter((e) => e.id !== id);
      if (action === "edit") entries = entries.map((e) => (e.id === id ? { ...e, detail: value } : e));
      if (action === "move") {
        const slots = ["Breakfast", "Lunch", "Dinner", "Snack"];
        entries = entries.map((e) => {
          if (e.id !== id) return e;
          const cur = slots.indexOf(e.label);
          return cur >= 0 ? { ...e, label: slots[(cur + 1) % slots.length] } : e;
        });
      }
      return { ...j, [dateKey]: { ...dayData, entries } };
    });
  };

  const NavIcon = ({ id, label, path }) => (
    <button onClick={() => setTab(id)} className="flex flex-col items-center gap-1 flex-1 py-1" aria-label={label} aria-current={tab === id ? "page" : undefined}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={tab === id ? T.greenDeep : T.inkFaint} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg>
      <span className="text-xs font-medium" style={{ color: tab === id ? T.greenDeep : T.inkFaint }}>{label}</span>
    </button>
  );

  return (
    <div className="w-full flex items-center justify-center" style={{ background: "#E9E3D6", fontFamily: FONT_BODY, minHeight: "var(--app-h, 100dvh)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..650&family=Instrument+Sans:wght@400;500;600&display=swap');
        * { -webkit-tap-highlight-color: transparent; }
        .phone-frame { height: 100dvh; height: var(--app-h, 100dvh); border-radius: 0; }
        @media (min-width: 441px) { .phone-frame { height: min(var(--app-h, 100dvh), 880px); border-radius: 36px; } }
        .bottom-nav { padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 10px); }
        ::-webkit-scrollbar { display: none; }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
        button:focus-visible, input:focus-visible { outline: 2px solid ${T.greenDeep}; outline-offset: 2px; border-radius: 8px; }
      `}</style>

      <div className="phone-frame w-full flex flex-col overflow-hidden" style={{ maxWidth: 420, background: T.bg, boxShadow: "0 30px 80px rgba(50,42,25,0.25)" }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <div className="text-2xl" style={{ fontFamily: FONT_HEAD, fontWeight: 600, color: T.greenDeep }}>Becoming</div>
            <div className="text-xs" style={{ color: T.inkFaint }}>Just talk. I remember everything.</div>
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold" style={{ background: T.greenTint, color: T.greenDeep }}>B</div>
        </div>

        <div className="flex-1 min-h-0">
          {tab === "coach" && <CoachScreen messages={messages} typing={typing} onSend={handleSend} onUsual={handleUsual} onWorkoutChip={handleWorkoutChip} onPhoto={handlePhoto} decisionChips={decisionChips} onKb={setKbOpen} kbOpen={kbOpen} />}
          {tab === "journal" && <JournalScreen journal={journal} onEntryAction={handleEntryAction} todayKey={todayKey} />}
          {tab === "me" && <MeScreen observations={observations} />}
        </div>

        <div className="bottom-nav flex px-2 pt-2" style={{ background: T.surface, borderTop: `1px solid ${T.line}`, display: kbOpen ? "none" : "flex" }}>
          <NavIcon id="coach" label="Coach" path="M21 12a8 8 0 0 1-8 8H5l-2 2V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z" />
          <NavIcon id="journal" label="Journal" path="M4 4h13a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4zM4 4v18M9 9h6M9 13h6" />
          <NavIcon id="me" label="Me" path="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
        </div>
      </div>
    </div>
  );
}
