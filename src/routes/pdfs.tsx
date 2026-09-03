import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Trash2, Upload } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { ScrapCanvas, useCanvasHistory, type ToolState } from "@/components/scrap-canvas";
import { ToolBelt, defaultToolState } from "@/components/tool-belt";
import { ScrapyHere, useTimeMood } from "@/components/scrapy";
import {
  actions,
  loadFile,
  saveFile,
  uid,
  useScrap,
  type CanvasItem,
  type PdfDoc,
} from "@/lib/scrap-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pdfs")({
  head: () => ({
    meta: [
      { title: "PDFs — Scrap" },
      {
        name: "description",
        content:
          "Read PDFs on warm paper and annotate every page with highlighters that straighten themselves, doodles and stickers.",
      },
      { property: "og:title", content: "PDFs — Scrap" },
      {
        property: "og:description",
        content: "Read and annotate PDFs with cozy highlighters and hand-drawn stickers.",
      },
    ],
  }),
  component: PdfRoom,
});

type PdfJs = typeof import("pdfjs-dist");
let pdfjsPromise: Promise<PdfJs> | null = null;

function getPdfjs(): Promise<PdfJs> {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const lib = await import("pdfjs-dist");
      const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
      lib.GlobalWorkerOptions.workerSrc = worker.default;
      return lib;
    })();
  }
  return pdfjsPromise;
}

function PdfRoom() {
  const pdfs = useScrap((s) => s.pdfs);
  const [openId, setOpenId] = useState<string | null>(null);
  const mood = useTimeMood("curious");
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const open = pdfs.find((p) => p.id === openId) ?? null;

  const onPick = async (file: File) => {
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const pdfjs = await getPdfjs();
      const doc = await pdfjs.getDocument({ data: buf.slice(0) }).promise;
      const id = uid();
      await saveFile(id, buf);
      const rec: PdfDoc = {
        id,
        name: file.name.replace(/\.pdf$/i, ""),
        addedAt: Date.now(),
        pageCount: doc.numPages,
        annotations: {},
      };
      actions.addPdf(rec);
      setOpenId(id);
    } finally {
      setBusy(false);
    }
  };

  if (open) return <PdfReader doc={open} onClose={() => setOpenId(null)} />;

  return (
    <div className="relative pb-2">
      <PageHeader
        title="pdfs"
        note="drop a reading in. scribble in the margins like it's paper."
        right={
          <button
            onClick={() => fileRef.current?.click()}
            className="hand flex items-center gap-1.5 rounded-[3px] border border-border bg-paper px-3 py-1 text-xl text-espresso transition-transform hover:-rotate-1"
          >
            <Upload className="h-4 w-4" strokeWidth={1.7} /> {busy ? "opening…" : "add a pdf"}
          </button>
        }
      />

      <input
        ref={fileRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onPick(f);
          e.target.value = "";
        }}
      />

      {pdfs.length === 0 ? (
        <div
          className="paper-card paper-grain torn-edge mx-auto mt-8 max-w-md -rotate-1 p-8 text-center"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in oklab, var(--petal) 40%, var(--paper)), var(--paper))",
          }}
        >
          <div className="mb-2 flex items-center justify-center gap-2">
            <StickerArt id="m-flower-pink" size={34} />
            <StickerArt id="m-bow" size={30} />
            <StickerArt id="m-moon" size={28} />
          </div>
          <p className="hand text-3xl text-espresso">nothing to read yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            add a pdf and it'll live here — pale highlights, doodles and all.
          </p>
          <button
            onClick={() => fileRef.current?.click()}
            className="hand mt-4 rounded-[3px] border border-rose/40 bg-paper px-4 py-1.5 text-xl text-espresso transition-transform hover:-rotate-1"
            style={{ background: "color-mix(in oklab, var(--petal) 45%, var(--paper))" }}
          >
            add a pdf
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-6">
          {pdfs.map((p, i) => (
            <div
              key={p.id}
              className="paper-card paper-grain group relative cursor-pointer p-4 pt-7 transition-transform hover:-translate-y-1"
              style={{ transform: `rotate(${((i % 3) - 1) * 0.9}deg)` }}
              onClick={() => setOpenId(p.id)}
            >
              <span
                className="absolute -top-2 left-6 h-5 w-16 -rotate-6"
                style={{ background: "var(--sky)", opacity: 0.85 }}
              />
              <p className="hand text-2xl leading-tight text-espresso">{p.name}</p>
              <p className="mt-1 text-[0.75rem] text-muted-foreground">{p.pageCount} pages</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  actions.deletePdf(p.id);
                }}
                aria-label={`remove ${p.name}`}
                className="absolute bottom-2 right-2 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.7} />
              </button>
            </div>
          ))}
        </div>
      )}

      <ScrapyHere
        room="pdfs"
        mood={mood}
        prop="book"
        peek
        size={56}
        lines={["found anything worth underlining?", "one more chapter, then tea.", "pick a book, i'll read along."]}
        spots={["-top-3 right-8", "-bottom-4 left-10", "top-1/2 -left-8"]}
      />
    </div>
  );
}

