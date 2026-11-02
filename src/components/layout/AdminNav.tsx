import { Link } from "@tanstack/react-router";

const ACTIVE = "font-semibold text-foreground underline underline-offset-4";
const INACTIVE = "font-medium text-muted-foreground hover:text-foreground hover:underline";

/** Shared navigation between the private admin pages. */
export function AdminNav() {
  return (
    <nav aria-label="Admin sections" className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
      <Link
        to="/admin/subscribers"
        activeProps={{ className: ACTIVE }}
        inactiveProps={{ className: INACTIVE }}
      >
        Subscribers
      </Link>
      <Link
        to="/admin/feedback"
        activeProps={{ className: ACTIVE }}
        inactiveProps={{ className: INACTIVE }}
      >
        Feedback
      </Link>
      <Link
        to="/admin/evidence"
        activeProps={{ className: ACTIVE }}
        inactiveProps={{ className: INACTIVE }}
      >
        Evidence &amp; alerts
      </Link>
    </nav>
  );
}
