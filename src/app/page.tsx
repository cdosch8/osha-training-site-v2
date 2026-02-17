"use client";

import React, { useEffect, useMemo, useState } from "react";

type Route =
  | { name: "home" }
  | { name: "courses" }
  | { name: "course"; courseId: string }
  | { name: "dashboard" }
  | { name: "player"; courseId: string }
  | { name: "admin" };

type AppState = {
  user: null | { id: string; name: string; email: string };
  purchases: { courses: string[]; bundles: string[] };
  progress: Record<
    string,
    { moduleIndex: number; completedModules: number[]; quizUnlocked: boolean; completedAt?: string }
  >;
  quizResults: Record<string, { passed: boolean; answers: Record<string, number>; completedAt?: string | null }>;
};

type QuizQ = { id: string; prompt: string; choices: string[]; correctIndex: number };

function uid() {
  return Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);
}
function q(prompt: string, choices: string[], correctIndex: number): QuizQ {
  return { id: uid(), prompt, choices, correctIndex };
}

function forkliftQuiz(): QuizQ[] {
  return [
    q("Before operating a forklift, you should:", ["Skip inspection if you’re in a hurry", "Complete a pre-use inspection", "Only check the horn"], 1),
    q("A forklift’s load capacity is found on:", ["The operator’s phone", "The data/capacity plate", "The warehouse door"], 1),
    q("When driving with a load, you should keep the load:", ["As high as possible", "Low and tilted back slightly", "Balanced on one fork"], 1),
    q("If your view is blocked by the load, you should:", ["Drive in reverse (if safe) or use a spotter", "Go faster", "Close one eye"], 0),
    q("Forklifts are most likely to tip when:", ["Turning too fast", "Driving slowly", "Parked with brake set"], 0),
    q("Pedestrians near forklifts should:", ["Assume the driver sees them", "Make eye contact and stay clear", "Walk under raised forks"], 1),
    q("If you find a major defect during inspection, you should:", ["Operate carefully anyway", "Tag out and report it", "Hide it"], 1),
    q("The safest place for forks when parked is:", ["Raised high", "Lowered to the ground", "Pointed at people"], 1),
  ];
}
function mewpQuiz(): QuizQ[] {
  return [
    q("Before using a MEWP, you should:", ["Do a pre-start inspection", "Start immediately", "Ignore the manual"], 0),
    q("On many boom lifts, fall protection usually means:", ["No harness needed", "Harness + lanyard to approved anchor", "Holding the rail"], 1),
    q("If the ground is soft or uneven, you should:", ["Proceed anyway", "Reposition / improve ground conditions", "Drive faster"], 1),
    q("A spotter is helpful when:", ["There are overhead hazards or tight spaces", "You want to text", "You’re alone"], 0),
    q("You should NEVER:", ["Use guardrails", "Stand on rails or use ladders on the platform", "Wear PPE"], 1),
    q("If winds or weather become unsafe, you should:", ["Keep going", "Stop work and lower the platform", "Go higher"], 1),
    q("An emergency lowering system is used to:", ["Play music", "Bring the platform down during an emergency", "Increase speed"], 1),
    q("The safest approach to obstacles is:", ["Move slowly and keep clearances", "Hit them gently", "Ignore them"], 0),
  ];
}
function fallQuiz(): QuizQ[] {
  return [
    q("A ‘competent person’ is someone who:", ["Can identify hazards and has authority to correct them", "Is the newest employee", "Works remotely"], 0),
    q("Guardrails are used to:", ["Create a fall hazard", "Prevent falls by providing a barrier", "Hold tools"], 1),
    q("A PFAS includes:", ["Harness, connector, and anchorage", "Only a hard hat", "Just safety glasses"], 0),
    q("Swing fall risk increases when:", ["You work far to the side of the anchor", "You are directly under the anchor", "You stay within the safe zone"], 0),
    q("Hole covers should be:", ["Unmarked and loose", "Strong enough and secured", "Made of cardboard"], 1),
    q("A rescue plan should be:", ["Optional and never discussed", "Planned before the work starts", "Made after an incident"], 1),
    q("If you see an unsafe fall hazard, the competent person should:", ["Ignore it", "Stop work and fix the issue", "Wait a week"], 1),
    q("The best way to reduce fall risk is:", ["Eliminate or guard the hazard first", "Rely only on luck", "Remove training"], 0),
  ];
}
function trenchQuiz(): QuizQ[] {
  return [
    q("OSHA excavation requirements are found in:", ["1926 Subpart P", "1910.95", "NFPA 70"], 0),
    q("A competent person must inspect excavations:", ["Only once a month", "Daily and as conditions change", "Never"], 1),
    q("The main purpose of sloping/shoring/shielding is to:", ["Prevent cave-ins", "Make the trench look nicer", "Store materials"], 0),
    q("Spoil piles should be kept:", ["Right at the edge", "Back from the edge", "Inside the trench"], 1),
    q("If water is accumulating in a trench, you should:", ["Continue work", "Control water and reassess safety", "Jump in"], 1),
    q("Safe access/egress means:", ["Climb the dirt wall", "Use ladders/ramps as required", "No exit needed"], 1),
    q("Utility strikes are prevented by:", ["Locating utilities and potholing carefully", "Guessing", "Skipping markings"], 0),
    q("If you see cracking, sloughing, or movement, you should:", ["Enter anyway", "Stop work and re-evaluate", "Take a photo and proceed"], 1),
  ];
}

