import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { BookOpen, FileText, CloudLightning, Smile, Settings2 } from "lucide-react";
import { AmbientBackground } from "./ambient-background";
import { Scrapy, ROOM_TAPE } from "./scrapy";
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

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { reduceMotion: reduce, grain, paperTone } = useScrap((s) => s.settings);

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    const tone = TONES[paperTone] ?? TONES.cream;
    const root = document.documentElement;
    root.style.setProperty("--paper", tone.paper);
    root.style.setProperty("--paper-deep", tone.deep);
    root.style.setProperty("--background", tone.bg);
  }, [paperTone]);

  const active = (to: string) => (to === "/" ? path === "/" || path.startsWith("/notes") : path.startsWith(to));
  const room = NAV.find((n) => active(n.to))?.room ?? "notes";

  return (
    <div className={cn("flex min-h-screen w-full", reduce && "reduce-motion", !grain && "no-grain")}>
      <AmbientBackground />


      <aside className="sticky top-0 flex h-screen w-[7.5rem] shrink-0 flex-col items-center gap-1 py-6 md:w-[13rem] md:items-stretch md:px-4">
        <Link to="/" className="mb-6 flex flex-col items-center gap-1 md:flex-row md:gap-2 md:pl-2">
          <Scrapy mood="greeting" tape={ROOM_TAPE[room] ?? "var(--petal)"} size={40} bob />
          <span className="hand text-3xl leading-none tracking-tight text-espresso">scrap</span>
        </Link>

        <nav className="flex w-full flex-col gap-1.5">
          {NAV.map((n) => {
            const on = active(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-[4px] px-3 py-2 text-[0.95rem] transition-all",
                  on ? "text-espresso" : "text-ink-soft hover:text-espresso",
                )}
              >
                {on && (
                  <span
                    className="paper-grain absolute inset-0 -rotate-[0.6deg] rounded-[3px]"
                    style={{
                      background: "var(--paper)",
                      boxShadow: "0 6px 14px -12px color-mix(in oklab, var(--espresso) 70%, transparent)",
                      border: "1px solid color-mix(in oklab, var(--espresso) 12%, transparent)",
                    }}
                  />
                )}
                {on && (
                  <span
                    className="absolute -left-1 top-1/2 h-6 w-3 -translate-y-1/2 -rotate-12"
                    style={{ background: ROOM_TAPE[n.room], opacity: 0.9 }}
                  />
                )}
                <n.icon className="relative h-[17px] w-[17px]" strokeWidth={1.7} />
                <span className="relative hidden md:inline">{n.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden px-2 md:block">
          <p className="hand text-base leading-tight text-muted-foreground">
            a cozy little place to read, write, doodle, and remember.
          </p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 pb-10 pr-4 pt-6 md:pr-8">{children}</main>
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
    <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="hand text-4xl leading-none text-espresso">{title}</h1>
        {note && <p className="mt-1.5 text-sm text-muted-foreground">{note}</p>}
      </div>
      {right}
    </header>
  );
}
