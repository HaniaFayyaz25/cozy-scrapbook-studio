import type { ReactNode } from "react";

/**
 * Hand-drawn sticker library. Every sticker is an inline SVG drawn on a
 * 64x64 canvas with espresso ink outlines and soft pastel paper fills.
 */

export const INK = "var(--espresso)";
export const PETAL = "var(--petal)";
export const ROSE = "var(--rose)";
export const FOREST = "var(--forest)";
export const SAGE = "var(--sage)";
export const SKY = "var(--sky)";
export const AMBER = "var(--amber)";
export const PAPER = "var(--paper)";

export type StickerCategory =
  "marginalia" | "emotional" | "reactions" | "scrapbook" | "botanical" | "chaotic" | "scrapy";

export type Sticker = {
  id: string;
  cat: StickerCategory;
  label: string;
  /** natural width in px at scale 1 */
  size: number;
  art: ReactNode;
};

export const CATEGORIES: { id: StickerCategory; label: string; note: string; tint: string }[] = [
  {
    id: "marginalia",
    label: "marginalia",
    note: "little things for the margins",
    tint: PETAL,
  },
  { id: "emotional", label: "emotional damage", note: "for when the book hits hard", tint: ROSE },
  { id: "reactions", label: "reading reactions", note: "say it without typing", tint: SAGE },
  { id: "scrapbook", label: "scrapbook stuff", note: "tape it. pin it. collect it.", tint: AMBER },
  { id: "botanical", label: "botanical", note: "for your soft, cozy pages", tint: FOREST },
  { id: "chaotic", label: "chaotic little marks", note: "your brain is not linear", tint: SKY },
  {
    id: "scrapy",
    label: "scrapy's little things",
    note: "things that belong to scrapy",
    tint: PETAL,
  },
];

const s = (d: string, extra: Record<string, unknown> = {}) => (
  <path
    d={d}
    fill="none"
    stroke={INK}
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...extra}
  />
);

function Flower({
  c = PETAL,
  cx = 32,
  cy = 30,
  r = 8,
}: {
  c?: string;
  cx?: number;
  cy?: number;
  r?: number;
}) {
  const petals = [0, 72, 144, 216, 288];
  return (
    <g>
      {petals.map((a) => {
        const rad = (a * Math.PI) / 180;
        const px = Math.round((cx + Math.cos(rad) * r) * 1000) / 1000;
        const py = Math.round((cy + Math.sin(rad) * r) * 1000) / 1000;
        return (
          <ellipse
            key={a}
            cx={px}
            cy={py}
            rx={r * 0.72}
            ry={r * 0.58}
            fill={c}
            stroke={INK}
            strokeWidth={1.9}
            transform={`rotate(${a} ${px} ${py})`}
          />
        );
      })}

      <circle cx={cx} cy={cy} r={r * 0.45} fill={AMBER} stroke={INK} strokeWidth={1.9} />
    </g>
  );
}

function Heart({
  c = ROSE,
  x = 32,
  y = 32,
  k = 1,
}: {
  c?: string;
  x?: number;
  y?: number;
  k?: number;
}) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${k}) translate(-32 -32)`}
      d="M32 46c-9-6.5-16-12.4-16-19.4 0-4.6 3.6-8.1 8-8.1 3.2 0 6.2 1.9 8 5 1.8-3.1 4.8-5 8-5 4.4 0 8 3.5 8 8.1C48 33.6 41 39.5 32 46z"
      fill={c}
      stroke={INK}
      strokeWidth={2.1}
      strokeLinejoin="round"
    />
  );
}

function Star({
  c = AMBER,
  x = 32,
  y = 32,
  k = 1,
}: {
  c?: string;
  x?: number;
  y?: number;
  k?: number;
}) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${k}) translate(-32 -32)`}
      d="M32 14l5.4 12.2L50 28.4l-9 8.9 2.3 12.9L32 44l-11.3 6.2 2.3-12.9-9-8.9 12.6-2.2z"
      fill={c}
      stroke={INK}
      strokeWidth={2.1}
      strokeLinejoin="round"
    />
  );
}