type Course = {
  id: string;
  title: string;
  short: string;
  durationMinutes: number;
  price: number;
  tags: string[];
  osha: string;
  audience: string;
  modules: { title: string; minutes: number; content: string }[];
  quiz: QuizQ[];
};

const COURSES: Course[] = [
  {
    id: "forklift-class7",
    title: "Class 7 Forklift Operator Training",
    short: "Fast, OSHA-aligned training for Class 7 forklift operators (≈45 minutes).",
    durationMinutes: 45,
    price: 39,
    tags: ["Forklift", "OSHA 1910.178"],
    osha: "OSHA 29 CFR 1910.178 (Powered Industrial Trucks)",
    audience: "Operators and supervisors needing forklift operator training (Class 7).",
    modules: [
      { title: "Welcome & How This Works", minutes: 3, content: "What you will learn, course flow, and completion requirements." },
      { title: "Forklift Basics", minutes: 7, content: "Controls, stability basics, and why forklifts tip." },
      { title: "Pre-Use Inspection", minutes: 8, content: "Daily checks, defects, and when to tag-out." },
      { title: "Safe Operation", minutes: 10, content: "Speed, turns, horns, visibility, and pedestrian awareness." },
      { title: "Load Handling", minutes: 10, content: "Capacity plate, load center, lifting/lowering, stacking." },
      { title: "Common Jobsite Hazards", minutes: 7, content: "Ramps, docks, uneven surfaces, overhead hazards." },
    ],
    quiz: forkliftQuiz(),
  },
  {
    id: "mewp-boom-scissor",
    title: "MEWP Training – Boom & Scissor Lifts",
    short: "Simple, practical MEWP training (≈45 minutes) for scissor lifts and boom lifts.",
    durationMinutes: 45,
    price: 39,
    tags: ["MEWP", "1926.453", "ANSI A92"],
    osha: "OSHA 29 CFR 1926.453 (Aerial lifts) + ANSI A92 overview",
    audience: "Workers operating boom lifts or scissor lifts, and competent supervisors.",
    modules: [
      { title: "Welcome & Key Rules", minutes: 4, content: "What this training covers and when to stop work." },
      { title: "MEWP Types", minutes: 6, content: "Scissor vs boom: where each is used and main hazards." },
      { title: "Pre-Start Inspection", minutes: 8, content: "Walk-around, controls, alarms, and documentation." },
      { title: "Fall Protection & Tie-Off", minutes: 9, content: "Harness basics, anchor points, and what NOT to do." },
      { title: "Safe Driving & Positioning", minutes: 10, content: "Ground conditions, slopes, potholes, and obstacles." },
      { title: "Rescue Basics", minutes: 8, content: "Emergency lowering, spotters, and calling for help." },
    ],
    quiz: mewpQuiz(),
  },
  {
    id: "fall-protection-competent",
    title: "Fall Protection Competent Person (OSHA 1926)",
    short: "Competent person essentials for fall hazards and controls (≈45 minutes).",
    durationMinutes: 45,
    price: 59,
    tags: ["Competent Person", "Subpart M"],
    osha: "OSHA 29 CFR 1926 Subpart M (Fall Protection)",
    audience: "Field leaders designated as fall protection competent person.",
    modules: [
      { title: "What ‘Competent Person’ Means", minutes: 6, content: "Authority, responsibilities, and daily expectations." },
      { title: "When Fall Protection Is Required", minutes: 8, content: "Common thresholds and typical construction scenarios." },
      { title: "Guardrails & Covers", minutes: 8, content: "Basics, frequent misses, and inspection points." },
      { title: "Personal Fall Arrest Systems", minutes: 10, content: "Fit, anchorage basics, swing fall, clearance." },
      { title: "Planning & Rescue", minutes: 7, content: "Pre-task planning, rescue readiness, and documentation." },
      { title: "Quick Field Checklist", minutes: 6, content: "Simple checklist you can use immediately." },
    ],
    quiz: fallQuiz(),
  },
  {
    id: "trench-excavation-competent",
    title: "Trench & Excavation Competent Person (OSHA 1926)",
    short: "Competent person training for trenches/excavations under Subpart P (≈45 minutes).",
    durationMinutes: 45,
    price: 59,
    tags: ["Competent Person", "Subpart P"],
    osha: "OSHA 29 CFR 1926 Subpart P (Excavations)",
    audience: "Field leaders designated to inspect excavations and protective systems.",
    modules: [
      { title: "Competent Person Duties", minutes: 6, content: "Inspections, authority to stop work, documentation." },
      { title: "Soil Basics & Classification", minutes: 8, content: "Type A/B/C concepts and why it matters." },
      { title: "Protective Systems", minutes: 12, content: "Sloping, benching, shoring, shielding: when to use." },
      { title: "Access/Egress & Inspections", minutes: 8, content: "Ladders, ramps, and daily/trigger inspections." },
      { title: "Utilities, Water, Atmospheres", minutes: 7, content: "Preventing strikes, water control, and air hazards." },
      { title: "Field ‘Do Not Enter’ Triggers", minutes: 4, content: "Clear stop-work cues for safe decisions." },
    ],
    quiz: trenchQuiz(),
  },
];

