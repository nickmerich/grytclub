#!/usr/bin/env node
/**
 * Verifies https://gryt.club 301-redirects to https://www.gryt.club
 * with a valid TLS handshake on both hosts.
 *
 * Usage:   node scripts/check-domain-redirect.mjs
 * Exit:    0 = pass, 1 = fail
 */
import { request } from "node:https";

const APEX = "gryt.club";
const WWW = "www.gryt.club";
const EXPECTED_LOCATION = `https://${WWW}/`;

function head(host) {
  return new Promise((resolve) => {
    const req = request(
      { host, port: 443, path: "/", method: "HEAD", servername: host, timeout: 10_000 },
      (res) => {
        const cert = res.socket.getPeerCertificate?.();
        resolve({
          ok: true,
          status: res.statusCode,
          location: res.headers.location ?? null,
          tlsAuthorized: res.socket.authorized === true,
          tlsError: res.socket.authorizationError ?? null,
          certCN: cert?.subject?.CN ?? null,
          certValidTo: cert?.valid_to ?? null,
        });
      }
    );
    req.on("timeout", () => { req.destroy(new Error("timeout")); });
    req.on("error", (err) => resolve({ ok: false, error: err.message }));
    req.end();
  });
}

const fmt = (label, r) => {
  if (!r.ok) return `  ${label}: ❌ ${r.error}`;
  return [
    `  ${label}: ${r.status}${r.location ? ` → ${r.location}` : ""}`,
    `    TLS: ${r.tlsAuthorized ? "✅ valid" : `❌ ${r.tlsError ?? "unauthorized"}`}`,
    `    cert: CN=${r.certCN ?? "?"} exp=${r.certValidTo ?? "?"}`,
  ].join("\n");
};

const [apex, www] = await Promise.all([head(APEX), head(WWW)]);

console.log(`Domain redirect check — ${new Date().toISOString()}`);
console.log(fmt(`https://${APEX}`, apex));
console.log(fmt(`https://${WWW}`, www));

const checks = {
  "apex TLS valid": apex.ok && apex.tlsAuthorized,
  "apex redirects (3xx)": apex.ok && apex.status >= 300 && apex.status < 400,
  "apex is permanent (301/308)": apex.ok && (apex.status === 301 || apex.status === 308),
  "apex → www": apex.ok && apex.location?.startsWith(EXPECTED_LOCATION.slice(0, -1)),
  "www TLS valid": www.ok && www.tlsAuthorized,
  "www serves (2xx)": www.ok && www.status >= 200 && www.status < 300,
};

console.log("\nResults:");
let failed = 0;
for (const [name, pass] of Object.entries(checks)) {
  console.log(`  ${pass ? "✅" : "❌"} ${name}`);
  if (!pass) failed++;
}

if (failed === 0) {
  console.log("\n✅ PASS — apex redirects to www with valid TLS.");
  process.exit(0);
} else {
  console.log(`\n❌ FAIL — ${failed} check(s) failed.`);
  process.exit(1);
}
