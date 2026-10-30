import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MessageSquareText, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  submitFeedback,
  MARKETPLACE_OPTIONS,
  USE_CASE_OPTIONS,
  USEFULNESS_LABELS,
  USEFULNESS_OPTIONS,
  USER_TYPE_OPTIONS,
  USER_TYPE_LABELS,
  INFO_ACCESS_OPTIONS,
  INFO_ACCESS_LABELS,
  type Usefulness,
  type UserType,
  type InfoAccess,
} from "@/lib/feedback.functions";
import { trackEvent } from "@/lib/analytics";

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function FeedbackPrompt({
  resourceType,
  resourcePath,
  question = "Was this resource useful?",
  supportingText,
  id,
  variant = "inline",
  onClose,
}: {
  resourceType: string;
  resourcePath: string;
  question?: string;
  supportingText?: string;
  id?: string;
  variant?: "inline" | "contextual" | "survey";
  onClose?: () => void;
}) {
  const [usefulness, setUsefulness] = useState<Usefulness | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [infoAccess, setInfoAccess] = useState<InfoAccess | null>(null);
  const [marketplaces, setMarketplaces] = useState<string[]>([]);
  const [useCases, setUseCases] = useState<string[]>([]);
  const [freeText, setFreeText] = useState("");
  const [followUp, setFollowUp] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const startedRef = useRef(false);
  const contextual = variant === "contextual";
  const survey = variant === "survey";
  const [surveyOpen, setSurveyOpen] = useState(false);
  const submit = useServerFn(submitFeedback);

  const answer = (u: Usefulness) => {
    if (usefulness && !survey) return;
    if (usefulness === u) return;
    setUsefulness(u);
    trackEvent("feedback_prompt_answered", { resource_type: resourceType, response: u });
  };

  const markStarted = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackEvent("feedback_started", { resource_type: resourceType });
  };

  const onSubmit = async () => {
    if (!usefulness || status === "submitting") return;
    setStatus("submitting");
    try {
      await submit({
        data: {
          resourceType,
          resourcePath,
          usefulness,
          userType: userType ?? undefined,
          informationAccess: infoAccess ?? undefined,
          marketplaces,
          useCases,
          freeText: freeText || undefined,
          followUpOptIn: followUp,
          followUpEmail: followUp && email ? email : undefined,
        },
      });
      setStatus("done");
      trackEvent("feedback_submitted", { resource_type: resourceType, usefulness });
    } catch {
      setStatus("error");
    }
  };


  const card = (
    <Card
      className={
        contextual
          ? "border-primary/30 bg-primary-soft/40"
          : "border-border"
      }
      id={id}
    >
      <CardContent className={contextual || survey ? "relative p-5" : "p-6"}>
        {contextual && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close feedback prompt"
            className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <div className="flex items-center gap-2 pr-6 text-sm font-medium text-foreground">
          <MessageSquareText className="h-4 w-4 shrink-0 text-primary" /> {survey ? "Help improve this research" : question}
        </div>
        {survey && (
          <p className="mt-1.5 text-sm text-muted-foreground">
            Marketplace seller or researcher? Share 2 minutes of feedback about how you use
            marketplace fee information.
          </p>
        )}
        {supportingText && (
          <p className="mt-1.5 text-xs text-muted-foreground">{supportingText}</p>
        )}

        {survey && !surveyOpen && status !== "done" ? (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button type="button" size="sm" aria-expanded={false} onClick={() => setSurveyOpen(true)}>
              Take the 2-minute survey
            </Button>
            <span className="text-xs text-muted-foreground">Optional • No newsletter signup required</span>
          </div>
        ) : status === "done" ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Thank you — your feedback helps us improve this resource. It is stored privately and
            is never published.
          </p>
        ) : (
          <>
            {survey && (
              <p className="mt-4 text-sm font-medium text-foreground">{question}</p>
            )}
            <div className={survey ? "mt-2 flex flex-wrap gap-2" : "mt-3 flex flex-wrap gap-2"}>
              {USEFULNESS_OPTIONS.map((u) => (
                <Button
                  key={u}
                  type="button"
                  size="sm"
                  aria-pressed={usefulness === u}
                  variant={usefulness === u ? "default" : "outline"}
                  onClick={() => answer(u)}
                >
                  {USEFULNESS_LABELS[u]}
                </Button>
              ))}
            </div>

            {(survey || usefulness) && (
              <div className={survey ? "mt-4 space-y-4 border-t border-border pt-4" : "mt-5 space-y-5 border-t border-border pt-5"}>
                <fieldset>
                  <legend className="text-sm font-medium text-foreground">What best describes you? <span className="font-normal text-muted-foreground">(optional)</span></legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {USER_TYPE_OPTIONS.map((o) => (
                      <Button key={o} type="button" size="sm" aria-pressed={userType === o}
                        variant={userType === o ? "default" : "outline"}
                        onClick={() => { markStarted(); setUserType((c) => (c === o ? null : o)); }}>
                        {USER_TYPE_LABELS[o]}
                      </Button>
                    ))}
                  </div>
                </fieldset>
                <fieldset onChange={markStarted}>
                  <legend className="text-sm font-medium text-foreground">
                    Which marketplace(s) are relevant to what you were researching? <span className="font-normal text-muted-foreground">(optional)</span>
                  </legend>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {MARKETPLACE_OPTIONS.map((m) => (
                      <label key={m} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Checkbox
                          checked={marketplaces.includes(m)}
                          onCheckedChange={() => setMarketplaces((l) => toggle(l, m))}
                        />
                        {m}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="text-sm font-medium text-foreground">
                    What were you trying to do? <span className="font-normal text-muted-foreground">(optional)</span>
                  </legend>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {USE_CASE_OPTIONS.map((c) => (
                      <label key={c} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Checkbox
                          checked={useCases.includes(c)}
                          onCheckedChange={() => setUseCases((l) => toggle(l, c))}
                        />
                        {c}
                      </label>
                    ))}
                  </div>
                </fieldset>


                <fieldset>
                  <legend className="text-sm font-medium text-foreground">Did this resource help you understand information that was previously difficult to find or compare? <span className="font-normal text-muted-foreground">(optional)</span></legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {INFO_ACCESS_OPTIONS.map((o) => (
                      <Button key={o} type="button" size="sm" aria-pressed={infoAccess === o}
                        variant={infoAccess === o ? "default" : "outline"}
                        onClick={() => { markStarted(); setInfoAccess((c) => (c === o ? null : o)); }}>
                        {INFO_ACCESS_LABELS[o]}
                      </Button>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <label htmlFor={`fb-text-${resourceType}`} className="text-sm font-medium text-foreground">
                    What was useful, confusing, or missing? <span className="font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <Textarea
                    id={`fb-text-${resourceType}`}
                    className="mt-2"
                    rows={3}
                    maxLength={2000}
                    value={freeText}
                    onChange={(e) => setFreeText(e.target.value)}
                  />
                </div>

                <div>
                  <fieldset>
                    <legend className="text-sm font-medium text-foreground">May we contact you about your feedback?</legend>
                    <div className="mt-2 flex gap-2">
                      {([true, false] as const).map((v) => (
                        <Button key={String(v)} type="button" size="sm" aria-pressed={followUp === v}
                          variant={followUp === v ? "default" : "outline"}
                          onClick={() => { setFollowUp(v); if (!v) setEmail(""); }}>
                          {v ? "Yes" : "No"}
                        </Button>
                      ))}
                    </div>
                  </fieldset>
                  {followUp && (
                    <div className="mt-3">
                      <Input
                        type="email"
                        placeholder="Email (optional)"
                        aria-label="Follow-up email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="max-w-sm"
                      />
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        Providing an email is optional and is used only for follow-up research.
                        It does not subscribe you to the newsletter or any other communication.
                      </p>
                    </div>
                  )}
                </div>

                {status === "error" && (
                  <p className="text-sm text-destructive" role="alert">
                    Couldn't submit your feedback. Please check any email address and try again.
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <Button type="button" onClick={onSubmit} disabled={status === "submitting" || !usefulness}>
                    {status === "submitting" ? "Sending…" : "Send feedback"}
                  </Button>
                  {!usefulness && (
                    <span className="text-xs text-muted-foreground">Answer "{question}" to send.</span>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  return card;
}
