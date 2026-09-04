import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { BookOpen, FileText, CloudLightning, Smile, Settings2 } from "lucide-react";
import { Scrapy, ROOM_TAPE, DraggableScrapy } from "./scrapy";
import { hydrate, useScrap } from "@/lib/scrap-store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", room: "notes", label: "notes", icon: BookOpen },
  { to: "/pdfs", room: "pdfs", label: "pdfs", icon: FileText },
  { to: "/ideas", room: "ideas", label: "idea dump", icon: CloudLightning },
  { to: "/stickers", room: "stickers", label: "stickers", icon: Smile },
  { to: "/settings", room: "settings", label: "settings", icon: Settings2 },
] as const;

const TONES: Record<string, { paper: string; deep: string; bg: string }> = {
  cream: {
    paper: "oklch(0.972 0.011 88)",
    deep: "oklch(0.936 0.018 84)",
    bg: "oklch(0.958 0.014 86)",
  },
  warm: {
    paper: "oklch(0.962 0.024 62)",
    deep: "oklch(0.922 0.034 58)",
    bg: "oklch(0.946 0.028 60)",
  },
  cool: {
    paper: "oklch(0.972 0.009 220)",
    deep: "oklch(0.934 0.014 224)",
    bg: "oklch(0.956 0.012 222)",
  },
};

function CornerDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-40 select-none">
      <svg viewBox="0 0 160 200" className="absolute inset-0 h-full w-full opacity-70">
        <g fill="none" stroke="var(--amber)" strokeWidth={1} strokeLinecap="round" opacity={0.55}>
          <path d="M156 30c-22 14-34 40-38 74" />
          <path d="M140 52c8-4 16-3 22 1" />
          <path d="M128 78c8-5 16-4 22 0" />
          <path d="M122 106c8-5 16-4 22 0" />
        </g>
        <g fill="var(--amber)" opacity={0.85}>
          <path d="M96 118l2.6 6.4 6.4 2.6-6.4 2.6L96 136l-2.6-6.4-6.4-2.6 6.4-2.6z" />
          <path d="M132 150l1.9 4.6 4.6 1.9-4.6 1.9-1.9 4.6-1.9-4.6-4.6-1.9 4.6-1.9z" />
          <path d="M112 172l1.4 3.4 3.4 1.4-3.4 1.4-1.4 3.4-1.4-3.4-3.4-1.4 3.4-1.4z" />
        </g>
      </svg>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { reduceMotion: reduce, grain, paperTone } = useScrap((s) => s.settings);

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    const tone = TONES[paperTone] ?? TONES["cream"]!;
    const root = document.documentElement;
    root.style.setProperty("--paper", tone.paper);
    root.style.setProperty("--paper-deep", tone.deep);
    root.style.setProperty("--background", tone.bg);
  }, [paperTone]);

  const active = (to: string) =>
    to === "/" ? path === "/" || path.startsWith("/notes") : path.startsWith(to);
  const room = NAV.find((n) => active(n.to))?.room ?? "notes";

  return (
    <div
      className={cn(
        "flex w-full items-start justify-center p-2 md:h-dvh md:min-h-dvh md:p-4",
        reduce && "reduce-motion",
        !grain && "no-grain",
      )}
      style={{ background: "var(--background)" }}
    >
      <div className="room paper-grain relative mx-auto flex w-full max-w-[820px] flex-col overflow-hidden rounded-[22px] p-3 md:h-full md:rounded-[26px] md:p-4">
        <CornerDecor />

        {/* scrapy peeking into the top-right corner — pick him up and move him anywhere */}
        <DraggableScrapy storageKey="scrapy-room-corner" className="right-4 top-3">
          <div className="flex items-start gap-1.5">
            <Scrapy mood="greeting" tape={ROOM_TAPE[room] ?? "var(--petal)"} size={40} bob />
            <span className="mt-1 rounded-[14px] border border-espresso/15 bg-paper px-2 py-1 text-[0.68rem] leading-tight text-espresso shadow-sm">
              ready to create?
            </span>
          </div>
        </DraggableScrapy>

        {/* mobile: calm, compact header — wordmark and current section only */}
        <div className="mb-1.5 flex items-center justify-between pr-12 md:hidden">
          <Link to="/" className="hand text-[1.2rem] leading-none text-room-ink">
            scrap
          </Link>
          <span className="rounded-full bg-paper-deep px-2.5 py-1 text-[0.68rem] leading-none text-room-ink/70">
            {NAV.find((n) => n.room === room)?.label}
          </span>
        </div>

        <div className="relative flex min-h-0 flex-1 gap-3 md:gap-4">
          <aside className="hidden w-[8.5rem] shrink-0 md:block">
            <Link to="/" className="mb-3 flex items-center gap-1.5 px-1">
              <span className="hand text-[2rem] leading-none text-room-ink">scrap</span>
              <Scrapy mood="happy" tape="var(--petal)" size={22} />
            </Link>

            <nav className="flex flex-col gap-0.5">
              {NAV.map((n) => {
                const on = active(n.to);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.8rem] transition-colors",
                      on
                        ? "bg-room-pill text-room-ink"
                        : "text-room-ink/60 hover:bg-room-pill/50 hover:text-room-ink",
                    )}
                  >
                    <n.icon className="h-[15px] w-[15px] shrink-0" strokeWidth={1.7} />
                    <span className="truncate">{n.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          <main className="relative min-w-0 flex-1 overflow-x-hidden pb-14 md:overflow-y-auto md:pb-2 md:pr-1">
            {children}
          </main>
        </div>

        {/* mobile: compact bottom nav — a taped strip of section pills */}
        <nav className="sticky bottom-0 z-30 -mx-1 mt-1 md:hidden">
          <div className="paper-card paper-grain mx-auto flex w-fit max-w-full items-center gap-0.5 rounded-full px-1.5 py-1 shadow-md">
            {NAV.map((n) => {
              const on = active(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  aria-label={n.label}
                  className={cn(
                    "flex min-h-9 min-w-9 items-center justify-center gap-1 rounded-full px-2.5 py-1.5 text-[0.68rem] transition-colors",
                    on ? "bg-espresso text-paper" : "text-espresso/60 hover:bg-paper-deep",
                  )}
                >
                  <n.icon className="h-4 w-4 shrink-0" strokeWidth={1.7} />
                  {on && <span className="whitespace-nowrap">{n.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  note,
  right,
}: {
  title: string;
  note?: string;
  right?: ReactNode;
}) {
  return (
    <header className="mb-2.5 flex flex-wrap items-end justify-between gap-2">
      <div className="min-w-0">
        <h1 className="hand text-[1.45rem] leading-none text-room-ink md:text-[1.7rem]">{title}</h1>
        {note && <p className="mt-0.5 text-[0.68rem] text-room-ink/50">{note}</p>}
      </div>
      {right}
    </header>
  );
}
