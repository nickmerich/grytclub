import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/connect")({
  head: () => ({
    meta: [
      { title: "Connect GRYT to your AI assistant" },
      {
        name: "description",
        content:
          "Connect ChatGPT or Claude to GRYT so your AI can pull upcoming runs, active challenges, and recent community activity.",
      },
      { property: "og:title", content: "Connect GRYT to your AI assistant" },
      {
        property: "og:description",
        content:
          "Paste one URL into ChatGPT or Claude and let your AI check the GRYT schedule, challenges, and community activity.",
      },
    ],
  }),
  component: ConnectPage,
});

function ConnectPage() {
  const [mcpUrl, setMcpUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMcpUrl(new URL("/mcp", window.location.origin).toString());
  }, []);

  async function copy() {
    if (!mcpUrl) return;
    try {
      await navigator.clipboard.writeText(mcpUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  return (
    <main className="min-h-screen bg-ink text-bone px-6 md:px-10 py-16">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="label-meta text-bone/60 hover:text-sky-brand">
          ← GRYT.CLUB
        </Link>

        <h1 className="mt-6 font-display text-4xl md:text-5xl uppercase leading-none">
          Connect GRYT to your <span className="underline-sky">AI assistant</span>
        </h1>
        <p className="mt-4 text-bone/75 max-w-xl">
          Give ChatGPT or Claude one URL and they can pull the upcoming run schedule,
          active challenges, and the latest community activity for you.
        </p>

        <section className="mt-10 rounded-lg border border-bone/15 bg-bone/[0.04] p-5">
          <div className="label-meta text-bone/60">MCP SERVER URL</div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <code className="flex-1 min-w-0 truncate rounded bg-black/40 px-3 py-2 font-mono text-sm md:text-base">
              {mcpUrl || "…"}
            </code>
            <button
              type="button"
              onClick={copy}
              disabled={!mcpUrl}
              className="rounded-md bg-sky-brand px-4 py-2 label-meta text-ink hover:bg-bone disabled:opacity-50"
            >
              {copied ? "COPIED" : "COPY"}
            </button>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl uppercase">ChatGPT</h2>
          <ol className="mt-4 space-y-3 list-decimal list-inside text-bone/85">
            <li>
              Open{" "}
              <a
                className="text-sky-brand hover:underline"
                href="https://chatgpt.com/#settings/Connectors/Advanced"
                target="_blank"
                rel="noopener noreferrer"
              >
                ChatGPT → Settings → Connectors → Advanced
              </a>{" "}
              and turn on Developer mode (read the risk notice ChatGPT shows).
            </li>
            <li>
              In the chat composer's <strong>+</strong> menu, enable Developer mode.
            </li>
            <li>
              Click <strong>Add sources</strong>, then <strong>Connect more</strong>.
            </li>
            <li>Name the connector <em>GRYT</em> and paste the URL above.</li>
            <li>Ask ChatGPT something like <em>"What GRYT runs are coming up?"</em></li>
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl uppercase">Claude</h2>
          <ol className="mt-4 space-y-3 list-decimal list-inside text-bone/85">
            <li>
              Open{" "}
              <a
                className="text-sky-brand hover:underline"
                href="https://claude.ai/customize/connectors?modal=add-custom-connector"
                target="_blank"
                rel="noopener noreferrer"
              >
                Claude → Add custom connector
              </a>
              .
            </li>
            <li>Name the connector <em>GRYT</em> and paste the URL above.</li>
            <li>
              Enable the connector from the chat composer, then ask Claude to
              check the GRYT schedule or challenges.
            </li>
          </ol>
        </section>

        <p className="mt-12 text-sm text-bone/50">
          The connection is read-only — your assistant sees the same public
          runs, challenges, and activity anyone on gryt.club can see.
        </p>
      </div>
    </main>
  );
}
