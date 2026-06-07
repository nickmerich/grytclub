import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "gryt_sid";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid =
        (crypto.randomUUID?.() ??
          Math.random().toString(36).slice(2) + Date.now().toString(36)).slice(
          0,
          64,
        );
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return "";
  }
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
    plausible?: (event: string, opts?: { props?: Record<string, unknown> }) => void;
  }
}

/**
 * Fire-and-forget CTA tracking. Records to Supabase `cta_clicks` and pushes
 * to GA/GTM dataLayer + Plausible if present. Never blocks navigation.
 */
export function trackCta(cta: string, href?: string) {
  if (typeof window === "undefined") return;

  // 1) GA/GTM dataLayer
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "cta_click", cta, href });
    window.gtag?.("event", "cta_click", { cta, href });
    window.plausible?.("cta_click", { props: { cta, href } });
  } catch {
    /* noop */
  }

  // 2) Persist to our own table (non-blocking)
  try {
    void supabase.from("cta_clicks").insert({
      cta: cta.slice(0, 64),
      href: href?.slice(0, 500) ?? null,
      path: window.location.pathname.slice(0, 500),
      referrer: document.referrer ? document.referrer.slice(0, 500) : null,
      user_agent: navigator.userAgent?.slice(0, 500) ?? null,
      session_id: getSessionId(),
    });
  } catch {
    /* noop */
  }
}

/**
 * Append UTM params to an outbound URL so conversions can be compared
 * in Strava / Heylo analytics and other platforms.
 */
export function withUtm(href: string, cta: string): string {
  try {
    const url = new URL(href);
    url.searchParams.set("utm_source", "grytclub");
    url.searchParams.set("utm_medium", "cta");
    url.searchParams.set("utm_campaign", "homepage");
    url.searchParams.set("utm_content", cta);
    return url.toString();
  } catch {
    return href;
  }
}
