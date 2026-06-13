import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getEventCheckinPanel,
  toggleRsvpCheckin,
  addWalkup,
  removeCheckin,
} from "@/lib/checkins.functions";

type Props = {
  eventId: string;
  eventDate: string; // YYYY-MM-DD
};

export function CheckinPanel({ eventId, eventDate }: Props) {
  const qc = useQueryClient();
  const fetchPanel = useServerFn(getEventCheckinPanel);
  const toggleFn = useServerFn(toggleRsvpCheckin);
  const addFn = useServerFn(addWalkup);
  const removeFn = useServerFn(removeCheckin);
  const [walkup, setWalkup] = useState("");
  const [err, setErr] = useState<string | null>(null);

  // Only show after event date
  const today = new Date().toISOString().slice(0, 10);
  if (eventDate > today) return null;

  const q = useQuery({
    queryKey: ["checkin-panel", eventId],
    queryFn: () => fetchPanel({ data: { event_id: eventId } }),
    retry: false,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["checkin-panel", eventId] });

  const toggle = useMutation({
    mutationFn: (vars: { name: string; present: boolean }) =>
      toggleFn({ data: { event_id: eventId, rsvp_name: vars.name, present: vars.present } }),
    onSuccess: refresh,
    onError: (e: Error) => setErr(e.message),
  });
  const addWalkupMut = useMutation({
    mutationFn: (name: string) => addFn({ data: { event_id: eventId, walkup_name: name } }),
    onSuccess: () => {
      setWalkup("");
      refresh();
    },
    onError: (e: Error) => setErr(e.message),
  });
  const removeMut = useMutation({
    mutationFn: (id: string) => removeFn({ data: { event_id: eventId, checkin_id: id } }),
    onSuccess: refresh,
    onError: (e: Error) => setErr(e.message),
  });

  if (q.isLoading) return null;
  if (!q.data?.is_host) return null;

  const { rsvps, walkups, totals, event_locked } = q.data;

  return (
    <div className="border border-sky-brand/40 bg-sky-brand/5 p-6 md:p-8">
      <div className="flex items-baseline justify-between gap-3">
        <p className="label-meta text-sky-brand">● HOST CHECK-IN</p>
        <p className="text-xs text-bone/60 tabular-nums">
          {totals.checked_in} / {totals.rsvps} RSVPs · {totals.walkups} walk-ups
        </p>
      </div>
      <div className="rule-thin bg-sky-brand mt-2 mb-5 max-w-[60px]" />

      {event_locked && (
        <p className="text-xs text-bone/60 mb-4">Check-in window closed (48h after run).</p>
      )}
      {err && <p className="text-xs text-red-400 mb-3">{err}</p>}

      {rsvps.length === 0 && walkups.length === 0 && (
        <p className="text-sm text-bone/60">No RSVPs yet. Add walk-ups below.</p>
      )}

      <ul className="divide-y divide-bone/10">
        {rsvps.map((r) => (
          <li key={r.id} className="flex items-center justify-between py-2.5">
            <div className="min-w-0">
              <p className="font-medium truncate">{r.name}</p>
              <p className="text-xs text-bone/50 truncate">{r.email}</p>
            </div>
            <button
              disabled={event_locked || toggle.isPending}
              onClick={() => {
                setErr(null);
                toggle.mutate({ name: r.name, present: !r.checked_in });
              }}
              className={
                "shrink-0 ml-3 rounded-full px-3 py-1 text-xs font-medium transition-colors " +
                (r.checked_in
                  ? "bg-sky-brand text-ink"
                  : "border border-bone/30 text-bone/70 hover:border-sky-brand hover:text-sky-brand")
              }
            >
              {r.checked_in ? "✓ Here" : "Mark here"}
            </button>
          </li>
        ))}
        {walkups.map((w) => (
          <li key={w.checkin_id} className="flex items-center justify-between py-2.5">
            <div className="min-w-0">
              <p className="font-medium truncate">{w.walkup_name}</p>
              <p className="text-xs text-bone/50">Walk-up</p>
            </div>
            <button
              disabled={event_locked || removeMut.isPending}
              onClick={() => {
                setErr(null);
                removeMut.mutate(w.checkin_id);
              }}
              className="shrink-0 ml-3 text-xs text-bone/50 hover:text-red-400"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      {!event_locked && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const v = walkup.trim();
            if (!v) return;
            setErr(null);
            addWalkupMut.mutate(v);
          }}
          className="mt-5 flex gap-2"
        >
          <input
            value={walkup}
            onChange={(e) => setWalkup(e.target.value)}
            placeholder="Walk-up runner name"
            className="flex-1 bg-transparent border border-bone/30 px-3 py-2 text-sm focus:outline-none focus:border-sky-brand"
          />
          <button
            type="submit"
            disabled={addWalkupMut.isPending || !walkup.trim()}
            className="bg-sky-brand text-ink px-4 py-2 text-xs font-medium disabled:opacity-50"
          >
            ADD
          </button>
        </form>
      )}
    </div>
  );
}
