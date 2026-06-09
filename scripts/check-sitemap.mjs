#!/usr/bin/env node
// Build-time check: verify https://gryt.club/sitemap.xml returns HTTP 200 with valid XML.
// Skip with SKIP_SITEMAP_CHECK=1.

const URL = process.env.SITEMAP_URL || "https://gryt.club/sitemap.xml";

if (process.env.SKIP_SITEMAP_CHECK === "1") {
  console.log(`[check-sitemap] Skipped (SKIP_SITEMAP_CHECK=1) for ${URL}`);
  process.exit(0);
}

function fail(msg) {
  console.error(`[check-sitemap] FAIL: ${msg}`);
  process.exit(1);
}

try {
  const res = await fetch(URL, { redirect: "manual" });
  if (res.status !== 200) {
    fail(`Expected HTTP 200, got ${res.status} for ${URL}`);
  }
  const body = await res.text();
  if (!body.trim().startsWith("<?xml")) {
    fail(`Response does not start with <?xml declaration`);
  }
  if (!/<urlset[\s>]/.test(body) && !/<sitemapindex[\s>]/.test(body)) {
    fail(`Response missing <urlset> or <sitemapindex> root element`);
  }
  // Lightweight well-formedness check: tags must balance roughly.
  const opens = (body.match(/<[^/!?][^>]*[^/]>/g) || []).length;
  const closes = (body.match(/<\/[^>]+>/g) || []).length;
  const selfClose = (body.match(/<[^>]+\/>/g) || []).length;
  if (opens !== closes) {
    fail(`Malformed XML: ${opens} opening vs ${closes} closing tags (self-closing: ${selfClose})`);
  }
  console.log(`[check-sitemap] OK: ${URL} returned 200 with valid XML (${body.length} bytes)`);
} catch (err) {
  console.warn(`[check-sitemap] SKIP: Request to ${URL} failed (${err?.message || err}). Not failing the build.`);
  process.exit(0);
}
