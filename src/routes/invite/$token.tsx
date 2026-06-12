import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { acceptInvite, getInvitePreview } from "@/lib/social.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/invite/$token")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "You're invited — GRYT" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InvitePage,
});

function InvitePage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const fetchPreview = useServerFn(getInvitePreview);
  const accept = useServerFn(acceptInvite);

  const { data, isLoading } = useQuery({
    queryKey: ["invite-preview", token],
    queryFn: () => fetchPreview({ data: { token } }),
  });

  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user));
  }, []);

  const [accepting, setAccepting] = useState(false);
  async function onAccept() {
    if (!data) return;
    if (!authed) {
      sessionStorage.setItem("pending-invite-token", token);
      navigate({ to: "/auth" });
      return;
    }
    setAccepting(true);
    try {
      const res = await accept({ data: { token } });
      toast.success("Joined challenge");
      navigate({ to: "/challenges/$slug", params: { slug: res.slug ?? data.challenge_slug } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't accept invite");
      setAccepting(false);
    }
  }

  if (isLoading) {
    return <main className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading…</p></main>;
  }
  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="font-display text-3xl">Invite not found</h1>
          <p className="mt-2 text-muted-foreground">This invite link is invalid or has been removed.</p>
          <Link to="/" className="mt-6 inline-block text-sm underline">← Home</Link>
        </div>
      </main>
    );
  }

  const accent = data.challenge_accent;

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border p-8" style={{ borderColor: accent + "55", backgroundColor: accent + "10" }}>
        <p className="label-meta text-muted-foreground">You're invited</p>
        <div className="mt-2 flex items-center gap-3">
          {data.inviter_avatar_url ? (
            <img src={data.inviter_avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-muted" />
          )}
          <p className="text-sm">
            <span className="font-medium">{data.inviter_display_name ?? "A GRYT member"}</span>
            <span className="text-muted-foreground"> invited you to a challenge</span>
          </p>
        </div>

        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium mt-6"
          style={{ backgroundColor: accent + "33", color: accent }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
          {data.challenge_theme.toUpperCase()}
        </div>
        <h1 className="font-display text-3xl mt-2">{data.challenge_title}</h1>
        {data.challenge_tagline && (
          <p className="text-muted-foreground mt-1">{data.challenge_tagline}</p>
        )}

        <dl className="grid grid-cols-2 gap-4 mt-6 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Steps</dt>
            <dd className="font-display text-2xl mt-0.5">{data.step_count}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Already joined</dt>
            <dd className="font-display text-2xl mt-0.5">{data.participant_count}</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={onAccept}
            disabled={accepting || authed === null}
            className="inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            style={{ backgroundColor: accent }}
          >
            {accepting ? "Joining…" : authed ? "Accept & join" : "Sign up to accept"}
          </button>
          <Link to="/" className="text-center text-sm text-muted-foreground hover:text-foreground">
            Maybe later
          </Link>
        </div>
      </div>
    </main>
  );
}
