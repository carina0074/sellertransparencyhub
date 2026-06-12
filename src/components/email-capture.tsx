import { useState, type FormEvent } from "react";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "sth_email_subscriptions";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email")
  .email("That doesn't look like a valid email")
  .max(255);

export type SubscriptionTopic =
  | "fee_changes"
  | "suspension_alerts"
  | "policy_updates";

type Props = {
  topic: SubscriptionTopic;
  title: string;
  description: string;
  variant?: "card" | "inline" | "dark";
};

type StoredSub = { topic: SubscriptionTopic; email: string; at: string };

function persist(sub: StoredSub) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: StoredSub[] = raw ? JSON.parse(raw) : [];
    if (!list.some((s) => s.email === sub.email && s.topic === sub.topic)) {
      list.push(sub);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  } catch {
    // ignore
  }
}

export function EmailCapture({ topic, title, description, variant = "card" }: Props) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid email");
      setState("error");
      return;
    }
    setError(null);
    setState("loading");
    // Simulated enqueue. When Cloud is enabled we can swap this for a serverFn insert.
    setTimeout(() => {
      persist({ topic, email: parsed.data, at: new Date().toISOString() });
      setState("done");
    }, 450);
  }

  const containerClass =
    variant === "card"
      ? "rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
      : variant === "dark"
      ? "rounded-2xl border border-border bg-foreground px-6 py-8 text-background sm:px-8"
      : "border-t border-border pt-6";

  const titleClass =
    variant === "dark"
      ? "text-xl font-semibold tracking-tight sm:text-2xl"
      : "text-xl font-semibold tracking-tight text-foreground sm:text-2xl";

  const descClass =
    variant === "dark"
      ? "mt-2 text-sm opacity-80"
      : "mt-2 text-sm text-muted-foreground";

  return (
    <div className={containerClass}>
      <div className="flex items-start gap-3">
        <span
          className={
            variant === "dark"
              ? "grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-background/10 text-background"
              : "grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"
          }
        >
          <Mail className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className={titleClass}>{title}</h3>
          <p className={descClass}>{description}</p>

          {state === "done" ? (
            <p
              className={`mt-4 inline-flex items-center gap-2 text-sm font-medium ${
                variant === "dark" ? "text-background" : "text-primary"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              You're on the list. We'll only email when something material changes.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
              <label htmlFor={`email-${topic}`} className="sr-only">
                Email address
              </label>
              <Input
                id={`email-${topic}`}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (state === "error") setState("idle");
                }}
                maxLength={255}
                aria-invalid={state === "error"}
                aria-describedby={state === "error" ? `email-${topic}-err` : undefined}
                className={
                  variant === "dark"
                    ? "border-background/20 bg-background/10 text-background placeholder:text-background/60"
                    : ""
                }
              />
              <Button
                type="submit"
                disabled={state === "loading"}
                variant={variant === "dark" ? "secondary" : "default"}
              >
                {state === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subscribing
                  </>
                ) : (
                  "Notify me"
                )}
              </Button>
            </form>
          )}

          {state === "error" && error && (
            <p id={`email-${topic}-err`} className="mt-2 text-sm text-destructive">
              {error}
            </p>
          )}

          {state !== "done" && (
            <p
              className={`mt-3 text-xs ${
                variant === "dark" ? "opacity-60" : "text-muted-foreground"
              }`}
            >
              Free. One-click unsubscribe. We never share your email.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}