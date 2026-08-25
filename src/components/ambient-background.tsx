import { useScrap } from "@/lib/scrap-store";

/** Calm, breathing atmosphere. No desks, no objects — just light and paper. */
export function AmbientBackground() {
  const { ambient, grain } = useScrap((s) => s.settings);

  const speed = ambient === 0 ? 0 : ambient === 1 ? 1 : 0.55;
  const anim = (dur: number, delay = 0) =>
    speed === 0 ? undefined : { animation: `drift ${dur * speed}s ease-in-out ${delay}s infinite` };

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 12% 8%, color-mix(in oklab, var(--petal) 13%, transparent), transparent 55%)," +
            "radial-gradient(110% 80% at 88% 12%, color-mix(in oklab, var(--sky) 10%, transparent), transparent 58%)," +
            "radial-gradient(120% 100% at 70% 95%, color-mix(in oklab, var(--sage) 13%, transparent), transparent 60%)," +
            "linear-gradient(180deg, var(--background), color-mix(in oklab, var(--paper-deep) 45%, var(--background)))",
        }}
      />

      <div
        className="absolute -left-40 top-[-10%] h-[40rem] w-[40rem] rounded-full blur-3xl"
        style={{ background: "color-mix(in oklab, var(--rose) 8%, transparent)", ...anim(46) }}
      />
      <div
        className="absolute -right-52 top-[18%] h-[36rem] w-[36rem] rounded-full blur-3xl"
        style={{ background: "color-mix(in oklab, var(--forest) 7%, transparent)", ...anim(64, 3) }}
      />
      <div
        className="absolute bottom-[-24%] left-[26%] h-[34rem] w-[34rem] rounded-full blur-3xl"
        style={{ background: "color-mix(in oklab, var(--amber) 6%, transparent)", ...anim(58, 8) }}
      />

      {/* faint botanical silhouettes hugging the edges */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.08]" viewBox="0 0 1200 800" preserveAspectRatio="none">
        <g fill="none" stroke="var(--forest)" strokeWidth={2} strokeLinecap="round">
          <path d="M-10 780c90-40 130-140 150-250" style={anim(70)} />
          <path d="M40 770c40-70 40-150 20-230" />
          <path d="M1210 40c-90 40-140 120-160 230" style={anim(80, 4)} />
          <path d="M1160 20c-40 70-50 140-30 220" />
        </g>
        <g fill="var(--sage)" opacity={0.5}>
          <ellipse cx={70} cy={600} rx={26} ry={11} transform="rotate(-32 70 600)" />
          <ellipse cx={120} cy={660} rx={22} ry={9} transform="rotate(-18 120 660)" />
          <ellipse cx={1130} cy={180} rx={26} ry={11} transform="rotate(28 1130 180)" />
          <ellipse cx={1080} cy={120} rx={20} ry={9} transform="rotate(14 1080 120)" />
        </g>
      </svg>

      {ambient > 0 && (
        <div className="absolute inset-0">
          {Array.from({ length: ambient === 2 ? 18 : 10 }).map((_, i) => (
            <span
              key={i}
              className="absolute block rounded-full"
              style={{
                left: `${(i * 37) % 100}%`,
                bottom: "-6vh",
                width: 3 + (i % 3),
                height: 3 + (i % 3),
                background: i % 3 === 0 ? "var(--petal)" : i % 3 === 1 ? "var(--amber)" : "var(--sage)",
                opacity: 0.5,
                animation: `floatUp ${(46 + (i % 7) * 9) * speed}s linear ${i * 2.4}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {grain && (
        <div
          className="absolute inset-0 opacity-[0.35] mix-blend-multiply"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.2'/%3E%3C/svg%3E\")",
          }}
        />
      )}
    </div>
  );
}
