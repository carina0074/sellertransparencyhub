import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, LineChart, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const products = [
  { to: "/rate-card", label: "Fee Database" },
  { to: "/fees", label: "Fee Changes" },
  { to: "/suspension-prevention", label: "Appeal Library" },
  { to: "/policy-changes", label: "Policy Archive" },
  { to: "/impact-reports", label: "Impact Reports" },
] as const;

const research = [
  { to: "/insights", label: "Insights" },
  { to: "/methodology", label: "Methodology" },
] as const;

const company = [
  { to: "/resources", label: "Resources" },
  { to: "/about", label: "About" },
] as const;

function Dropdown({
  title,
  items,
}: {
  title: string;
  items: readonly { to: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={() => setOpen((v) => !v)}
      >
        {title}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 w-48 pt-1">
          <div className="rounded-lg border border-border bg-background p-1 shadow-lg">
            {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: "bg-muted text-foreground" }}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<
    "products" | "research" | "company" | null
  >(null);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <LineChart className="h-4 w-4" />
          </span>
          <span className="text-foreground">Seller Transparency Hub</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <Dropdown title="Products" items={products} />
          <Dropdown title="Research" items={research} />
          <Dropdown title="Company" items={company} />
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="ghost" size="sm">
            <Link to="/calculator">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/calculator">Start free</Link>
          </Button>
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-md border border-border lg:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {[
              { key: "products", title: "Products", items: products },
              { key: "research", title: "Research", items: research },
              { key: "company", title: "Company", items: company },
            ].map((section) => (
              <div key={section.key}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                  onClick={() =>
                    setMobileSection((s) =>
                      s === (section.key as "products" | "research" | "company")
                        ? null
                        : (section.key as "products" | "research" | "company")
                    )
                  }
                >
                  {section.title}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      mobileSection === section.key ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {mobileSection === section.key && (
                  <div className="ml-4 flex flex-col gap-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => {
                          setMobileOpen(false);
                          setMobileSection(null);
                        }}
                        className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Button asChild className="mt-2">
              <Link to="/calculator" onClick={() => setMobileOpen(false)}>
                Start free
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
