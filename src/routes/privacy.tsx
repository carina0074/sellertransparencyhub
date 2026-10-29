import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy & Data Practices — Seller Transparency Hub" },
      { name: "description", content: "How Seller Transparency Hub uses analytics, voluntary research feedback, and newsletter subscriptions — and what we do not collect." },
      { property: "og:title", content: "Privacy & Data Practices" },
      { property: "og:description", content: "How Seller Transparency Hub uses analytics, voluntary research feedback, and newsletter subscriptions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Privacy"
        title="Privacy & Data Practices"
        description="What Seller Transparency Hub collects, why, and what we deliberately do not collect."
      />
      <section className="mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-6 lg:px-8">
        <Card className="border-border">
          <CardContent className="space-y-3 p-6 text-sm text-muted-foreground">
            <h2 className="text-base font-semibold text-foreground">Usage analytics</h2>
            <p>
              We use Google Analytics 4 to understand how the site is used: which pages are
              viewed, which marketplace filters and calculator options are selected, and whether
              resources are found useful. This helps us decide what to improve.
            </p>
            <p>
              Analytics reports may include aggregate, approximate geography (country or
              state-level) provided by Google Analytics. We do not build or store precise-location
              tracking ourselves.
            </p>
            <p>
              We never send email addresses, free-text feedback, product prices, revenue figures,
              or any other text you type into forms to Google Analytics.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="space-y-3 p-6 text-sm text-muted-foreground">
            <h2 className="text-base font-semibold text-foreground">Voluntary research feedback</h2>
            <p>
              Some pages include an optional "Was this resource useful?" prompt. If you choose to
              answer, we store your usefulness rating, the marketplaces and use cases you select,
              and any free-text comments you provide. This feedback is stored privately, is never
              published, and is never turned into a testimonial without your explicit permission.
            </p>
            <p>
              If you separately check the follow-up box, you may optionally provide an email
              address. That email is used only to invite you to a short research conversation.
              It is not added to the newsletter or any other mailing list, and it is not shared
              with third parties.
            </p>
            <p>
              Because feedback can optionally include an email address, feedback submissions are
              not anonymous. Submitting feedback is entirely voluntary.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="space-y-3 p-6 text-sm text-muted-foreground">
            <h2 className="text-base font-semibold text-foreground">Newsletter subscription</h2>
            <p>
              The newsletter is a separate, explicit opt-in. Subscribing stores your email address.
              Occasional updates when new research, reports, or dataset updates are published.
              Submitting research feedback never subscribes you to the
              newsletter, and subscribing to the newsletter is never required to use any tool.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="space-y-3 p-6 text-sm text-muted-foreground">
            <h2 className="text-base font-semibold text-foreground">What we do not collect</h2>
            <ul className="list-inside list-disc space-y-1">
              <li>Precise location data</li>
              <li>Sensitive demographic information</li>
              <li>Your sales figures, revenue, or business performance data</li>
              <li>Account passwords for any marketplace</li>
            </ul>
            <p>
              Calculator inputs stay in your browser session and are not stored as business data;
              only the selected marketplace and category are counted as anonymous usage events.
            </p>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
