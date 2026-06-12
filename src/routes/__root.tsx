import { Outlet, Link, createRootRouteWithContext, HeadContent, Scripts, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GRYT Run Club — Pittsburgh, PA" },
      { name: "description", content: "GRYT is a run club for adults 30+ in the Pittsburgh metro. Saturdays at 7:00 AM on the Montour/Peters Trail in McMurray, PA. All paces welcome." },
      { name: "author", content: "GRYT" },
      { property: "og:site_name", content: "GRYT Run Club" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "google-site-verification", content: "fHsXQoWUHWJ8yprnP8OnO9YW9Vutvln4IMQig8Ymjhs" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700;800&family=Montserrat:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&family=Fredoka:wght@600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "GRYT",
          alternateName: "GRYT Run Club",
          description: "Pittsburgh-area run club for adults 30+ who do hard things together.",
          url: "https://www.gryt.club/",
          areaServed: { "@type": "Place", name: "Pittsburgh, Pennsylvania" },
          sameAs: ["https://www.strava.com/clubs/1708552"],
        }),
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  const router = useRouter();
  const { queryClient } = Route.useRouteContext();
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
    });
    return () => data.subscription.unsubscribe();
  }, [router]);

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <Outlet />
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}