function Sparkle({ x = 32, y = 32, k = 1, c = AMBER }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${k}) translate(-32 -32)`}
      d="M32 12c1.5 12 6 16.5 18 20-12 3.5-16.5 8-18 20-1.5-12-6-16.5-18-20 12-3.5 16.5-8 18-20z"
      fill={c}
      stroke={INK}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  );
}

/* ---------------- Scrapy blob body (reused by emotional doodles) ------------ */

export const SCRAPY_BODY =
  "M32 6c6.2-.6 11.4 2.2 13.6 6.6 3.6.6 6.9 2.4 8.6 5.6 2.2 4.1 1.2 8-1 10.8 2.6 3 3.6 6.7 2.2 10.4-1.5 4.1-5 6.4-8.9 7-2.6 3.7-6.6 5.9-11.5 6-5.4.1-9.7-1.9-12.5-5.6-4.4-.3-8.3-2.4-10.2-6.3-1.9-3.9-1-7.9 1.3-10.9-2.6-3-3.4-7-1.4-10.7 1.9-3.5 5.3-5.3 9-5.7C23.1 8.6 27.3 6.4 32 6z";

export function ScrapyBlob({
  face = "idle",
  tape = PETAL,
  blink = true,
}: {
  face?: string;
  tape?: string;
  blink?: boolean;
}) {
  const eyes = () => {
    switch (face) {
      case "sleepy":
      case "tired":
        return (
          <>
            {s("M22 31c1.8 2 4.2 2 6 0")}
            {s("M36 31c1.8 2 4.2 2 6 0")}
          </>
        );
      case "happy":
      case "proud":
      case "celebrating":
        return (
          <>
            {s("M22 32c1.8-2.4 4.2-2.4 6 0")}
            {s("M36 32c1.8-2.4 4.2-2.4 6 0")}
          </>
        );
      case "excited":
        return (
          <>
            <circle cx={25} cy={31} r={3.6} fill={INK} />
            <circle cx={39} cy={31} r={3.6} fill={INK} />
            <circle cx={26.2} cy={29.8} r={1.2} fill={PAPER} />
            <circle cx={40.2} cy={29.8} r={1.2} fill={PAPER} />
          </>
        );
      case "surprised":
      case "shocked":
        return (
          <>
            <circle cx={25} cy={31} r={4} fill={INK} />
            <circle cx={39} cy={31} r={4} fill={INK} />
          </>
        );
      case "crying":
        return (
          <>
            {s("M22 31c1.8 2 4.2 2 6 0")}
            {s("M36 31c1.8 2 4.2 2 6 0")}
            <path
              d="M24 34c-.6 4-2 6-1 8"
              stroke={SKY}
              strokeWidth={2.4}
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M40 34c.6 4 2 6 1 8"
              stroke={SKY}
              strokeWidth={2.4}
              fill="none"
              strokeLinecap="round"
            />
          </>
        );
      case "thinking":
      case "curious":
        return (
          <>
            <circle cx={26} cy={31} r={2.6} fill={INK} />
            <circle cx={40} cy={30} r={2.6} fill={INK} />
          </>
        );
      default:
        return (
          <>
            <ellipse
              cx={25}
              cy={31}
              rx={2.6}
              ry={3}
              fill={INK}
              style={
                blink
                  ? { animation: "blink 5.5s infinite", transformOrigin: "25px 31px" }
                  : undefined
              }
            />
            <ellipse
              cx={39}
              cy={31}
              rx={2.6}
              ry={3}
              fill={INK}
              style={
                blink
                  ? { animation: "blink 5.5s infinite", transformOrigin: "39px 31px" }
                  : undefined
              }
            />
          </>
        );
    }
  };

  const mouth = () => {
    switch (face) {
      case "happy":
      case "greeting":
        return s("M28 38c2.4 2.6 5.6 2.6 8 0");
      case "excited":
      case "celebrating":
        return (
          <path
            d="M27 37c1.4 4 8.6 4 10 0z"
            fill={ROSE}
            stroke={INK}
            strokeWidth={2}
            strokeLinejoin="round"
          />
        );
      case "surprised":
      case "shocked":
        return (
          <ellipse cx={32} cy={39} rx={3.4} ry={4.2} fill={ROSE} stroke={INK} strokeWidth={2} />
        );
      case "sleepy":
      case "tired":
        return s("M29 39c1.6 1.4 3.4 1.4 5 0");
      case "thinking":
        return s("M28 39h6");
      case "crying":
        return s("M28 40c2.4-3 5.6-3 8 0");
      case "proud":
        return s("M28 38c2 2.4 6 2.4 8-.6");
      default:
        return s("M29 38c1.8 1.8 4.2 1.8 6 0");
    }
  };

  return (
    <g>
      <path d={SCRAPY_BODY} fill={PAPER} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
      <ellipse cx={19} cy={36} rx={4} ry={2.6} fill={PETAL} opacity={0.75} />
      <ellipse cx={45} cy={36} rx={4} ry={2.6} fill={PETAL} opacity={0.75} />
      {eyes()}
      {mouth()}
      <g style={{ transformOrigin: "40px 9px", animation: "tapeWiggle 6s ease-in-out infinite" }}>
        <path
          d="M31 4h16l-1.5 8H29.5z"
          fill={tape}
          stroke={INK}
          strokeWidth={1.8}
          strokeLinejoin="round"
          opacity={0.95}
        />
      </g>
      {face === "sleepy" && (
        <g fill={INK} fontSize="9" fontFamily="var(--font-hand)">
          <text x={48} y={16}>
            z
          </text>
          <text x={53} y={9}>
            z
          </text>
        </g>
      )}
    </g>
  );
}

function emotional(id: string, label: string, face: string, tape: string): Sticker {
  return {
    id,
    cat: "emotional",
    label,
    size: 74,
    art: <ScrapyBlob face={face} tape={tape} blink={false} />,
  };
}

function note(id: string, label: string, text: string, bg: string, rot: number): Sticker {
  const w = Math.max(58, text.length * 8.4 + 22);
  return {
    id,
    cat: "reactions",
    label,
    size: w,
    art: (
      <g transform={`rotate(${rot} 32 32)`}>
        <path
          d={`M2 ${22} L${w - 2} ${20} L${w - 4} ${44} L4 ${45} Z`}
          fill={bg}
          stroke={INK}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <text
          x={w / 2 - 1}
          y={37}
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize={19}
          fill={INK}
        >
          {text}
        </text>
      </g>
    ),
  };
}

function tape(id: string, label: string, c: string, pattern?: "dots" | "grid" | "plain"): Sticker {
  return {
    id,
    cat: "scrapbook",
    label,
    size: 96,
    art: (
      <g transform="rotate(-6 32 32)">
        <path
          d="M0 22l4 4-4 4 4 4-4 4h96l-4-4 4-4-4-4 4-4z"
          fill={c}
          stroke={INK}
          strokeWidth={1.4}
          opacity={0.95}
        />
        {pattern === "dots" &&
          [10, 26, 42, 58, 74, 88].map((x) => (
            <circle key={x} cx={x} cy={31} r={2.4} fill={PAPER} opacity={0.8} />
          ))}
        {pattern === "grid" &&
          [8, 22, 36, 50, 64, 78, 92].map((x) => (
            <line
              key={x}
              x1={x}
              y1={22}
              x2={x}
              y2={42}
              stroke={PAPER}
              strokeWidth={1.6}
              opacity={0.7}
            />
          ))}
      </g>
    ),
  };
}

export const STICKERS: Sticker[] = [
  /* ---------------- marginalia ---------------- */
  {
    id: "m-flower-pink",
    cat: "marginalia",
    label: "petal flower",
    size: 42,
    art: <Flower c={PETAL} />,
  },
  {
    id: "m-flower-rose",
    cat: "marginalia",
    label: "rose flower",
    size: 42,
    art: <Flower c={ROSE} />,
  },
  {
    id: "m-flower-sage",
    cat: "marginalia",
    label: "sage flower",
    size: 42,
    art: <Flower c={SAGE} />,
  },
  {
    id: "m-leaf",
    cat: "marginalia",
    label: "leaf",
    size: 40,
    art: (
      <g>
        <path
          d="M18 46c0-16 10-26 28-30-2 18-12 28-28 30z"
          fill={SAGE}
          stroke={INK}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {s("M20 44c8-8 14-14 24-20")}
      </g>
    ),
  },
  {
    id: "m-bow",
    cat: "marginalia",
    label: "bow",
    size: 44,
    art: (
      <g>
        <path d="M32 32C24 22 10 22 12 32s12 10 20 0z" fill={PETAL} stroke={INK} strokeWidth={2} />
        <path d="M32 32c8-10 22-10 20 0s-12 10-20 0z" fill={PETAL} stroke={INK} strokeWidth={2} />
        <circle cx={32} cy={32} r={3.6} fill={ROSE} stroke={INK} strokeWidth={2} />
        {s("M30 35l-5 12")}
        {s("M34 35l5 12")}
      </g>
    ),
  },
  { id: "m-heart", cat: "marginalia", label: "heart", size: 38, art: <Heart /> },
  {
    id: "m-heart-pink",
    cat: "marginalia",
    label: "soft heart",
    size: 34,
    art: <Heart c={PETAL} k={0.85} />,
  },
  { id: "m-sparkle", cat: "marginalia", label: "sparkle", size: 34, art: <Sparkle /> },
  {
    id: "m-sparkle-trio",
    cat: "marginalia",
    label: "sparkle trio",
    size: 44,
    art: (
      <g>
        <Sparkle x={24} y={26} k={0.55} />
        <Sparkle x={42} y={36} k={0.4} c={PETAL} />
        <Sparkle x={30} y={46} k={0.3} c={SAGE} />
      </g>
    ),
  },
  { id: "m-star", cat: "marginalia", label: "star", size: 38, art: <Star /> },
  {
    id: "m-butterfly",
    cat: "marginalia",
    label: "butterfly",
    size: 42,
    art: (
      <g>
        <path
          d="M32 32c-6-12-20-12-18-2 1.6 8 12 10 18 2z"
          fill={PETAL}
          stroke={INK}
          strokeWidth={2}
        />
        <path
          d="M32 32c6-12 20-12 18-2-1.6 8-12 10-18 2z"
          fill={PETAL}
          stroke={INK}
          strokeWidth={2}
        />
        <path d="M32 32c-5 10-16 10-15 3" fill={ROSE} stroke={INK} strokeWidth={1.8} />
        <path d="M32 32c5 10 16 10 15 3" fill={ROSE} stroke={INK} strokeWidth={1.8} />
        {s("M32 28v12")}
        {s("M32 28l-4-7")}
        {s("M32 28l4-7")}
      </g>
    ),
  },
  {
    id: "m-moon",
    cat: "marginalia",
    label: "moon",
    size: 36,
    art: (
      <path
        d="M42 18a16 16 0 100 28 19 19 0 010-28z"
        fill={AMBER}
        stroke={INK}
        strokeWidth={2.2}
        strokeLinejoin="round"
      />
    ),
  },
  {
    id: "m-arrow",
    cat: "marginalia",
    label: "curly arrow",
    size: 52,
    art: (
      <g>
        {s("M8 44c10-6 14-18 26-20 6-1 12 1 16 4")}
        {s("M44 20l6 8-9 3")}
      </g>
    ),
  },
  {
    id: "m-dots",
    cat: "marginalia",
    label: "dotted trail",
    size: 56,
    art: <g>{s("M6 40c8-6 16 6 24 0s16 6 26-2", { strokeDasharray: "1 6" })}</g>,
  },
  {
    id: "m-squiggle",
    cat: "marginalia",
    label: "squiggle",
    size: 56,
    art: s("M6 34c5-8 10 8 15 0s10 8 15 0 10 8 16 0"),
  },
  {
    id: "m-underline",
    cat: "marginalia",
    label: "double underline",
    size: 60,
    art: (
      <g>
        {s("M6 30c14-3 32-3 52 0")}
        {s("M8 38c14-3 30-3 48 0", { strokeWidth: 1.6 })}
      </g>
    ),
  },
  {
    id: "m-circle",
    cat: "marginalia",
    label: "circled",
    size: 56,
    art: (
      <g>
        {s("M14 32c0-9 8-14 18-14s18 5 18 13-9 15-19 15-17-5-17-14z")}
        {s("M17 36c2 8 12 11 21 9", { strokeWidth: 1.5 })}
      </g>
    ),
  },
  {
    id: "m-bang",
    cat: "marginalia",
    label: "!!!",
    size: 40,
    art: (
      <text
        x={32}
        y={44}
        textAnchor="middle"
        fontFamily="var(--font-hand)"
        fontSize={34}
        fill={INK}
      >
        !!!
      </text>
    ),
  },
  {
    id: "m-question",
    cat: "marginalia",
    label: "???",
    size: 44,
    art: (
      <text
        x={32}
        y={44}
        textAnchor="middle"
        fontFamily="var(--font-hand)"
        fontSize={32}
        fill={INK}
      >
        ???
      </text>
    ),
  },

  /* ---------------- emotional damage ---------------- */
  emotional("e-love", "in love", "excited", ROSE),
  emotional("e-cry", "crying", "crying", SKY),
  emotional("e-shy", "shy", "happy", PETAL),
  emotional("e-shock", "shocked", "shocked", AMBER),
  emotional("e-sleepy", "sleepy", "sleepy", SKY),
  emotional("e-think", "thinking", "thinking", SAGE),
  emotional("e-proud", "proud", "proud", PETAL),
  emotional("e-tired", "exhausted", "tired", FOREST),

  /* ---------------- reading reactions ---------------- */
  note("r-love", "I LOVE THIS", "I LOVE THIS", PAPER, -2),
  note("r-what", "WHAT?!", "WHAT?!", PETAL, 4),
  note("r-knew", "I KNEW IT", "I KNEW IT", SAGE, -3),
  note("r-important", "important", "important", AMBER, 2),
  note("r-toogood", "this is too good", "this is too good", SAGE, -2),
  note("r-excuse", "excuse me?", "excuse me?", PETAL, 3),
  note("r-comeback", "come back to this!", "come back to this!", PAPER, -1),
  note("r-huh", "????", "????", PETAL, 5),
  {
    id: "r-heart-burst",
    cat: "reactions",
    label: "heart burst",
    size: 48,
    art: (
      <g>
        <Heart c={ROSE} x={32} y={34} k={0.9} />
        <Heart c={PETAL} x={16} y={20} k={0.4} />
        <Heart c={PETAL} x={48} y={18} k={0.3} />
      </g>
    ),
  },
  {
    id: "r-star-react",
    cat: "reactions",
    label: "starred",
    size: 46,
    art: (
      <g>
        <Star c={AMBER} x={32} y={34} k={0.95} />
        <Sparkle x={50} y={16} k={0.3} />
      </g>
    ),
  },

  /* ---------------- scrapbook ---------------- */
  tape("s-tape-pink", "pink tape", PETAL, "plain"),
  tape("s-tape-sage", "sage tape", SAGE, "dots"),
  tape("s-tape-gingham", "gingham tape", ROSE, "grid"),
  tape("s-tape-kraft", "kraft tape", "var(--paper-deep)", "plain"),
  {
    id: "s-torn",
    cat: "scrapbook",
    label: "torn paper",
    size: 84,
    art: (
      <path
        d="M4 20c14-4 28 2 42-2 12-3 22 0 34 2-2 8 2 14-1 22-16 3-30-2-44 1-10 2-20 0-30-2 3-8-1-14-1-21z"
        fill="var(--paper-deep)"
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    ),
  },
  {
    id: "s-label",
    cat: "scrapbook",
    label: "paper label",
    size: 78,
    art: (
      <g transform="rotate(-3 32 32)">
        <rect
          x={2}
          y={20}
          width={74}
          height={24}
          rx={2}
          fill={PAPER}
          stroke={INK}
          strokeWidth={1.8}
        />
        {s("M10 32h58", { strokeWidth: 1.2, strokeDasharray: "3 4" })}
      </g>
    ),
  },
  {
    id: "s-sticky",
    cat: "scrapbook",
    label: "sticky note",
    size: 70,
    art: (
      <g transform="rotate(4 32 32)">
        <path
          d="M6 12h58v46l-12 8H6z"
          fill={AMBER}
          stroke={INK}
          strokeWidth={1.8}
          strokeLinejoin="round"
          opacity={0.9}
        />
        {s("M14 26h40", { strokeWidth: 1.3 })}
        {s("M14 36h34", { strokeWidth: 1.3 })}
        {s("M14 46h24", { strokeWidth: 1.3 })}
      </g>
    ),
  },
  {
    id: "s-clip",
    cat: "scrapbook",
    label: "paper clip",
    size: 46,
    art: s("M24 10v34a8 8 0 0016 0V16a5 5 0 00-10 0v30", { strokeWidth: 2.6 }),
  },
  {
    id: "s-binder",
    cat: "scrapbook",
    label: "binder clip",
    size: 44,
    art: (
      <g>
        <rect x={16} y={26} width={32} height={24} rx={2} fill={INK} />
        {s("M20 26l10-14h4l10 14", { strokeWidth: 2 })}
      </g>
    ),
  },
  {
    id: "s-pin",
    cat: "scrapbook",
    label: "push pin",
    size: 40,
    art: (
      <g>
        <path
          d="M24 14h16l-3 14 8 8H19l8-8z"
          fill={ROSE}
          stroke={INK}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {s("M32 36v14")}
      </g>
    ),
  },
  {
    id: "s-ribbon",
    cat: "scrapbook",
    label: "ribbon",
    size: 52,
    art: (
      <g>
        {s("M14 14c10 6 26 6 36 0")}
        <path
          d="M14 14l8 34 10-10 10 10 8-34"
          fill={PETAL}
          stroke={INK}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </g>
    ),
  },
  {
    id: "s-tab",
    cat: "scrapbook",
    label: "tiny tab",
    size: 40,
    art: (
      <path
        d="M12 22h40l-6 20H12z"
        fill={SAGE}
        stroke={INK}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    ),
  },
  {
    id: "s-corner",
    cat: "scrapbook",
    label: "folded corner",
    size: 46,
    art: (
      <g>
        <path d="M10 10h44v44H10z" fill={PAPER} stroke={INK} strokeWidth={1.8} />
        <path d="M54 40L40 54H54z" fill="var(--paper-deep)" stroke={INK} strokeWidth={1.6} />
      </g>
    ),
  },

  /* ---------------- botanical ---------------- */
  {
    id: "b-tulip",
    cat: "botanical",
    label: "tulip",
    size: 44,
    art: (
      <g>
        <path
          d="M22 20c4 6 6 12 10 12s6-6 10-12c2 10-2 18-10 18s-12-8-10-18z"
          fill={PETAL}
          stroke={INK}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {s("M32 38v18")}
        {s("M32 46c-6 0-9-3-10-8 6-1 9 2 10 8z", { fill: SAGE })}
      </g>
    ),
  },
  {
    id: "b-daisy",
    cat: "botanical",
    label: "daisy",
    size: 46,
    art: (
      <g>
        <Flower c={PAPER} cx={32} cy={24} r={8} />
        {s("M32 34v22")}
        {s("M32 44c5 0 8-3 9-8-5-1-8 2-9 8z", { fill: SAGE })}
      </g>
    ),
  },
  {
    id: "b-rose",
    cat: "botanical",
    label: "rose doodle",
    size: 44,
    art: (
      <g>
        <circle cx={32} cy={24} r={10} fill={ROSE} stroke={INK} strokeWidth={2} />
        {s("M27 24c0-3 3-5 6-4s3 5 0 6-6-1-6-2z", { strokeWidth: 1.6 })}
        {s("M32 34v22")}
        {s("M32 44c-5 0-8-3-9-8 5-1 8 2 9 8z", { fill: SAGE })}
      </g>
    ),
  },
  {
    id: "b-lavender",
    cat: "botanical",
    label: "lavender",
    size: 40,
    art: (
      <g>
        {s("M32 56V22")}
        {[22, 28, 34, 40].map((y) => (
          <g key={y}>
            <ellipse
              cx={28}
              cy={y}
              rx={3.4}
              ry={2.6}
              fill="oklch(0.72 0.08 300)"
              stroke={INK}
              strokeWidth={1.4}
            />
            <ellipse
              cx={36}
              cy={y + 3}
              rx={3.4}
              ry={2.6}
              fill="oklch(0.72 0.08 300)"
              stroke={INK}
              strokeWidth={1.4}
            />
          </g>
        ))}
      </g>
    ),
  },
  {
    id: "b-sprout",
    cat: "botanical",
    label: "sprout",
    size: 40,
    art: (
      <g>
        {s("M32 56V26")}
        <path
          d="M32 34c-8 0-12-4-13-11 8-1 13 4 13 11z"
          fill={SAGE}
          stroke={INK}
          strokeWidth={1.8}
        />
        <path
          d="M32 40c8 0 12-4 13-11-8-1-13 4-13 11z"
          fill={FOREST}
          stroke={INK}
          strokeWidth={1.8}
        />
      </g>
    ),
  },
  {
    id: "b-vine",
    cat: "botanical",
    label: "vine",
    size: 64,
    art: (
      <g>
        {s("M4 44c14 2 24-6 32-14s16-12 24-12")}
        {[16, 30, 44].map((x, i) => (
          <ellipse
            key={x}
            cx={x}
            cy={40 - i * 6}
            rx={5}
            ry={3}
            fill={SAGE}
            stroke={INK}
            strokeWidth={1.5}
            transform={`rotate(-30 ${x} ${40 - i * 6})`}
          />
        ))}
      </g>
    ),
  },
  {
    id: "b-branch",
    cat: "botanical",
    label: "branch",
    size: 60,
    art: (
      <g>
        {s("M6 46c16-4 30-14 50-30")}
        {s("M20 40l-4-10")}
        {s("M32 32l-3-10")}
        {s("M44 22l-2-10")}
      </g>
    ),
  },
  {
    id: "b-corner",
    cat: "botanical",
    label: "floral corner",
    size: 58,
    art: (
      <g>
        {s("M6 54c0-24 16-40 44-46")}
        <Flower c={PETAL} cx={16} cy={38} r={5} />
        <Flower c={SAGE} cx={34} cy={20} r={4} />
      </g>
    ),
  },

  /* ---------------- chaotic ---------------- */
  {
    id: "c-scribble",
    cat: "chaotic",
    label: "scribble",
    size: 56,
    art: s("M8 40c6-14 10 10 15-2s8 12 13 0 8 8 14 2", { strokeWidth: 1.8 }),
  },
  {
    id: "c-loops",
    cat: "chaotic",
    label: "loops",
    size: 60,
    art: s("M6 36c4-10 10 2 6 6s-8-4-2-8 12 8 8 12-8-2-4-8 12 4 12 4"),
  },
  {
    id: "c-cross",
    cat: "chaotic",
    label: "cross out",
    size: 40,
    art: (
      <g>
        {s("M16 16l32 32")}
        {s("M48 16L16 48")}
      </g>
    ),
  },
  {
    id: "c-wave",
    cat: "chaotic",
    label: "wavy line",
    size: 60,
    art: s("M6 34c6-8 12 8 18 0s12 8 18 0 12 6 14 2"),
  },
  {
    id: "c-arrow-long",
    cat: "chaotic",
    label: "long arrow",
    size: 64,
    art: (
      <g>
        {s("M6 40c14 0 28-6 48-16")}
        {s("M46 20l8 4-3 9")}
      </g>
    ),
  },
  {
    id: "c-interrobang",
    cat: "chaotic",
    label: "?!",
    size: 38,
    art: (
      <text
        x={32}
        y={46}
        textAnchor="middle"
        fontFamily="var(--font-hand)"
        fontSize={36}
        fill={INK}
      >
        ?!
      </text>
    ),
  },
  {
    id: "c-lt3",
    cat: "chaotic",
    label: "<3",
    size: 40,
    art: (
      <text
        x={32}
        y={44}
        textAnchor="middle"
        fontFamily="var(--font-hand)"
        fontSize={32}
        fill={ROSE}
      >
        &lt;3
      </text>
    ),
  },
  {
    id: "c-tinystar",
    cat: "chaotic",
    label: "tiny star",
    size: 26,
    art: <Star c={PAPER} k={0.9} />,
  },

  /* ---------------- scrapy's things ---------------- */
  {
    id: "sc-tape",
    cat: "scrapy",
    label: "his tape",
    size: 44,
    art: (
      <g transform="rotate(-12 32 32)">
        <path
          d="M12 24h40l-3 16H15z"
          fill={PETAL}
          stroke={INK}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
      </g>
    ),
  },
  {
    id: "sc-pencil",
    cat: "scrapy",
    label: "pencil",
    size: 48,
    art: (
      <g transform="rotate(-40 32 32)">
        <rect x={26} y={10} width={12} height={34} fill={AMBER} stroke={INK} strokeWidth={1.8} />
        <path
          d="M26 44h12l-6 10z"
          fill="var(--paper-deep)"
          stroke={INK}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <rect x={26} y={6} width={12} height={5} fill={PETAL} stroke={INK} strokeWidth={1.6} />
      </g>
    ),
  },
  {
    id: "sc-cup",
    cat: "scrapy",
    label: "coffee cup",
    size: 48,
    art: (
      <g>
        <path
          d="M14 22h32v18a10 10 0 01-10 10H24a10 10 0 01-10-10z"
          fill={PAPER}
          stroke={INK}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {s("M46 26c8-2 10 10 0 12")}
        <Heart c={ROSE} x={30} y={34} k={0.34} />
      </g>
    ),
  },
  {
    id: "sc-backpack",
    cat: "scrapy",
    label: "backpack",
    size: 48,
    art: (
      <g>
        <path
          d="M16 26c0-8 6-12 16-12s16 4 16 12v22a4 4 0 01-4 4H20a4 4 0 01-4-4z"
          fill={SAGE}
          stroke={INK}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <rect
          x={24}
          y={34}
          width={16}
          height={12}
          rx={2}
          fill={PAPER}
          stroke={INK}
          strokeWidth={1.8}
        />
        {s("M24 24c2-6 14-6 16 0", { strokeWidth: 1.6 })}
      </g>
    ),
  },
  {
    id: "sc-blanket",
    cat: "scrapy",
    label: "blanket",
    size: 56,
    art: (
      <g>
        <path
          d="M6 26c16-6 36-6 52 0v20c-16 6-36 6-52 0z"
          fill={PETAL}
          stroke={INK}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {s("M6 34c16-5 36-5 52 0", { strokeWidth: 1.3 })}
        {s("M6 40c16-5 36-5 52 0", { strokeWidth: 1.3 })}
      </g>
    ),
  },
  {
    id: "sc-speech",
    cat: "scrapy",
    label: "speech bubble",
    size: 56,
    art: (
      <g>
        <path
          d="M8 16h48v26H26l-12 10 2-10H8z"
          fill={PAPER}
          stroke={INK}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </g>
    ),
  },
  {
    id: "sc-thought",
    cat: "scrapy",
    label: "thought bubble",
    size: 56,
    art: (
      <g>
        <path
          d="M16 16c14-8 34-4 34 8s-22 16-32 10-8-14-2-18z"
          fill={PAPER}
          stroke={INK}
          strokeWidth={2}
        />
        <circle cx={18} cy={44} r={4} fill={PAPER} stroke={INK} strokeWidth={1.8} />
        <circle cx={11} cy={54} r={2.6} fill={PAPER} stroke={INK} strokeWidth={1.6} />
      </g>
    ),
  },
  {
    id: "sc-scrap",
    cat: "scrapy",
    label: "paper scrap",
    size: 46,
    art: (
      <path
        d="M10 18l14-4 12 4 14-2-2 16 3 14-16 2-12-3-13 3 2-14z"
        fill="var(--paper-deep)"
        stroke={INK}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
    ),
  },
  {
    id: "sc-sleepcloud",
    cat: "scrapy",
    label: "sleep cloud",
    size: 52,
    art: (
      <g>
        <path
          d="M14 40c-8 0-10-10-2-12 0-8 10-12 16-6 6-6 16-2 15 6 8 1 7 12-1 12z"
          fill={PAPER}
          stroke={INK}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <text
          x={32}
          y={56}
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize={16}
          fill={INK}
        >
          zzz
        </text>
      </g>
    ),
  },
];

export const STICKER_MAP: Record<string, Sticker> = Object.fromEntries(
  STICKERS.map((st) => [st.id, st]),
);

/** natural drawing width of a sticker's art box (height is always 64) */
export function stickerBox(st: Sticker) {
  return { w: Math.max(64, st.size), h: 64 };
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Every sticker gets a tiny paper-ink imperfection: a per-sticker tilt and a
 * gentle turbulence displacement so no outline is machine-perfect.
 */
export function StickerArt({ id, size }: { id: string; size?: number }) {
  const st = STICKER_MAP[id];
  const fid = `wob-${id}`;
  if (!st) return null;
  const box = stickerBox(st);
  const w = size ?? st.size;
  const h = (w * box.h) / box.w;
  const h7 = hash(id);
  const tilt = ((h7 % 9) - 4) * 0.55;
  const seed = h7 % 97;
  return (
    <svg
      viewBox={`0 0 ${box.w} ${box.h}`}
      width={w}
      height={h}
      style={{ overflow: "visible", display: "block" }}
    >
      <defs>
        <filter id={fid} x="-25%" y="-25%" width="150%" height="150%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.045"
            numOctaves={2}
            seed={seed}
            result="n"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale="1.1"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      <g
        filter={`url(#${fid})`}
        transform={`rotate(${tilt} ${box.w / 2} ${box.h / 2})`}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {st.art}
      </g>
    </svg>
  );
}
