import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { ScrapCanvas, useCanvasHistory } from "@/components/scrap-canvas";
import { ToolBelt, defaultToolState } from "@/components/tool-belt";
import type { ToolState } from "@/components/scrap-canvas";
import { ScrapyHere, useTimeMood } from "@/components/scrapy";
import { actions, useScrap } from "@/lib/scrap-store";

export const Route = createFileRoute("/ideas")({
  head: () => ({
    meta: [
      { title: "Idea dump — Scrap" },
      {
        name: "description",
        content:
          "An endless dotted sheet for half-thoughts, arrows, doodles and stickers. No structure required.",
      },
      { property: "og:title", content: "Idea dump — Scrap" },
      { property: "og:description", content: "A freeform dotted canvas for messy thinking." },
    ],
  }),
  component: IdeaDump,
});

function IdeaDump() {
  const items = useScrap((s) => s.ideas.items);
  const [tool, setTool] = useState<ToolState>({ ...defaultToolState, tool: "pen" });
  const history = useCanvasHistory(items, actions.setIdeas);
  const mood = useTimeMood("excited");

  return (
    <div className="relative flex min-h-[calc(100dvh-1.25rem)] flex-col">
      <PageHeader
        title="idea dump"
        note="no rules here. scribble, stick, arrow, repeat."
        right={
          <ToolBelt
            state={tool}
            onChange={setTool}
            onUndo={history.undo}
            onRedo={history.redo}
            compact
          />
        }
      />

      <ScrapCanvas
        items={items}
        onChange={actions.setIdeas}
        toolState={tool}
        history={history}
        className="paper-card paper-grain dot-grid min-h-[calc(100dvh-5.5rem)] w-full flex-1 p-3 md:min-h-0 md:p-4"
      />

      <ScrapyHere
        room="ideas"
        mood={mood}
        prop="sticker"
        size={54}
        lines={[
          "messy is the point. keep going!",
          "ooh, what's that one?",
          "my brain looks like this too.",
        ]}
        spots={["-bottom-4 left-8", "-top-3 right-6", "bottom-10 -right-7", "-bottom-3 right-1/3"]}
      />
    </div>
  );
}
