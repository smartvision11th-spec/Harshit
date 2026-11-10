import { Helmet } from 'react-helmet-async';
import { SITE, SERVICES } from '../config/site';

/**
 * Manages document title, canonical URL and LocalBusiness structured data.
 * Static Open Graph / Twitter tags live in index.html so crawlers that do not run JS still see them.
 * The structured data below uses the placeholder values from src/config/site.ts. Update them before launch.
 */
export default function SEO() {
  const base = SITE.url.replace(/\/$/, '');

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SITE.name,
    description: SITE.description,
    telephone: SITE.phoneHref.startsWith('+') ? SITE.phoneHref : `+${SITE.phoneHref}`,
    email: SITE.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.addressLine,
      addressLocality: SITE.city,
    },
    sameAs: [SITE.instagramUrl],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Detailing services',
      itemListElement: SERVICES.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.name, description: s.short },
      })),
    },
  };
  if (base) {
    jsonLd.url = base;
    jsonLd.image = `${base}/og-image.jpg`;
  }

  return (
    <Helmet>
      <title>Velocity Auto Detailing | Ceramic Coating, PPF &amp; Paint Correction</title>
      {base && <link rel="canonical" href={`${base}/`} />}
      {base && <meta property="og:url" content={`${base}/`} />}
      {base && <meta property="og:image" content={`${base}/og-image.jpg`} />}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}