const BUNDLES = [
  { id: "bundle-forklift-mewp", title: "Forklift + MEWP Bundle", includes: ["forklift-class7", "mewp-boom-scissor"], price: 59, badge: "Best Value" },
  { id: "bundle-all", title: "All Courses Bundle", includes: ["forklift-class7", "mewp-boom-scissor", "fall-protection-competent", "trench-excavation-competent"], price: 149, badge: "Complete" },
];

const OSHA_NOTE =
  "This course provides OSHA-aligned online training. Employers must provide site-specific training, evaluate worker/operator competency, and document evaluation as required by OSHA.";

const LS_KEY = "osha_training_site_state_v3";
function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function saveState(state: AppState) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {}
}
function defaultState(): AppState {
  return { user: null, purchases: { courses: [], bundles: [] }, progress: {}, quizResults: {} };
}

function money(n: number) { return `$${n.toFixed(2)}`; }
function courseById(id: string) { return COURSES.find((c) => c.id === id); }
function bundleById(id: string) { return BUNDLES.find((b) => b.id === id); }
function isOwned(app: AppState, courseId: string) {
  if (app.purchases.courses.includes(courseId)) return true;
  for (const bid of app.purchases.bundles) {
    const b = bundleById(bid);
    if (b?.includes.includes(courseId)) return true;
  }
  return false;
}
function progressPercent(course: Course, prog?: { completedModules: number[]; quizUnlocked: boolean }) {
  const total = course.modules.length + 1;
  const doneModules = prog?.completedModules?.length || 0;
  const quizDone = prog?.quizUnlocked ? 1 : 0;
  return Math.round(((doneModules + quizDone) / total) * 100);
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700">{children}</span>;
}
function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{children}</span>;
}
function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">{children}</div>;
}
function CardHeader({ title, subtitle, right }: { title: React.ReactNode; subtitle?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 p-5">
      <div className="space-y-1">
        <div className="text-lg font-semibold">{title}</div>
        {subtitle ? <div className="text-sm text-slate-600">{subtitle}</div> : null}
      </div>
      {right}
    </div>
  );
}
function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="px-5 pb-5">{children}</div>;
}
function Button({ children, onClick, variant = "primary", disabled = false }: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "outline" | "ghost"; disabled?: boolean }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition";
  const styles =
    variant === "primary"
      ? "bg-slate-900 text-white hover:bg-slate-800"
      : variant === "outline"
        ? "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
        : "bg-transparent text-slate-900 hover:bg-slate-100";
  const dis = disabled ? "opacity-50 pointer-events-none" : "";
  return (
    <button className={`${base} ${styles} ${dis}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export default function Page() {
  const [app, setApp] = useState<AppState>(defaultState());
  const [route, setRoute] = useState<Route>({ name: "home" });
  const [checkout, setCheckout] = useState<null | { type: "course" | "bundle"; id: string }>(null);

  useEffect(() => {
    const loaded = loadState();
    if (loaded) setApp({ ...defaultState(), ...loaded });
  }, []);
  useEffect(() => { saveState(app); }, [app]);

  const initials = useMemo(() => {
    if (!app.user?.name) return "U";
    return app.user.name.split(" ").slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  }, [app.user]);

  function nav(r: Route) {
    setRoute(r);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function login() {
    setApp((p) => ({ ...p, user: { id: "u1", name: "Chris", email: "you@example.com" } }));
    nav({ name: "dashboard" });
  }
  function logout() {
    setApp((p) => ({ ...p, user: null }));
    nav({ name: "home" });
  }
  function purchase(item: { type: "course" | "bundle"; id: string }) {
    setApp((prev) => {
      const next = structuredClone(prev);
      if (item.type === "course") {
        if (!next.purchases.courses.includes(item.id)) next.purchases.courses.push(item.id);
      } else {
        if (!next.purchases.bundles.includes(item.id)) next.purchases.bundles.push(item.id);
      }
      return next;
    });
    setCheckout(null);
    nav({ name: "dashboard" });
  }

  return (
    <div className="min-h-screen">
      <TopNav route={route} nav={nav} app={app} initials={initials} onLogin={login} onLogout={logout} />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6">
        {route.name === "home" && <Home app={app} nav={nav} openCheckout={setCheckout} />}
        {route.name === "courses" && <Courses app={app} nav={nav} openCheckout={setCheckout} />}
        {route.name === "course" && <CourseDetail app={app} courseId={route.courseId} nav={nav} openCheckout={setCheckout} />}
        {route.name === "dashboard" && <Dashboard app={app} nav={nav} />}
        {route.name === "player" && <Player app={app} setApp={setApp} courseId={route.courseId} nav={nav} />}
        {route.name === "admin" && <Admin app={app} />}
      </main>

      <CheckoutModal app={app} item={checkout} close={() => setCheckout(null)} purchase={purchase} />

      <footer className="border-t border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-white">🛡️</span>
            <span>OSHA Online Training (MVP). Replace mock payments/auth for production.</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="hover:text-slate-900" onClick={() => alert(OSHA_NOTE)}>OSHA note</button>
            <span>•</span>
            <button className="hover:text-slate-900" onClick={() => alert("Contact: support@oshaonlinetraining.com")}>Contact</button>
            <span>•</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TopNav({ route, nav, app, initials, onLogin, onLogout }: { route: Route; nav: (r: Route) => void; app: AppState; initials: string; onLogin: () => void; onLogout: () => void }) {
  const links: { label: string; route: Route; auth?: boolean }[] = [
    { label: "Home", route: { name: "home" } },
    { label: "Courses", route: { name: "courses" } },
    { label: "Dashboard", route: { name: "dashboard" }, auth: true },
    { label: "Admin", route: { name: "admin" }, auth: true },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <button className="flex items-center gap-3" onClick={() => nav({ name: "home" })} aria-label="Go home">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow">🛡️</div>
          <div className="text-left">
            <div className="text-sm font-semibold leading-none">OSHA Online Training</div>
            <div className="text-xs text-slate-600">Forklift • MEWP • Competent Person</div>
          </div>
        </button>

        <nav className="hidden items-center gap-2 md:flex">
          {links.filter((l) => !l.auth || !!app.user).map((l) => (
            <Button key={l.label} variant={route.name === l.route.name ? "outline" : "ghost"} onClick={() => nav(l.route)}>
              {l.label}
            </Button>
          ))}
        </nav>

        {!app.user ? (
          <Button onClick={onLogin}>Sign in</Button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm md:flex">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold">{initials}</span>
              <span>{app.user.name}</span>
            </div>
            <Button variant="outline" onClick={onLogout}>Sign out</Button>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 md:hidden">
        <div className="mx-auto max-w-6xl px-4 py-2">
          <div className="flex flex-wrap gap-2">
            {links.filter((l) => !l.auth || !!app.user).map((l) => (
              <Button key={l.label} variant={route.name === l.route.name ? "outline" : "ghost"} onClick={() => nav(l.route)}>
                {l.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

function Home({ app, nav, openCheckout }: { app: AppState; nav: (r: Route) => void; openCheckout: (v: any) => void }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader
            title={<div className="text-2xl md:text-3xl">Short. Simple. OSHA-aligned.</div>}
            subtitle="45-minute online trainings with an easy 8-question quiz. Miss a question? Retake it right away."
          />
          <CardBody>
            <div className="space-y-4">
              <p className="text-slate-600">{OSHA_NOTE}</p>
              <div className="flex flex-wrap gap-2">
                <Chip>Forklift (Class 7)</Chip>
                <Chip>MEWP (Boom + Scissor)</Chip>
                <Chip>Fall Protection Competent Person</Chip>
                <Chip>Trench/Excavation Competent Person</Chip>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={() => nav({ name: "courses" })}>Browse courses</Button>
                <Button variant="outline" onClick={() => openCheckout({ type: "bundle", id: "bundle-forklift-mewp" })}>
                  Buy Forklift + MEWP bundle
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="What you get" />
          <CardBody>
            <div className="space-y-3 text-sm text-slate-700">
              <Feature title="Fast completion" desc="Designed for ≈45 minutes total." />
              <Feature title="Easy quiz" desc="8 questions. Retry instantly if wrong." />
              <Feature title="Certificates" desc="Button stub in MVP (wire up PDF later)." />
              <Feature title="Resume anytime" desc="Progress saved in your dashboard." />
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                Tip: Sign in to track progress and certificates.
              </div>
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Bundles" />
          <CardBody>
            <div className="space-y-3">
              {BUNDLES.map((b) => (
                <div key={b.id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{b.title}</div>
                      {b.badge ? <Badge>{b.badge}</Badge> : null}
                    </div>
                    <div className="text-sm text-slate-600">
                      Includes {b.includes.length} course{b.includes.length === 1 ? "" : "s"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{money(b.price)}</div>
                    <div className="mt-2">
                      <Button onClick={() => openCheckout({ type: "bundle", id: b.id })}>Buy</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="How it works" />
          <CardBody>
            <div className="space-y-3 text-sm text-slate-700">
              <Step n={1} title="Buy a course or bundle" desc="Purchase one training or bundle multiple." />
              <Step n={2} title="Complete modules" desc="Short sections, simple language, jobsite-focused." />
              <Step n={3} title="Take the quiz" desc="8 easy questions. Retake immediately if wrong." />
              <Step n={4} title="Download certificate" desc="Certificate appears in your dashboard (PDF later)." />
              <div className="pt-2">
                <Button variant="outline" onClick={() => nav({ name: "courses" })}>View courses</Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-3">
      <div className="font-medium">{title}</div>
      <div className="text-slate-600">{desc}</div>
    </div>
  );
}
function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 p-3">
      <div className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold">{n}</div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-slate-600">{desc}</div>
      </div>
    </div>
  );
}

function Courses({ app, nav, openCheckout }: { app: AppState; nav: (r: Route) => void; openCheckout: (v: any) => void }) {
  const [query, setQuery] = useState("");
  const [ownedOnly, setOwnedOnly] = useState(false);

  const filtered = useMemo(() => {
    const qq = query.trim().toLowerCase();
    return COURSES.filter((c) => {
      if (ownedOnly && !isOwned(app, c.id)) return false;
      if (!qq) return true;
      const blob = `${c.title} ${c.short} ${c.tags.join(" ")} ${c.osha}`.toLowerCase();
      return blob.includes(qq);
    });
  }, [query, ownedOnly, app]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Courses</h1>
          <p className="text-slate-600">Pick a course or buy a bundle. Progress saves automatically.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200 sm:w-[320px]"
            placeholder="Search: forklift, MEWP, Subpart M..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <input type="checkbox" checked={ownedOnly} onChange={(e) => setOwnedOnly(e.target.checked)} />
            Show owned
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((c) => {
          const owned = isOwned(app, c.id);
          return (
            <Card key={c.id}>
              <CardHeader
                title={<div className="text-xl">{c.title}</div>}
                subtitle={c.short}
                right={
                  <div className="text-right">
                    <div className="text-lg font-semibold">{money(c.price)}</div>
                    <div className="text-xs text-slate-600">≈{c.durationMinutes} min</div>
                  </div>
                }
              />
              <CardBody>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">{c.tags.map((t) => <Badge key={t}>{t}</Badge>)}</div>
                  <div className="text-sm">
                    <span className="font-medium">OSHA:</span> <span className="text-slate-700">{c.osha}</span>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button variant="outline" onClick={() => nav({ name: "course", courseId: c.id })}>Details</Button>
                    {owned ? (
                      <Button onClick={() => nav({ name: "player", courseId: c.id })}>Start / Resume</Button>
                    ) : (
                      <Button onClick={() => openCheckout({ type: "course", id: c.id })}>Buy</Button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader title="Bundles" />
        <CardBody>
          <div className="grid gap-3 md:grid-cols-2">
            {BUNDLES.map((b) => (
              <div key={b.id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{b.title}</div>
                    {b.badge ? <Badge>{b.badge}</Badge> : null}
                  </div>
                  <div className="text-sm text-slate-600">
                    Includes: {b.includes.map((id) => courseById(id)?.title).filter(Boolean).join(" • ")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{money(b.price)}</div>
                  <div className="mt-2">
                    <Button onClick={() => openCheckout({ type: "bundle", id: b.id })}>Buy</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function CourseDetail({ app, courseId, nav, openCheckout }: { app: AppState; courseId: string; nav: (r: Route) => void; openCheckout: (v: any) => void }) {
  const c = courseById(courseId);
  if (!c) return <div className="text-slate-600">Course not found.</div>;
  const owned = isOwned(app, c.id);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{c.title}</h1>
          <p className="text-slate-600">{c.short}</p>
          <div className="flex flex-wrap gap-2">{c.tags.map((t) => <Badge key={t}>{t}</Badge>)}</div>
        </div>

        <Card>
          <CardBody>
            <div className="w-full space-y-3 md:w-[320px]">
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-semibold">{money(c.price)}</div>
                <div className="text-sm text-slate-600">≈{c.durationMinutes} min</div>
              </div>
              <div className="text-sm text-slate-600">Includes modules + quiz + certificate.</div>
              {owned ? (
                <Button onClick={() => nav({ name: "player", courseId: c.id })}>Start / Resume</Button>
              ) : (
                <Button onClick={() => openCheckout({ type: "course", id: c.id })}>Buy this course</Button>
              )}
              <Button variant="outline" onClick={() => nav({ name: "courses" })}>Back to courses</Button>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Course outline" subtitle={<span><span className="font-medium">OSHA reference:</span> {c.osha}</span>} />
        <CardBody>
          <div className="text-sm text-slate-600">Audience: {c.audience}</div>
          <div className="mt-4 space-y-2">
            {c.modules.map((m, idx) => (
              <div key={idx} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 p-4">
                <div>
                  <div className="font-medium">{idx + 1}. {m.title}</div>
                  <div className="text-sm text-slate-600">{m.content}</div>
                </div>
                <Badge>{m.minutes} min</Badge>
              </div>
            ))}
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="font-medium">Final quiz</div>
              <div className="text-sm text-slate-600">8 easy questions. If you miss one, you retake that question immediately.</div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function Dashboard({ app, nav }: { app: AppState; nav: (r: Route) => void }) {
  if (!app.user) {
    return (
      <Card>
        <CardHeader title="Sign in to access your dashboard" subtitle="Use the Sign in button in the top-right (mock sign-in in MVP)." />
        <CardBody>
          <div className="text-slate-600">After sign-in you can resume courses and view certificate buttons.</div>
        </CardBody>
      </Card>
    );
  }

  const ownedCourseIds = COURSES.filter((c) => isOwned(app, c.id)).map((c) => c.id);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-slate-600">Resume courses and download certificates (PDF later).</p>
        </div>
        <div className="text-sm text-slate-600">{app.user.email}</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Your courses" />
          <CardBody>
            <div className="space-y-3">
              {ownedCourseIds.length === 0 ? (
                <div className="text-sm text-slate-600">No courses purchased yet. Go to Courses to get started.</div>
              ) : (
                ownedCourseIds.map((id) => {
                  const c = courseById(id)!;
                  const prog = app.progress?.[id];
                  const pct = progressPercent(c, prog);
                  const quiz = app.quizResults?.[id];
                  return (
                    <div key={id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold">{c.title}</div>
                          <div className="text-sm text-slate-600">≈{c.durationMinutes} min</div>
                        </div>
                        <Badge>{quiz?.passed ? "Completed" : "In progress"}</Badge>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full bg-slate-900" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button onClick={() => nav({ name: "player", courseId: id })}>Start / Resume</Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              if (!quiz?.passed) return alert("Finish the quiz to unlock your certificate.");
                              alert("MVP: wire up real PDF certificate generation later.");
                            }}
                          >
                            Certificate
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <Button variant="outline" onClick={() => nav({ name: "courses" })}>Browse courses</Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Purchases" />
          <CardBody>
            <div className="text-sm text-slate-600">Courses: {app.purchases.courses.length} • Bundles: {app.purchases.bundles.length}</div>
            <div className="mt-3 space-y-2">
              {app.purchases.bundles.map((bid) => {
                const b = bundleById(bid)!;
                return (
                  <div key={bid} className="rounded-2xl border border-slate-200 p-4">
                    <div className="font-semibold">{b.title}</div>
                    <div className="text-sm text-slate-600">Includes {b.includes.length} courses</div>
                  </div>
                );
              })}
              {app.purchases.courses.map((cid) => {
                const c = courseById(cid)!;
                return (
                  <div key={cid} className="rounded-2xl border border-slate-200 p-4">
                    <div className="font-semibold">{c.title}</div>
                    <div className="text-sm text-slate-600">{money(c.price)}</div>
                  </div>
                );
              })}
              {app.purchases.bundles.length === 0 && app.purchases.courses.length === 0 ? (
                <div className="text-sm text-slate-600">Nothing purchased yet.</div>
              ) : null}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Player({ app, setApp, courseId, nav }: { app: AppState; setApp: React.Dispatch<React.SetStateAction<AppState>>; courseId: string; nav: (r: Route) => void }) {
  const course = courseById(courseId);
  if (!course) return <div className="text-slate-600">Course not found.</div>;

  const owned = isOwned(app, courseId);
  const modulesLen = course.modules.length;
  const prog = app.progress?.[courseId] || { moduleIndex: 0, completedModules: [], quizUnlocked: false };
  const [tab, setTab] = useState<"learn" | "quiz">("learn");

  useEffect(() => {
    if (!owned) return;
    setApp((prev) => {
      const next = structuredClone(prev);
      next.progress = next.progress || {};
      if (!next.progress[courseId]) next.progress[courseId] = { moduleIndex: 0, completedModules: [], quizUnlocked: false };
      return next;
    });
  }, [owned, courseId, setApp]);

  if (!owned) {
    return (
      <Card>
        <CardHeader title="Purchase required" subtitle="You need to purchase this course to access the training." />
        <CardBody>
          <Button variant="outline" onClick={() => nav({ name: "course", courseId })}>Back to course page</Button>
        </CardBody>
      </Card>
    );
  }

  const current = course.modules[prog.moduleIndex] || course.modules[0];
  const pct = progressPercent(course, prog);
  const quizPassed = app.quizResults?.[courseId]?.passed;

  function markComplete() {
    setApp((prev) => {
      const next = structuredClone(prev);
      const p = next.progress[courseId];
      const idx = p.moduleIndex;
      if (!p.completedModules.includes(idx)) p.completedModules.push(idx);
      if (p.completedModules.length >= modulesLen) p.quizUnlocked = true;
      p.moduleIndex = Math.min(modulesLen - 1, idx + 1);
      return next;
    });
  }

  function goToModule(i: number) {
    setApp((prev) => {
      const next = structuredClone(prev);
      next.progress[courseId].moduleIndex = i;
      return next;
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{course.title}</h1>
          <p className="text-slate-600">{course.osha}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge>Progress {pct}%</Badge>
          {quizPassed ? <Badge>Completed</Badge> : null}
          <Button variant="outline" onClick={() => nav({ name: "dashboard" })}>Dashboard</Button>
        </div>
      </div>

      <Card>
        <CardBody>
          <div className="space-y-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-slate-900" style={{ width: `${pct}%` }} />
            </div>
            <div className="text-sm text-slate-600">{OSHA_NOTE}</div>
          </div>
        </CardBody>
      </Card>

      <div className="flex gap-2">
        <Button variant={tab === "learn" ? "outline" : "ghost"} onClick={() => setTab("learn")}>Training</Button>
        <Button variant={tab === "quiz" ? "outline" : "ghost"} onClick={() => setTab("quiz")}>Quiz</Button>
      </div>

      {tab === "learn" ? (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader title="Modules" />
            <CardBody>
              <div className="space-y-2">
                {course.modules.map((m, idx) => {
                  const done = prog.completedModules.includes(idx);
                  const active = prog.moduleIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => goToModule(idx)}
                      className={`w-full rounded-2xl border border-slate-200 p-3 text-left transition hover:bg-slate-50 ${active ? "bg-slate-50" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-medium">{idx + 1}. {m.title}</div>
                          <div className="text-sm text-slate-600">{m.minutes} min</div>
                        </div>
                        {done ? <span className="text-sm">✅</span> : null}
                      </div>
                    </button>
                  );
                })}
                <div className="rounded-2xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Final quiz</div>
                      <div className="text-sm text-slate-600">8 questions • instant retake</div>
                    </div>
                    <Badge>{prog.quizUnlocked ? "Unlocked" : "Locked"}</Badge>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={current.title} />
            <CardBody>
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm text-slate-600">MVP: replace this block with embedded video + captions.</div>
                  <div className="mt-3 text-base leading-relaxed">{current.content}</div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-slate-600">Mark this module complete when finished.</div>
                  <Button onClick={markComplete}>Complete module</Button>
                </div>

                {prog.quizUnlocked ? (
                  <Button variant="outline" onClick={() => setTab("quiz")}>Go to quiz</Button>
                ) : (
                  <div className="text-sm text-slate-600">Complete all modules to unlock the quiz.</div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      ) : (
        <Quiz course={course} locked={!prog.quizUnlocked} app={app} setApp={setApp} />
      )}
    </div>
  );
}

