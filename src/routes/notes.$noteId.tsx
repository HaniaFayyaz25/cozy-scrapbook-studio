import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { ScrapCanvas, useCanvasHistory } from "@/components/scrap-canvas";
import { ToolBelt, defaultToolState } from "@/components/tool-belt";
import { ScrapyCompanion, useTimeMood } from "@/components/scrapy";
import { actions, useScrap, type CanvasItem } from "@/lib/scrap-store";

export const Route = createFileRoute("/notes/$noteId")({
  head: () => ({
    meta: [
      { title: "Notebook — Scrap" },
      {
        name: "description",
        content: "Write, doodle, highlight and stick things onto a warm paper page.",
      },
      { property: "og:title", content: "Notebook — Scrap" },
      { property: "og:description", content: "A warm paper page you can write and doodle on." },
    ],
  }),
  component: NotePageView,
});

function NotePageView() {
  const { noteId } = Route.useParams();
  const note = useScrap((s) => s.notes.find((n) => n.id === noteId));
  const [pageIdx, setPageIdx] = useState(0);
  const [tool, setTool] = useState(defaultToolState);
  const mood = useTimeMood("curious");

  const page = note?.pages[Math.min(pageIdx, (note?.pages.length ?? 1) - 1)];

  const setItems = (items: CanvasItem[]) => {
    if (!note || !page) return;
    actions.setPage(note.id, page.id, { items });
  };
  const history = useCanvasHistory(page?.items ?? [], setItems);

  if (!note || !page) {
    return (
      <div className="paper-card paper-grain mx-auto mt-20 max-w-sm -rotate-1 p-8 text-center">
        <p className="hand text-3xl text-espresso">this page isn't here</p>
        <Link to="/" className="hand mt-3 inline-block text-xl underline decoration-wavy">
          back to the shelf
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-1 text-sm text-ink-soft transition-colors hover:text-espresso"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.7} /> shelf
        </Link>
        <input
          value={note.title}
          onChange={(e) => actions.updateNote(note.id, { title: e.target.value })}
          className="hand min-w-0 flex-1 bg-transparent text-4xl leading-none text-espresso outline-none placeholder:text-muted-foreground"
          placeholder="untitled page"
        />
      </div>

      <div className="sticky top-3 z-30 mb-4 w-fit">
        <ToolBelt state={tool} onChange={setTool} onUndo={history.undo} onRedo={history.redo} />
      </div>

      <ScrapCanvas
        items={page.items}
        onChange={setItems}
        toolState={tool}
        history={history}
        className="paper-card paper-grain ruled-lines mx-auto min-h-[70vh] max-w-4xl p-8"
      >
        <textarea
          value={page.text}
          onChange={(e) => actions.setPage(note.id, page.id, { text: e.target.value })}
          placeholder="start writing…"
          onPointerDown={(e) => tool.tool === "select" && e.stopPropagation()}
          style={{ pointerEvents: tool.tool === "select" ? "auto" : "none" }}
          className="hand min-h-[62vh] w-full resize-none bg-transparent text-2xl leading-[2rem] text-espresso outline-none placeholder:text-muted-foreground"
        />
      </ScrapCanvas>

      <div className="mx-auto mt-4 flex max-w-4xl flex-wrap items-center gap-2">
        {note.pages.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setPageIdx(i)}
            className={`hand rounded-[3px] px-2.5 py-0.5 text-lg transition-colors ${
              i === pageIdx ? "bg-secondary text-espresso" : "text-muted-foreground hover:text-espresso"
            }`}
          >
            page {i + 1}
          </button>
        ))}
        <button
          onClick={() => {
            actions.addPage(note.id);
            setPageIdx(note.pages.length);
          }}
          className="hand flex items-center gap-1 rounded-[3px] px-2 py-0.5 text-lg text-muted-foreground hover:text-espresso"
        >
          <Plus className="h-3.5 w-3.5" /> add page
        </button>
      </div>

      <ScrapyCompanion room="notes" mood={mood} line="try the highlighter — it straightens itself out." />
    </div>
  );
}
