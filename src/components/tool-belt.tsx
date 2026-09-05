import { useEffect, useRef, useState } from "react";
import {
  MousePointer2,
  PenLine,
  Pencil,
  Highlighter,
  Minus,
  MoveUpRight,
  Circle,
  Type,
  Eraser,
  Undo2,
  Redo2,
  Sticker as StickerIcon,
} from "lucide-react";
import { HIGHLIGHT_COLORS, INK_COLORS, type Tool, type ToolState } from "./scrap-canvas";
import { CATEGORIES, STICKERS, StickerArt } from "@/lib/stickers";
import { pickSticker, usePickedSticker } from "@/lib/sticker-pick";
import { cn } from "@/lib/utils";

const TOOLS: { id: Tool; label: string; icon: typeof PenLine }[] = [
  { id: "select", label: "move", icon: MousePointer2 },
  { id: "pen", label: "pen", icon: PenLine },
  { id: "pencil", label: "pencil", icon: Pencil },
  { id: "highlighter", label: "highlighter", icon: Highlighter },
  { id: "underline", label: "underline", icon: Minus },
  { id: "arrow", label: "arrow", icon: MoveUpRight },
  { id: "circle", label: "circle", icon: Circle },
  { id: "text", label: "text", icon: Type },
  { id: "eraser", label: "eraser", icon: Eraser },
];

export function ToolBelt({
  state,
  onChange,
  onUndo,
  onRedo,
  compact = false,
}: {
  state: ToolState;
  onChange: (s: ToolState) => void;
  onUndo: () => void;
  onRedo: () => void;
  compact?: boolean;
}) {
  const [trayOpen, setTrayOpen] = useState(false);
  const [cat, setCat] = useState(CATEGORIES[0]!.id);
  const picked = usePickedSticker();
  const applied = useRef<string | null>(null);

  const set = (patch: Partial<ToolState>) => onChange({ ...state, ...patch });

  /* a sticker picked in the drawer arms this page's sticker tool once */
  useEffect(() => {
    if (!picked || applied.current === picked) return;
    applied.current = picked;
    onChange({ ...state, tool: "sticker", stickerId: picked });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked]);

  return (
    <div className="relative">
      <div
        className="paper-card paper-grain flex flex-wrap items-center gap-1 px-2 py-1.5"
        style={{ borderRadius: 6 }}
      >
        {TOOLS.map((t) => (
          <button
            key={t.id}
            title={t.label}
            onClick={() => set({ tool: t.id })}
            className={cn(
              "relative grid h-8 w-8 place-items-center rounded-[4px] text-espresso/70 transition-all",
              "hover:bg-secondary hover:text-espresso",
              state.tool === t.id && "bg-secondary text-espresso shadow-inner",
            )}
          >
            <t.icon className="h-[17px] w-[17px]" strokeWidth={1.7} />
            {state.tool === t.id && (
              <span
                className="absolute -bottom-[3px] left-1/2 h-[3px] w-5 -translate-x-1/2 rounded-full"
                style={{ background: "var(--rose)" }}
              />
            )}
          </button>
        ))}

        <button
          title="stickers"
          onClick={() => {
            setTrayOpen((v) => !v);
            set({ tool: "sticker" });
          }}
          className={cn(
            "grid h-8 w-8 place-items-center rounded-[4px] text-espresso/70 transition-all hover:bg-secondary",
            state.tool === "sticker" && "bg-secondary text-espresso",
          )}
        >
          <StickerIcon className="h-[17px] w-[17px]" strokeWidth={1.7} />
        </button>

        <span className="mx-1 h-6 w-px bg-border" />

        <div className="flex items-center gap-1">
          {(state.tool === "highlighter" ? HIGHLIGHT_COLORS : INK_COLORS).map((c) => {
            const active =
              state.tool === "highlighter" ? state.highlight === c.v : state.color === c.v;
            return (
              <button
                key={c.id}
                title={c.id}
                onClick={() =>
                  set(state.tool === "highlighter" ? { highlight: c.v } : { color: c.v })
                }
                className={cn(
                  "h-5 w-5 rounded-full border transition-transform",
                  active ? "scale-110 border-espresso" : "border-espresso/25 hover:scale-105",
                )}
                style={{ background: c.v }}
              />
            );
          })}
        </div>

        <span className="mx-1 h-6 w-px bg-border" />

        <button
          title="undo"
          onClick={onUndo}
          className="grid h-8 w-8 place-items-center rounded-[4px] hover:bg-secondary"
        >
          <Undo2 className="h-[17px] w-[17px]" strokeWidth={1.7} />
        </button>
        <button
          title="redo"
          onClick={onRedo}
          className="grid h-8 w-8 place-items-center rounded-[4px] hover:bg-secondary"
        >
          <Redo2 className="h-[17px] w-[17px]" strokeWidth={1.7} />
        </button>

        {!compact && state.stickerId && (
          <span className="hand ml-1 text-base text-muted-foreground">
            holding: {state.stickerId.replace(/^[a-z]+-/, "")}
          </span>
        )}
      </div>

      {trayOpen && (
        <div
          className="paper-card paper-grain absolute left-0 top-[calc(100%+10px)] z-30 w-[calc(100vw-2rem)] max-w-[22rem] p-3"
          style={{ borderRadius: 6 }}
        >
          <div className="mb-2 flex flex-wrap gap-1">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={cn(
                  "hand rounded-[3px] px-2 py-0.5 text-[0.95rem] transition-colors",
                  cat === c.id ? "text-espresso" : "text-muted-foreground hover:text-espresso",
                )}
                style={cat === c.id ? { background: c.tint } : undefined}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="grid max-h-64 grid-cols-5 gap-2 overflow-y-auto pr-1">
            {STICKERS.filter((s) => s.cat === cat).map((s) => (
              <button
                key={s.id}
                title={s.label}
                onClick={() => {
                  applied.current = s.id;
                  pickSticker(s.id);
                  set({ tool: "sticker", stickerId: s.id });
                }}
                className={cn(
                  "grid h-14 place-items-center rounded-[4px] p-1 transition-all hover:-rotate-3 hover:bg-secondary",
                  state.stickerId === s.id && "bg-secondary ring-1 ring-rose",
                )}
              >
                <StickerArt id={s.id} size={Math.min(46, s.size)} />
              </button>
            ))}
          </div>
          <p className="hand mt-2 text-base text-muted-foreground">
            pick one, then tap the page to place it.
          </p>
        </div>
      )}
    </div>
  );
}

export const defaultToolState: ToolState = {
  tool: "select",
  color: "var(--espresso)",
  highlight: "var(--petal)",
  stickerId: null,
};