function Quiz({ course, locked, app, setApp }: { course: Course; locked: boolean; app: AppState; setApp: React.Dispatch<React.SetStateAction<AppState>> }) {
  const courseId = course.id;
  const existing = app.quizResults?.[courseId];
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<null | { ok: boolean; msg: string }>(null);

  useEffect(() => { setIdx(0); setSelected(null); setFeedback(null); }, [courseId]);

  function recordAnswer(qid: string, choiceIndex: number) {
    setApp((prev) => {
      const next = structuredClone(prev);
      next.quizResults = next.quizResults || {};
      const cur = next.quizResults[courseId] || { passed: false, answers: {}, completedAt: null };
      cur.answers[qid] = choiceIndex;
      next.quizResults[courseId] = cur;
      return next;
    });
  }

  function setPassed() {
    setApp((prev) => {
      const next = structuredClone(prev);
      next.quizResults = next.quizResults || {};
      const cur = next.quizResults[courseId] || { passed: false, answers: {}, completedAt: null };
      cur.passed = true;
      cur.completedAt = new Date().toISOString();
      next.quizResults[courseId] = cur;

      next.progress = next.progress || {};
      next.progress[courseId] = next.progress[courseId] || { moduleIndex: 0, completedModules: [], quizUnlocked: true };
      next.progress[courseId].completedAt = cur.completedAt || undefined;
      next.progress[courseId].quizUnlocked = true;
      return next;
    });
  }

  if (locked) {
    return (
      <Card>
        <CardHeader title="Quiz locked" subtitle="Complete all modules first to unlock the quiz." />
      </Card>
    );
  }

  if (existing?.passed) {
    return (
      <Card>
        <CardHeader title="Quiz complete" subtitle="You passed. Your certificate button is in your dashboard." />
        <CardBody>
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 p-4 text-sm">
              <div className="font-medium">Completion time (UTC)</div>
              <div className="text-slate-600">{existing.completedAt}</div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setApp((prev) => {
                  const next = structuredClone(prev);
                  if (next.quizResults?.[courseId]) next.quizResults[courseId] = { passed: false, answers: {}, completedAt: null };
                  return next;
                });
              }}
            >
              Retake quiz
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  const quiz = course.quiz;
  const current = quiz[idx];
  const isLast = idx === quiz.length - 1;

  function submit() {
    if (selected === null) return;
    const ok = selected === current.correctIndex;
    recordAnswer(current.id, selected);
    if (ok) {
      setFeedback({ ok: true, msg: "Correct!" });
      setTimeout(() => {
        setFeedback(null);
        setSelected(null);
        if (isLast) setPassed();
        else setIdx((v) => v + 1);
      }, 500);
    } else {
      setFeedback({ ok: false, msg: "Almost — try again." });
    }
  }

  return (
    <Card>
      <CardHeader title="Final quiz" subtitle={`Question ${idx + 1} of ${quiz.length} • Easy`} />
      <CardBody>
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="text-base font-medium">{current.prompt}</div>
            <div className="mt-4 grid gap-2">
              {current.choices.map((ch, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`rounded-2xl border border-slate-200 px-3 py-3 text-left transition hover:bg-slate-50 ${selected === i ? "bg-slate-50" : ""}`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          {feedback ? (
            <div className={`rounded-2xl border border-slate-200 p-3 text-sm ${feedback.ok ? "bg-slate-50" : ""}`}>
              <div className="font-medium">{feedback.ok ? "✅" : "❌"} {feedback.msg}</div>
              {!feedback.ok ? <div className="text-slate-600">Pick another answer and submit again.</div> : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600">You must answer each question correctly to finish.</div>
            <Button onClick={submit} disabled={selected === null}>Submit</Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function Admin({ app }: { app: AppState }) {
  if (!app.user) {
    return (
      <Card>
        <CardHeader title="Admin" subtitle="Sign in to view admin (stub)." />
      </Card>
    );
  }
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Admin (stub)" subtitle="In production, manage users, completions, certificates, exports." />
        <CardBody>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li><span className="text-slate-900 font-medium">Payments:</span> Stripe Checkout + webhooks</li>
            <li><span className="text-slate-900 font-medium">Auth:</span> Clerk/Auth0/Firebase (roles: student/admin)</li>
            <li><span className="text-slate-900 font-medium">Certificates:</span> PDF generation + unique certificate IDs + verification page</li>
            <li><span className="text-slate-900 font-medium">Content:</span> Videos, captions, downloadable handouts</li>
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}

function CheckoutModal({ app, item, close, purchase }: { app: AppState; item: null | { type: "course" | "bundle"; id: string }; close: () => void; purchase: (x: any) => void }) {
  if (!item) return null;

  const details = (() => {
    if (item.type === "course") {
      const c = courseById(item.id);
      return { title: c?.title || "Course", price: c?.price || 0, lines: [c?.title || ""], alreadyOwned: isOwned(app, item.id) };
    }
    const b = bundleById(item.id);
    return { title: b?.title || "Bundle", price: b?.price || 0, lines: (b?.includes || []).map((id) => courseById(id)?.title || ""), alreadyOwned: app.purchases.bundles.includes(item.id) };
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Checkout</div>
            <div className="text-sm text-slate-600">Mock checkout for MVP. Stripe goes here later.</div>
          </div>
          <button className="rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-100" onClick={close} aria-label="Close">✕</button>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold">{details.title}</div>
              <div className="text-sm text-slate-600">Includes modules + quiz + certificate</div>
            </div>
            <div className="text-lg font-semibold">{money(details.price)}</div>
          </div>
          <div className="mt-3 space-y-1 text-sm text-slate-600">
            {details.lines.filter(Boolean).map((l, i) => (
              <div key={i}>• {l}</div>
            ))}
          </div>
        </div>

        {details.alreadyOwned ? (
          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm">
            <div className="font-medium">Already owned</div>
            <div className="text-slate-600">You already have access. Close and start from your dashboard.</div>
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={close}>Cancel</Button>
          <Button
            disabled={details.alreadyOwned}
            onClick={() => {
              if (!app.user) return alert("Please sign in first (top right). In production, Stripe can create an account after purchase.");
              purchase(item);
            }}
          >
            Pay & unlock
          </Button>
        </div>

        <div className="mt-3 text-xs text-slate-500">
          Production: Stripe Checkout supports cards + Apple Pay/Google Pay, and PayPal if enabled/available in your Stripe account.
        </div>
      </div>
    </div>
  );
}
