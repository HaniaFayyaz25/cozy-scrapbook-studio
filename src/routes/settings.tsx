import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { ScrapyHere, useTimeMood } from "@/components/scrapy";
import { actions, getState, useScrap, type ScrapState } from "@/lib/scrap-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Scrap" },
      {
        name: "description",
        content:
          "Tune Scrap's ambience, paper tone, grain, motion and your paper companion — then back everything up.",
      },
      { property: "og:title", content: "Settings — Scrap" },
      { property: "og:description", content: "Ambience, paper tone, motion and backups." },
    ],
  }),
  component: SettingsPage,
});

function Row({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 py-3.5 last:border-0">
      <div>
        <p className="hand text-2xl leading-none text-espresso">{label}</p>
        {note && <p className="mt-1 text-[0.8rem] text-muted-foreground">{note}</p>}
      </div>
      <div className="flex items-center gap-1.5">{children}</div>
    </div>
  );
}

function Choice({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "hand rounded-[3px] border px-3 py-0.5 text-lg transition-colors",
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

  const exportAll = () => {
    const blob = new Blob([JSON.stringify(getState(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scrap-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importAll = (file: File) => {
    file.text().then((t) => {
      try {
        actions.importState(JSON.parse(t) as ScrapState);
      } catch {
        /* ignore bad file */
      }
    });
  };

  return (
    <div className="relative max-w-2xl pb-16">
      <PageHeader title="settings" note="make it feel like your desk." />

      <div className="paper-card paper-grain px-5 py-2">
        <Row label="ambience" note="how alive the background feels">
          {["off", "calm", "lively"].map((l, i) => (
            <Choice key={l} on={s.ambient === i} onClick={() => actions.setSettings({ ambient: i })}>
              {l}
            </Choice>
          ))}
        </Row>

        <Row label="paper tone" note="the colour of the page under everything">
          {(["cream", "warm", "cool"] as const).map((t) => (
            <Choice key={t} on={s.paperTone === t} onClick={() => actions.setSettings({ paperTone: t })}>
              {t}
            </Choice>
          ))}
        </Row>

        <Row label="paper grain" note="subtle fibre texture">
          <Choice on={s.grain} onClick={() => actions.setSettings({ grain: true })}>
            on
          </Choice>
          <Choice on={!s.grain} onClick={() => actions.setSettings({ grain: false })}>
            off
          </Choice>
        </Row>

        <Row label="scrapy" note="your little paper companion">
          <Choice on={s.scrapyOn} onClick={() => actions.setSettings({ scrapyOn: true })}>
            keep him
          </Choice>
          <Choice on={!s.scrapyOn} onClick={() => actions.setSettings({ scrapyOn: false })}>
            hide
          </Choice>
        </Row>

        <Row label="reduce motion" note="calmer animations">
          <Choice on={s.reduceMotion} onClick={() => actions.setSettings({ reduceMotion: true })}>
            on
          </Choice>
          <Choice on={!s.reduceMotion} onClick={() => actions.setSettings({ reduceMotion: false })}>
            off
          </Choice>
        </Row>

        <Row label="your scraps" note="everything lives in this browser">
          <button onClick={exportAll} className="hand rounded-[3px] border border-border px-3 py-0.5 text-lg">
            export
          </button>
          <label className="hand cursor-pointer rounded-[3px] border border-border px-3 py-0.5 text-lg">
            import
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && importAll(e.target.files[0])}
            />
          </label>
        </Row>
      </div>

      <ScrapyHere
        room="settings"
        mood={mood}
        prop="mug"
        size={50}
        flip
        lines={["i like the cream paper best, personally.", "don't hide me. please.", "grain on. always."]}
        spots={["-right-6 top-16", "-right-4 bottom-16", "-left-8 top-1/2"]}
      />
    </div>
  );
}
