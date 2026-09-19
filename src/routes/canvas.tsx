import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { actions, useScrap } from "@/lib/scrap-store";

export const Route = createFileRoute("/canvas")({
  component: CanvasRoute,
});

function CanvasRoute() {
  const notes = useScrap((s) => s.notes);
  const navigate = useNavigate();

  useEffect(() => {
    const first = notes[0];
    if (first) {
      navigate({ to: "/notes/$noteId", params: { noteId: first.id }, replace: true });
      return;
    }
    const id = actions.createNote();
    navigate({ to: "/notes/$noteId", params: { noteId: id }, replace: true });
  }, [notes, navigate]);

  return (
    <div className="flex h-full items-center justify-center bg-paper/40">
      <p className="hand text-2xl text-room-ink/60">opening your canvas...</p>
    </div>
  );
}
