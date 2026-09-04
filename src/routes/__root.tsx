import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppShell } from "@/components/app-shell";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="paper-card paper-grain max-w-md -rotate-1 p-8 text-center">
        <h1 className="hand text-6xl text-espresso">oops</h1>
        <p className="mt-2 text-sm text-muted-foreground">this page slipped out of the notebook.</p>
        <Link to="/" className="hand mt-5 inline-block text-2xl underline decoration-wavy">
          back to notes
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="paper-card paper-grain max-w-md rotate-1 p-8 text-center">
        <h1 className="hand text-4xl text-espresso">this page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">something smudged. try again?</p>
        <div className="mt-5 flex justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="hand rounded-[3px] bg-primary px-4 py-1.5 text-xl text-primary-foreground"
          >
            try again
          </button>
          <a href="/" className="hand rounded-[3px] border border-border px-4 py-1.5 text-xl">
            go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Scrap — a cozy place to read, write and doodle" },
      {
        name: "description",
        content:
          "Scrap is a cozy notes, reading and PDF annotation space with hand-drawn stickers, a self-straightening highlighter and a little paper companion.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600&family=Karla:ital,wght@0,300..700;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        {/* Required: nested routes render here. */}
        <Outlet />
      </AppShell>
    </QueryClientProvider>
  );
}
