/**
 * Pages withdrawn after publication.
 *
 * Kept in its own module because two very different places need the same list:
 * `proxy.ts` answers these with 410 Gone, and `app/sitemap.ts` must stop
 * advertising them. Those two disagreeing is the failure this prevents — a
 * sitemap that submits a URL the server then refuses reads to Search Console
 * as a broken site rather than a deliberate removal.
 *
 * Deliberately not folded into lib/knowledge.ts: the proxy runs on every
 * request, and importing that module would pull its category tables and
 * helpers into the edge bundle for no reason.
 *
 * Removing a card from the database is the other half of this. Unpublishing
 * alone yields a 404, which Google re-checks for months; this list is what
 * makes the removal read as permanent. Entries can be dropped once the URLs
 * have aged out of the index.
 */
export const GONE_PATHS: ReadonlySet<string> = new Set([
  // A T-bill auction result, filed under Consumer with a "send a legal notice"
  // call to action.
  '/knowledge-center/reserve-bank-announces-cutoff-prices-for-91-182-and-364day-tbill-auction-c82d63c9',
  // A UK waste-dumping fine, in GBP, on an Indian legal site.
  '/knowledge-center/fines-for-illegal-waste-dumping-raised-to-5000-7e04853c',
])

/** True when a path has been withdrawn and must not be served or advertised. */
export function isGone(pathname: string): boolean {
  return GONE_PATHS.has(pathname)
}
