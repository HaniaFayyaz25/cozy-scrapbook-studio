import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { ScrapCanvas, useCanvasHistory } from "@/components/scrap-canvas";
import { ToolBelt, defaultToolState } from "@/components/tool-belt";
import { ScrapyCompanion, useTimeMood } from "@/components/scrapy";
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
  const [tool, setTool] = useState({ ...defaultToolState, tool: "pen" as const });
  const history = useCanvasHistory(items, actions.setIdeas);
  const mood = useTimeMood("excited");

  return (
    <div className="pb-16">
      <PageHeader
        title="idea dump"
        note="no rules here. scribble, stick, arrow, repeat."
        right={
          <ToolBelt state={tool} onChange={setTool} onUndo={history.undo} onRedo={history.redo} compact />
        }
      />

      <ScrapCanvas
        items={items}
        onChange={actions.setIdeas}
        toolState={tool}
        history={history}
        className="paper-card paper-grain dot-grid min-h-[78vh] w-full p-6"
      />

      <ScrapyCompanion room="ideas" mood={mood} line="messy is the point. keep going!" />
    </div>
  );
}
