import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/** Returns ms until next Saturday 7:00 AM America/New_York (close enough using local). */
function getNextSaturday7am(): Date {
  const now = new Date();
  const target = new Date(now);
  const day = now.getDay(); // 0 Sun ... 6 Sat
  let daysUntil = (6 - day + 7) % 7;
  target.setHours(7, 0, 0, 0);
  if (daysUntil === 0 && now.getTime() >= target.getTime()) {
    daysUntil = 7;
  }
  target.setDate(now.getDate() + daysUntil);
  target.setHours(7, 0, 0, 0);
  return target;
}

export function useCountdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000 * 30);
    return () => clearInterval(id);
  }, []);
  const target = getNextSaturday7am().getTime();
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return { days, hours, minutes };
}

export function CountdownPill({ className = "" }: { className?: string }) {
  const { days, hours, minutes } = useCountdown();
  return (
    <span
      className={`inline-flex items-center gap-2 label-meta text-sky-brand ${className}`}
      aria-label={`Next run in ${days} days ${hours} hours ${minutes} minutes`}
    >
      <span className="relative inline-flex">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-brand" />
        <span className="absolute inset-0 inline-block w-1.5 h-1.5 rounded-full bg-sky-brand animate-ping opacity-75" />
      </span>
      <span>NEXT RUN IN</span>
      <span className="font-display text-base tracking-wider text-bone">
        {days}D {String(hours).padStart(2, "0")}H {String(minutes).padStart(2, "0")}M
      </span>
    </span>
  );
}

export function GoingCounter({
  className = "",
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  const tone =
    variant === "dark" ? "text-bone/70" : "text-ink/70";
  const accent = variant === "dark" ? "text-sky-brand" : "text-ink";
  return (
    <span className={`inline-flex items-center gap-2 label-meta ${tone} ${className}`}>
      <span className={`font-display text-base ${accent}`}>↑ 12</span>
      <span>GOING SATURDAY · 3 JOINED THIS WEEK</span>
    </span>
  );
}

const TICKER_MESSAGES = [
  { dot: true, text: "Saturday 7 AM · Montour Trail, McMurray" },
  { dot: false, text: "↑ 12 going Saturday · pace any" },
  { dot: false, text: "Mike just joined the Heylo chat" },
  { dot: false, text: "Coffee after at Caffè Amante" },
  { dot: false, text: "Sat forecast: 52° clear ☀" },
  { dot: false, text: "Bring a friend · dogs + strollers welcome" },
];

export function RotatingTicker() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % TICKER_MESSAGES.length), 4000);
    return () => clearInterval(id);
  }, []);
  const msg = TICKER_MESSAGES[i];
  return (
    <div className="flex items-center justify-center gap-2 px-4 pt-2 pb-1 h-6 overflow-hidden">
      {msg.dot && (
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-brand animate-pulse shrink-0" />
      )}
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
          className="text-[10px] font-semibold uppercase tracking-wider text-bone/80 truncate"
        >
          {msg.text}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
