import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { BookOpen, FileText, CloudLightning, Smile, Settings2 } from "lucide-react";
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
  cream: { paper: "oklch(0.972 0.011 88)", deep: "oklch(0.936 0.018 84)", bg: "oklch(0.958 0.014 86)" },
  warm: { paper: "oklch(0.962 0.024 62)", deep: "oklch(0.922 0.034 58)", bg: "oklch(0.946 0.028 60)" },
  cool: { paper: "oklch(0.972 0.009 220)", deep: "oklch(0.934 0.014 224)", bg: "oklch(0.956 0.012 222)" },
};

function CornerDecor({ ambient }: { ambient: number }) {
  if (ambient === 0) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-40 select-none" style={{ opacity: ambient === 1 ? 0.38 : 0.72 }}>
      <svg viewBox="0 0 160 200" className="absolute inset-0 h-full w-full" style={{ animation: ambient === 2 ? "drift 14s ease-in-out infinite" : undefined }}>
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
  const { reduceMotion: reduce, grain, paperTone, ambient } = useScrap((s) => s.settings);

  useEffect(() => { hydrate(); }, []);

  useEffect(() => {
    const tone = TONES[paperTone] ?? TONES.cream!;
    const root = document.documentElement;
    root.style.setProperty("--paper", tone.paper);
    root.style.setProperty("--paper-deep", tone.deep);
    root.style.setProperty("--background", tone.bg);
  }, [paperTone]);

  const active = (to: string) => to === "/" ? path === "/" || path.startsWith("/notes") : path.startsWith(to);
  const room = NAV.find((n) => active(n.to))?.room ?? "notes";

  return (
    <div className={cn("flex min-h-[100dvh] w-full items-stretch justify-center p-0 md:p-1", reduce && "reduce-motion", !grain && "no-grain")} style={{ background: "var(--room)" }}>
      <div className="room paper-grain relative mx-auto flex min-h-[100dvh] w-full max-w-none flex-col overflow-hidden rounded-none p-1.5 md:rounded-[14px] md:p-2">
        <CornerDecor ambient={ambient} />

        <div className="mb-1 flex items-center justify-between pr-10 md:hidden">
          <Link to="/" className="hand text-[1.15rem] leading-none text-room-ink">scrap</Link>
          <span className="rounded-full bg-paper-deep px-2 py-0.5 text-[0.65rem] leading-none text-room-ink/70">{NAV.find((n) => n.room === room)?.label}</span>
        </div>

        <div className="relative flex min-h-0 flex-1 gap-1.5 md:gap-2">
          <aside className="hidden w-[7.5rem] shrink-0 md:block">
            <Link to="/" className="mb-1.5 flex items-center gap-1 px-1"><span className="hand text-[1.85rem] leading-none text-room-ink">scrap</span></Link>
            <nav className="flex flex-col gap-0.5">
              {NAV.map((n) => {
                const on = active(n.to);
                return <Link key={n.to} to={n.to} className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[0.78rem] transition-colors", on ? "bg-room-pill text-room-ink" : "text-room-ink/60 hover:bg-room-pill/50 hover:text-room-ink")}><n.icon className="h-[14px] w-[14px] shrink-0" strokeWidth={1.7} /><span className="truncate">{n.label}</span></Link>;
              })}
            </nav>
          </aside>

          <main className="relative min-h-0 min-w-0 flex-1 overflow-x-hidden pb-12 md:overflow-y-auto md:pb-0 md:pr-0">{children}</main>
        </div>

        <nav className="sticky bottom-0 z-30 -mx-0.5 mt-0.5 md:hidden">
          <div className="paper-card paper-grain mx-auto flex w-fit max-w-full items-center gap-0.5 rounded-full px-1 py-0.5 shadow-md">
            {NAV.map((n) => {
              const on = active(n.to);
              return <Link key={n.to} to={n.to} aria-label={n.label} className={cn("flex min-h-8 min-w-8 items-center justify-center gap-1 rounded-full px-2 py-1 text-[0.65rem] transition-colors", on ? "bg-espresso text-paper" : "text-espresso/60 hover:bg-paper-deep")}><n.icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.7} />{on && <span className="whitespace-nowrap">{n.label}</span>}</Link>;
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

export function PageHeader({ title, note, right }: { title: string; note?: string; right?: ReactNode }) {
  return <header className="mb-1.5 flex flex-wrap items-end justify-between gap-1"><div className="min-w-0"><h1 className="hand text-[1.4rem] leading-none text-room-ink md:text-[1.65rem]">{title}</h1>{note && <p className="mt-0.5 text-[0.67rem] text-room-ink/50">{note}</p>}</div>{right}</header>;
}
