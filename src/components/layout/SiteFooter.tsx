import { Link } from "@tanstack/react-router";
import { LineChart, Mail, ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const columns = [
  {
    title: "Tools",
    links: [
      { to: "/calculator", label: "Profit Calculator" },
      { to: "/health-check", label: "Account Health Checker" },
      { to: "/fees", label: "Fee Dashboard" },
      { to: "/suspension-prevention", label: "Suspension Prevention" },
    ],
  },
  {
    title: "Resources",
    links: [
      { to: "/resources", label: "Seller Guides" },
      { to: "/resources", label: "Profitability Articles" },
      { to: "/resources", label: "Policy Updates" },
      { to: "/resources", label: "Inventory Planning" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/about", label: "Mission" },
      { to: "/about", label: "Contact" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
                <LineChart className="h-4 w-4" />
              </span>
              Seller Transparency Hub
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Free, data-driven tools that help e-commerce sellers understand marketplace
              economics and operate with confidence.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Seller Transparency Hub. All rights reserved.</p>
          <p>Built for sellers. Independent and unaffiliated with marketplaces.</p>
        </div>
      </div>
    </footer>
  );
}