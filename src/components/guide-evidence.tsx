import { ArchiveCopyLink } from "@/components/archive-copy-link";
import { formatVerificationDate } from "@/lib/coverage-statistics";

export function GuideEvidence({ references, checked }: {
  references: { title: string; url: string; heading?: string; quote?: string }[];
  checked: string;
}) {
  return <section>
    <h2 className="text-xl font-semibold">eBay's exact wording</h2>
    <div className="mt-4 space-y-6">
      {references.map((reference, index) => <div key={`${reference.url}-${index}`}>
        <p className="text-sm font-medium">{reference.heading ?? "Source heading not recorded"}</p>
        <blockquote className="mt-3 border-l-2 border-primary pl-5">{reference.quote ?? "Supporting quote not recorded."}</blockquote>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <a href={reference.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{reference.title} ↗</a>
          <ArchiveCopyLink url={reference.url} />
        </div>
      </div>)}
    </div>
    <p className="mt-4 text-xs text-muted-foreground">Last checked: {formatVerificationDate(checked)}</p>
  </section>;
}