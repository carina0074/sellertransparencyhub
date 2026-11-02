import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  QUICK_MISSING_MAX,
  QUICK_USE_OPTIONS,
  submitQuickAnswer,
  submitQuickFollowUp,
  type QuickAnswer,
  type QuickResourceType,
} from "@/lib/feedback.functions";
import { trackEvent } from "@/lib/analytics";
import {
  RESEARCH_SURVEY_URL,
  followUpAnalyticsOption,
  markShownThisSession,
  wasShownThisSession,
} from "@/lib/quick-feedback";

function session(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/**
 * One-tap "Did this answer your question?" prompt.
 * - floating: appears bottom-right once `active` becomes true (calculator, database pages).
 * - inline: renders in place and counts as shown when scrolled into view (end of reports).
 */
export function QuickFeedback({
  resourceType,
  resourcePath,
  recordId,
  recordType,
  active = true,
  variant = "floating",
}: {
  resourceType: QuickResourceType;
  resourcePath: string;
  recordId?: string;
  recordType?: "fee_record" | "fee_change" | "policy_change";
  active?: boolean;
  variant?: "floating" | "inline";
}) {
  const [visible, setVisible] = useState(false);
  const [blocked, setBlocked] = useState(true);
  const [answer, setAnswer] = useState<QuickAnswer | null>(null);
  const [step, setStep] = useState<"ask" | "follow" | "thanks">("ask");
  const [missing, setMissing] = useState("");
  const idRef = useRef<string | null>(null);
  const savedRef = useRef<Promise<unknown> | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const saveAnswer = useServerFn(submitQuickAnswer);
  const saveFollow = useServerFn(submitQuickFollowUp);

  useEffect(() => {
    setBlocked(wasShownThisSession(session(), resourcePath));
  }, [resourcePath]);

  const show = () => {
    if (visible) return;
    markShownThisSession(session(), resourcePath);
    setVisible(true);
    trackEvent("feedback_prompt_shown", { resource_type: resourceType });
  };

  useEffect(() => {
    if (blocked || visible || variant !== "floating" || !active) return;
    show();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, blocked, variant]);

  useEffect(() => {
    if (blocked || visible || variant !== "inline" || !boxRef.current) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { show(); io.disconnect(); }
    }, { threshold: 0.5 });
    io.observe(boxRef.current);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocked, variant]);

  const dismissed = step === "ask" && blocked && !visible;
  if (variant === "floating" && !visible) return null;
  if (variant === "inline" && dismissed) return null;

  const tap = (a: QuickAnswer) => {
    if (answer) return;
    setAnswer(a);
    setStep("follow");
    trackEvent("feedback_answered", { answer: a, resource_type: resourceType });
    const id = crypto.randomUUID();
    idRef.current = id;
    savedRef.current = saveAnswer({ data: { id, resourceType, resourcePath, recordId, recordType, answer: a } }).catch(() => undefined);
  };

  const follow = async (value: string) => {
    if (!answer || !idRef.current) return;
    setStep("thanks");
    trackEvent("feedback_followup", { option: followUpAnalyticsOption(answer, value) });
    await savedRef.current;
    const id = idRef.current;
    const payload = answer === "yes"
      ? { id, answer: "yes" as const, followUp: value as (typeof QUICK_USE_OPTIONS)[number] }
      : { id, answer: "no" as const, followUp: value };
    saveFollow({ data: payload }).catch(() => undefined);
  };

  const close = () => { setVisible(false); setBlocked(true); setStep("ask"); };

  const wrapper = variant === "floating"
    ? "fixed bottom-4 right-4 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-border bg-card p-4 shadow-lg"
    : "relative mt-8 rounded-lg border border-border bg-card p-4";

  return (
    <div ref={boxRef} className={wrapper} role="region" aria-label="Quick feedback">
      <button type="button" onClick={close} aria-label="Dismiss" className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <X className="h-4 w-4" />
      </button>

      {step === "ask" && (
        <div className="flex flex-wrap items-center gap-3 pr-6">
          <p className="text-sm font-medium text-foreground">Did this answer your question?</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => tap("yes")}>Yes</Button>
            <Button size="sm" variant="outline" onClick={() => tap("no")}>No</Button>
          </div>
        </div>
      )}

      {step === "follow" && answer === "yes" && (
        <div className="pr-6">
          <p className="text-sm font-medium text-foreground">What will you use it for? <span className="font-normal text-muted-foreground">(optional)</span></p>
          <div className="mt-2 flex flex-wrap gap-2">
            {QUICK_USE_OPTIONS.map((o) => (
              <Button key={o} size="sm" variant="secondary" onClick={() => follow(o)}>{o}</Button>
            ))}
          </div>
          <button type="button" className="mt-2 text-xs text-muted-foreground hover:underline" onClick={() => setStep("thanks")}>Skip</button>
        </div>
      )}

      {step === "follow" && answer === "no" && (
        <form className="pr-6" onSubmit={(e) => { e.preventDefault(); if (missing.trim()) follow(missing.trim()); }}>
          <label htmlFor="quick-missing" className="text-sm font-medium text-foreground">What was missing? <span className="font-normal text-muted-foreground">(optional)</span></label>
          <Textarea id="quick-missing" className="mt-2" rows={2} maxLength={QUICK_MISSING_MAX} value={missing} onChange={(e) => setMissing(e.target.value)} />
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">{missing.length}/{QUICK_MISSING_MAX}</span>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="ghost" onClick={() => setStep("thanks")}>Skip</Button>
              <Button type="submit" size="sm" disabled={!missing.trim()}>Send</Button>
            </div>
          </div>
        </form>
      )}

      {step === "thanks" && (
        <div className="pr-6">
          <p className="text-sm font-medium text-foreground">Thank you for your feedback.</p>
          {RESEARCH_SURVEY_URL && (
            <a href={RESEARCH_SURVEY_URL} target="_blank" rel="noreferrer" className="mt-1 block text-sm text-primary hover:underline">
              Sell in the U.S.? Help with a 3-minute research survey →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
