import { Link } from "@tanstack/react-router";
import { LineChart, Mail, ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { navGroups } from "@/components/layout/SiteHeader";

const columns = [
  ...navGroups,
  { key: "about", title: "About", items: [
    { to: "/about", label: "About" },
    { to: "/privacy", label: "Privacy" },
  ] },
] as const;

function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    const { error } = await supabase.from("newsletter_subscriptions").insert({ email });
    if (error) {
      if (error.code === "23505") {
        setStatus("success");
        setMessage("You're already subscribed!");
      } else {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    } else {
      setStatus("success");
      setMessage("Thanks for subscribing!");
    }
  }

  return (
    <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground">Join Marketplace Transparency Updates</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Occasional updates when new research, reports, or data updates are published.
      </p>
      {status === "success" ? (
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-green-600">
          <Check className="h-4 w-4" />
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-9"
              disabled={status === "loading"}
            />
          </div>
          <Button type="submit" disabled={status === "loading"} className="shrink-0">
            {status === "loading" ? "Subscribing..." : "Subscribe"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      )}
      {status === "error" && (
        <p className="mt-2 text-sm text-red-600">{message}</p>
      )}
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <NewsletterSignup />
        </div>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div>
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
                <LineChart className="h-4 w-4" />
              </span>
              Seller Transparency Hub
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Independent marketplace transparency research, source-linked fee information,
              and educational tools for e-commerce sellers.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
              <ul className="mt-3 space-y-2">
                {col.items.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
                {col.key === "about" && (
                  <li>
                    <a
                      href="mailto:research@sellertransparency.com"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      research@sellertransparency.com
                    </a>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center">
          <p className="w-full sm:order-last sm:basis-full">For information only. Not financial, tax or accounting advice. Fees change; confirm with each marketplace.</p>
          <p>© {new Date().getFullYear()} Seller Transparency Hub. All rights reserved.</p>
          <p>
            Built for sellers. Independent and unaffiliated with marketplaces.
          </p>
        </div>
      </div>
    </footer>
  );
}