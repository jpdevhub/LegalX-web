/**
 * Every service slug the site names must exist in the catalogue.
 *
 * The footer once linked to /documents/fssai-registration, a service that is
 * not in DOCUMENTS. Because the footer renders on every page, Next prefetched
 * that 404 everywhere, on every load.
 *
 * Two shapes are checked: a hardcoded href, and the FEATURED_SERVICE_SLUGS
 * list the footer now derives its links from.
 */
const fs = require('fs')

const docs = fs.readFileSync('lib/documents.ts', 'utf8')
// Quoted literals only. A looser `slug: .(...)` also matched the TypeScript
// annotation `slug: string`, putting 'tring' in the set — so a link to
// /documents/tring would have passed.
const slugs = new Set([...docs.matchAll(/slug: '([a-z0-9-]+)'/g)].map(m => m[1]))
if (slugs.size < 5) {
  console.error(`Only read ${slugs.size} slugs from lib/documents.ts — the check would be near-vacuous.`)
  process.exit(1)
}

const bad = []

for (const f of ['components/layout/Footer.tsx', 'components/layout/Header.tsx']) {
  const src = fs.readFileSync(f, 'utf8')
  for (const m of src.matchAll(/["'`]\/documents\/([a-z0-9-]+)/g)) {
    if (!slugs.has(m[1])) bad.push(`${f}: hardcoded /documents/${m[1]}`)
  }
}

// The derived list, which a hardcoded-href scan cannot see.
const footer = fs.readFileSync('components/layout/Footer.tsx', 'utf8')
const listed = footer.match(/FEATURED_SERVICE_SLUGS\s*=\s*\[([\s\S]*?)\]/)
if (listed) {
  for (const m of listed[1].matchAll(/['"]([a-z0-9-]+)['"]/g)) {
    if (!slugs.has(m[1])) bad.push(`Footer FEATURED_SERVICE_SLUGS: ${m[1]}`)
  }
}

if (bad.length) {
  console.error('Service slugs that do not exist in the catalogue:\n  ' + bad.join('\n  '))
  process.exit(1)
}
console.log(`All ${slugs.size} catalogue slugs resolve; no dead service links.`)
