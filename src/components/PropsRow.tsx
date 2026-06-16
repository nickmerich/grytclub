import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { getMemberProps, toggleProp, type PropKind } from "@/lib/social.functions";

const KINDS: { kind: PropKind; emoji: string; label: string }[] = [
  { kind: "clap", emoji: "👏", label: "Props" },
  { kind: "fire", emoji: "🔥", label: "Fire" },
  { kind: "muscle", emoji: "💪", label: "Strong" },
];

export function PropsRow({
  recipientId,
  isSelf,
  size = "md",
}: {
  recipientId: string;
  isSelf: boolean;
  size?: "sm" | "md";
}) {
  const qc = useQueryClient();
  const fetchProps = useServerFn(getMemberProps);
  const doToggle = useServerFn(toggleProp);

  const { data } = useQuery({
    queryKey: ["member-props", recipientId],
    queryFn: () => fetchProps({ data: { recipient_id: recipientId } }),
  });

  const mutate = useMutation({
    mutationFn: (kind: PropKind) => doToggle({ data: { recipient_id: recipientId, kind } }),
    onMutate: async (kind) => {
      await qc.cancelQueries({ queryKey: ["member-props", recipientId] });
      const prev = qc.getQueryData<typeof data>(["member-props", recipientId]);
      if (prev) {
        const wasMine = prev.mine[kind];
        qc.setQueryData(["member-props", recipientId], {
          counts: { ...prev.counts, [kind]: prev.counts[kind] + (wasMine ? -1 : 1) },
          mine: { ...prev.mine, [kind]: !wasMine },
        });
      }
      return { prev };
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["member-props", recipientId], ctx.prev);
      toast.error(e instanceof Error ? e.message : "Couldn't send");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["member-props", recipientId] });
    },
  });

  const counts = data?.counts ?? { clap: 0, fire: 0, muscle: 0 };
  const mine = data?.mine ?? { clap: false, fire: false, muscle: false };

  const padding = size === "sm" ? "px-2.5 py-1" : "px-3 py-1.5";
  const text = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className="flex flex-wrap gap-2">
      {KINDS.map(({ kind, emoji, label }) => {
        const active = mine[kind];
        return (
          <button
            key={kind}
            type="button"
            disabled={isSelf || mutate.isPending}
            onClick={() => mutate.mutate(kind)}
            aria-label={isSelf ? `${label} received` : active ? `Retract ${label}` : `Send ${label}`}
            aria-pressed={active}
            className={
              "inline-flex items-center gap-1.5 rounded-full border tabular-nums transition-all " +
              padding + " " + text + " " +
              (isSelf
                ? "border-border bg-card cursor-default"
                : active
                  ? "border-foreground bg-foreground text-background hover:bg-foreground/90 active:scale-95"
                  : "border-border bg-card hover:border-foreground/40 hover:-translate-y-0.5 active:scale-95")
            }
          >
            <span className="text-base leading-none">{emoji}</span>
            <span className="font-medium">{counts[kind]}</span>
          </button>
        );
      })}
    </div>
  );
}
