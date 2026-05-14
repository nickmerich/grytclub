import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GRYT Run Club — Do Hard Things Together" },
      { name: "description", content: "GRYT is a free run club in Peters Township, PA. Saturdays at 7:00 AM on the Montour Trail. All paces welcome." },
      { name: "author", content: "GRYT" },
      { property: "og:site_name", content: "GRYT Run Club" },
      { property: "og:title", content: "GRYT Run Club — Do Hard Things Together" },
      { property: "og:description", content: "Free run club in Peters Township, PA. Saturdays at 7:00 AM on the Montour Trail. All paces welcome." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "GRYT Run Club — Do Hard Things Together" },
      { name: "twitter:description", content: "Free run club in Peters Township, PA. Saturdays at 7:00 AM on the Montour Trail. All paces welcome." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/aXy5H4jaWqdrchHlxfIBtB67rN43/social-images/social-1776911888989-Screen_Shot_2026-04-22_at_9.59.08_PM.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/aXy5H4jaWqdrchHlxfIBtB67rN43/social-images/social-1776911888989-Screen_Shot_2026-04-22_at_9.59.08_PM.webp" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
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
  return <Outlet />;
}
