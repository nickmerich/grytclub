import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyEmailPrefs, setEmailReminders } from "@/lib/notifications.functions";

export function EmailRemindersToggle() {
  const qc = useQueryClient();
  const fetchPrefs = useServerFn(getMyEmailPrefs);
  const updatePrefs = useServerFn(setEmailReminders);

  const q = useQuery({ queryKey: ["my-email-prefs"], queryFn: () => fetchPrefs() });
  const m = useMutation({
    mutationFn: (enabled: boolean) => updatePrefs({ data: { enabled } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-email-prefs"] }),
  });

  const enabled = q.data?.email_reminders_enabled ?? true;

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="font-medium text-sm">Saturday run reminders</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          We'll email you Friday afternoon with tomorrow's meet spot.
        </p>
      </div>
      <button
        type="button"
        disabled={q.isLoading || m.isPending}
        onClick={() => m.mutate(!enabled)}
        aria-pressed={enabled}
        className={
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors disabled:opacity-50 " +
          (enabled ? "bg-sky-brand" : "bg-muted")
        }
      >
        <span
          className={
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition " +
            (enabled ? "translate-x-5" : "translate-x-0")
          }
        />
      </button>
    </div>
  );
}
