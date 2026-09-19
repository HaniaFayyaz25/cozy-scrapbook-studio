import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import {
  Bell,
  BookOpen,
  FileText,
  FolderHeart,
  Home,
  Image,
  LayoutGrid,
  Leaf,
  NotebookPen,
  Search,
  Settings2,
  Sparkles,
} from "lucide-react";
import { hydrate, useScrap } from "@/lib/scrap-store";
import { Scrapy } from "@/components/scrapy";
import { cn } from "@/lib/utils";

const TONES: Record<string, { paper: string; deep: string; bg: string }> = {
  cream: { paper: "oklch(0.972 0.011 88)", deep: "oklch(0.936 0.018 84)", bg: "oklch(0.958 0.014 86)" },
  warm: { paper: "oklch(0.962 0.024 62)", deep: "oklch(0.922 0.034 58)", bg: "oklch(0.946 0.028 60)" },
  cool: { paper: "oklch(0.972 0.009 220)", deep: "oklch(0.934 0.014 224)", bg: "oklch(0.956 0.012 222)" },
};

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

  const nav = [
    { label: "Home", icon: Home, to: "/", active: path === "/" },
    { label: "Canvas", icon: LayoutGrid, to: "/canvas", active: path === "/canvas" || path.startsWith("/notes") },
    { label: "Idea Dump", icon: Sparkles, to: "/ideas", active: path.startsWith("/ideas") },
    { label: "PDF Shelf", icon: FileText, to: "/pdfs", active: path.startsWith("/pdfs") },
    { label: "Rooms", icon: FolderHeart, to: "/rooms", active: path.startsWith("/rooms") },
    { label: "Notebooks", icon: NotebookPen, to: "/notebooks", active: path.startsWith("/notebooks") },
    { label: "Settings", icon: Settings2, to: "/settings", active: path.startsWith("/settings") },
  ];

  return (
    <div className={cn("min-h-[100dvh] w-full", reduce && "reduce-motion", !grain && "no-grain")} style={{ background: "var(--room)" }}>
      <div className="room paper-grain flex min-h-[100dvh] w-full flex-col overflow-hidden">
        <header className="grid h-[60px] shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-espresso/10 bg-paper/95 px-3 sm:px-4 md:px-6">
          <div className="flex min-w-0 items-center justify-start">
            <a href="/" aria-label="Scrap home" className="group flex items-center gap-2 rounded-xl px-1.5 py-1 transition hover:bg-paper-deep/70">
              <span className="relative hand text-[1.8rem] leading-none text-room-ink sm:text-[2rem]">
                scrap
                <span className="absolute -right-3 -top-1 text-[10px] text-forest">✿</span>
              </span>
              <span className="hidden text-[10px] tracking-wide text-room-ink/45 lg:inline">Small ideas. Big dreams. ♡</span>
            </a>
          </div>

          <a href="/rooms" aria-label="Open Main Room" className="flex shrink-0 items-center gap-2 rounded-full border border-espresso/10 bg-paper-deep/55 px-3.5 py-2 text-xs font-medium text-room-ink shadow-sm transition hover:-translate-y-px hover:bg-paper-deep hover:shadow-md sm:px-4">
            Main Room <span className="text-[10px]">⌄</span>
          </a>

          <div className="flex min-w-0 items-center justify-end gap-0.5 text-room-ink/60 sm:gap-1">
            <button
              aria-label="Toggle ambience"
              title="Toggle ambience"
              onClick={() => actions.setSettings({ ambient: ambient > 0 ? 0 : 1 })}
              className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-paper-deep hover:text-forest"
            >
              <Leaf className="h-4 w-4" />
            </button>
            <a href="/ideas" aria-label="Search ideas" title="Search" className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-paper-deep">
              <Search className="h-4 w-4" />
            </a>
            <a href="/settings" aria-label="Notifications and settings" title="Notifications" className="relative grid h-8 w-8 place-items-center rounded-full transition hover:bg-paper-deep">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-rose" />
            </a>
            <a href="/settings" aria-label="Open profile settings" title="Profile" className="grid h-8 w-8 place-items-center rounded-full border border-espresso/10 bg-paper-deep text-xs text-espresso transition hover:shadow-sm">
              H
            </a>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <aside className="hidden w-[214px] shrink-0 border-r border-espresso/10 bg-paper/88 px-3.5 py-4 md:block">
            <nav className="space-y-1">
              {nav.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.to}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] transition-all",
                      item.active ? "bg-rose/25 font-medium text-espresso shadow-sm" : "text-room-ink/60 hover:bg-paper-deep/65 hover:text-room-ink",
                    )}
                  >
                    <Icon className="h-[17px] w-[17px]" strokeWidth={1.7} />
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </nav>

            <div className="relative mt-8 min-h-[220px] overflow-hidden rounded-2xl border border-espresso/10 bg-paper-deep/55 p-4 shadow-sm">
              <div className="mb-1 flex items-center gap-2 text-xs text-room-ink/60"><BookOpen className="h-4 w-4" /> little reminder</div>
              <p className="hand max-w-[130px] text-lg leading-tight text-room-ink/80">make space for tiny ideas.</p>
              <p className="hand mt-2 text-sm text-room-ink/55">you got this &lt;3</p>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2"><Scrapy mood="happy" size={86} /></div>
            </div>
          </aside>

          <main className="min-h-0 min-w-0 flex-1 overflow-hidden">{children}</main>
        </div>

        <nav className="flex shrink-0 items-center gap-1 overflow-x-auto border-t border-espresso/10 bg-paper/95 px-2 py-2 md:hidden">
          {nav.map((item) => {
            const Icon = item.icon;
            return <a key={item.label} href={item.to} className={cn("grid min-w-[54px] shrink-0 place-items-center gap-0.5 rounded-lg px-2 py-1 text-[9px]", item.active ? "bg-rose/25 text-espresso" : "text-room-ink/55")}><Icon className="h-4 w-4" /><span>{item.label}</span></a>;
          })}
        </nav>
      </div>
    </div>
  );
}

export function PageHeader({ title, note, right }: { title: string; note?: string; right?: ReactNode }) {
  return <header className="mb-1.5 flex flex-wrap items-end justify-between gap-1"><div className="min-w-0"><h1 className="hand text-[1.4rem] leading-none text-room-ink md:text-[1.65rem]">{title}</h1>{note && <p className="mt-0.5 text-[0.67rem] text-room-ink/50">{note}</p>}</div>{right}</header>;
}