function PdfReader({ doc, onClose }: { doc: PdfDoc; onClose: () => void }) {
  const [page, setPage] = useState(1);
  const [tool, setTool] = useState<ToolState>({ ...defaultToolState, tool: "highlighter" });
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 800, h: 1000 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const mood = useTimeMood("curious");

  const items = doc.annotations[String(page)] ?? [];
  const setItems = useCallback(
    (next: CanvasItem[]) => actions.setPdfAnnotations(doc.id, page, next),
    [doc.id, page],
  );
  const history = useCanvasHistory(items, setItems);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [pdfjs, data] = await Promise.all([getPdfjs(), loadFile(doc.id)]);
      if (!data || cancelled) return;
      const pdf = await pdfjs.getDocument({ data: data.slice(0) }).promise;
      const p = await pdf.getPage(Math.min(page, pdf.numPages));
      const width = wrapRef.current?.clientWidth ?? 800;
      const base = p.getViewport({ scale: 1 });
      const scale = Math.min(1.8, width / base.width);
      const viewport = p.getViewport({ scale });
      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = viewport.width * dpr;
      canvas.height = viewport.height * dpr;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      const ctx = canvas.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      await p.render({ canvasContext: ctx, viewport }).promise;
      if (!cancelled) setSize({ w: viewport.width, h: viewport.height });
    })();
    return () => {
      cancelled = true;
    };
  }, [doc.id, page]);

  return (
    <div className="relative pb-2">
      <div className="mb-4 flex flex-wrap items-center gap-2 md:gap-3">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-sm text-ink-soft transition-colors hover:text-espresso"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.7} /> shelf
        </button>
        <p className="hand max-w-[calc(100%-4rem)] truncate text-2xl leading-none text-espresso md:text-3xl">
          {doc.name}
        </p>
        <div className="ml-auto">
          <ToolBelt state={tool} onChange={setTool} onUndo={history.undo} onRedo={history.redo} compact />
        </div>
      </div>

      <div ref={wrapRef} className="mx-auto max-w-4xl">
        <div
          className="paper-card paper-grain relative mx-auto overflow-hidden p-0"
          style={{ width: size.w, height: size.h }}
        >
          <canvas ref={canvasRef} className="block" />
          <ScrapCanvas
            items={items}
            onChange={setItems}
            toolState={tool}
            history={history}
            className="absolute inset-0"
          />
        </div>

        <div className="mt-4 flex items-center justify-center gap-4">
          <PagerBtn disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            <ChevronLeft className="h-4 w-4" strokeWidth={1.8} />
          </PagerBtn>
          <span className="hand text-2xl text-espresso">
            {page} / {doc.pageCount}
          </span>
          <PagerBtn
            disabled={page >= doc.pageCount}
            onClick={() => setPage((p) => Math.min(doc.pageCount, p + 1))}
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
          </PagerBtn>
        </div>
      </div>

      <ScrapyHere
        room="pdfs"
        mood={mood}
        prop={tool.tool === "highlighter" ? "highlighter" : tool.tool === "pen" ? "pen" : "book"}
        size={54}
        lines={[
          "the margins are where the real reading happens.",
          "that bit deserves a highlight.",
          "i'll hold the pen for a sec.",
        ]}
        spots={["top-28 -left-10", "bottom-24 -right-10", "top-1/2 -right-10", "bottom-32 -left-10"]}
      />
    </div>
  );
}

function PagerBtn({
  disabled,
  onClick,
  children,
}: {
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-[3px] border border-border bg-paper p-1.5 text-espresso transition-transform",
        disabled ? "opacity-40" : "hover:-rotate-2",
      )}
    >
      {children}
    </button>
  );
}
