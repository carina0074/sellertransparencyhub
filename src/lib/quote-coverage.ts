/** Counts records whose pricing_details.references include at least one non-empty quote. */
export function countRecordsWithQuote(records: ReadonlyArray<{ pricing_details?: unknown }>): number {
  return records.filter((r) => {
    const refs = (r.pricing_details as { references?: unknown } | null | undefined)?.references;
    return Array.isArray(refs) && refs.some((ref) => typeof ref?.quote === "string" && ref.quote.trim() !== "");
  }).length;
}
