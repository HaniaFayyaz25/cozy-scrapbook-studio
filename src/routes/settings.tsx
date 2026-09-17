import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { ScrapyHere, useTimeMood } from "@/components/scrapy";
import { actions, getState, useScrap, type ScrapState } from "@/lib/scrap-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Scrap" },
      { name: "description", content: "Customize Scrap's ambience, paper, motion, Scrapy and backups." },
      { property: "og:title", content: "Settings — Scrap" },
      { property: "og:description", content: "Customize Scrap and manage your local backup." },
    ],
  }),
  component: SettingsPage,
});

function Row({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 py-4 last:border-0">
      <div className="min-w-0">
        <p className="hand text-xl leading-none text-espresso md:text-2xl">{label}</p>
        {note && <p className="mt-1 text-[0.75rem] text-muted-foreground md:text-[0.8rem]">{note}</p>}
      </div>
      <div className="flex items-center gap-1.5">{children}</div>
    </div>
  );
}

function Choice({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "hand rounded-[4px] border px-2.5 py-1 text-base transition-colors md:px-3 md:text-lg",
        on ? "border-espresso bg-secondary text-espresso" : "border-border text-muted-foreground hover:text-espresso",
      )}
    >
      {children}
    </button>
  );
}

function SettingsPage() {
  const s = useScrap((st) => st.settings);
  const mood = useTimeMood("thinking");
  const [message, setMessage] = useState("");

  const update = (patch: Partial<typeof s>, text: string) => {
    actions.setSettings(patch);
    setMessage(text);
    window.setTimeout(() => setMessage(""), 1800);
  };

  const exportAll = () => {
    const blob = new Blob([JSON.stringify(getState(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scrap-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    setMessage("backup exported ✓");
  };

  const importAll = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as Partial<ScrapState>;
      if (!parsed || typeof parsed !== "object" || !parsed.settings || !Array.isArray(parsed.notes) || !Array.isArray(parsed.pdfs) || !parsed.ideas) {
        throw new Error("invalid backup");
      }
      actions.importState(parsed as ScrapState);
      setMessage("backup restored ✓");
    } catch {
      setMessage("that backup doesn't look right");
    }
  };

  const resetSettings = () => {
    actions.setSettings({ ambient: 1, grain: true, reduceMotion: false, scrapyOn: true, paperTone: "cream" });
    setMessage("settings reset ✓");
  };

  return (
    <div className="relative w-full max-w-3xl pb-16">
      <PageHeader title="settings" note="real controls. changes save automatically in this browser." />

      <div className="paper-card paper-grain rounded-[10px] px-5 py-2 md:px-7">
        <Row label="ambience" note="controls the little background movement and corner decoration">
          {["off", "calm", "lively"].map((l, i) => (
            <Choice key={l} on={s.ambient === i} onClick={() => update({ ambient: i }, `ambience: ${l}`)}>{l}</Choice>
          ))}
        </Row>

        <Row label="paper tone" note="changes the paper colours throughout Scrap">
          {(["cream", "warm", "cool"] as const).map((t) => (
            <Choice key={t} on={s.paperTone === t} onClick={() => update({ paperTone: t }, `paper tone: ${t}`)}>{t}</Choice>
          ))}
        </Row>

        <Row label="paper grain" note="turn the paper fibre texture on or off">
          <Choice on={s.grain} onClick={() => update({ grain: true }, "paper grain: on")}>on</Choice>
          <Choice on={!s.grain} onClick={() => update({ grain: false }, "paper grain: off")}>off</Choice>
        </Row>

        <Row label="scrapy" note="show or hide your paper companion everywhere">
          <Choice on={s.scrapyOn} onClick={() => update({ scrapyOn: true }, "Scrapy: here")}>keep him</Choice>
          <Choice on={!s.scrapyOn} onClick={() => update({ scrapyOn: false }, "Scrapy: hidden")}>hide</Choice>
        </Row>

        <Row label="reduce motion" note="disables Scrap's decorative animations and transitions">
          <Choice on={s.reduceMotion} onClick={() => update({ reduceMotion: true }, "reduced motion: on")}>on</Choice>
          <Choice on={!s.reduceMotion} onClick={() => update({ reduceMotion: false }, "reduced motion: off")}>off</Choice>
        </Row>

        <Row label="your scraps" note="export everything or restore a previous Scrap backup">
          <button type="button" onClick={exportAll} className="hand rounded-[4px] border border-border px-3 py-1 text-base md:text-lg hover:bg-secondary">export</button>
          <label className="hand cursor-pointer rounded-[4px] border border-border px-3 py-1 text-base md:text-lg hover:bg-secondary">
            import
            <input type="file" accept="application/json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void importAll(f); e.target.value = ""; }} />
          </label>
        </Row>

        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <p className="hand text-xl text-espresso md:text-2xl">reset appearance</p>
            <p className="mt-1 text-[0.75rem] text-muted-foreground">restores Scrap's default ambience, paper, grain, motion and Scrapy visibility.</p>
          </div>
          <button type="button" onClick={resetSettings} className="hand rounded-[4px] border border-border px-3 py-1 text-base md:text-lg hover:bg-secondary">reset</button>
        </div>
      </div>

      <div className="mt-3 flex min-h-6 items-center justify-between px-1">
        <p aria-live="polite" className="hand text-lg text-forest">{message}</p>
        <p className="text-[0.68rem] text-muted-foreground">saved locally • no save button needed</p>
      </div>

      <ScrapyHere
        room="settings"
        mood={mood}
        prop="mug"
        size={50}
        flip
        ctx={{ tool: s.ambient === 2 ? "lively ambience" : s.ambient === 1 ? "calm ambience" : "quiet ambience" }}
        spots={["-right-6 top-16", "-right-4 bottom-16", "-left-8 top-1/2"]}
      />
    </div>
  );
}
