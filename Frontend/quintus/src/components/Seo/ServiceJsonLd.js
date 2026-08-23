import { getSiteUrl } from "@/lib/siteUrl";

function pick(value, pascalKey, camelKey) {
  return value?.[pascalKey] ?? value?.[camelKey];
}

export default function ServiceJsonLd({ service, slug }) {
  const siteUrl = getSiteUrl();
  const name = pick(service, "Title", "title");
  const description = pick(service, "Description", "description");
  const imageUrls = pick(service, "ImageUrls", "imageUrls") ?? [];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `${siteUrl}/usluge/${slug}`,
    image: Array.isArray(imageUrls) ? imageUrls : undefined,
    provider: {
      "@type": ["LocalBusiness", "HVACBusiness"],
      "@id": `${siteUrl}/#business`,
      name: "Quintus",
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Slavonija, Hrvatska",
    },
  };

  const serializedSchema = JSON.stringify(schema).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializedSchema }}
    />
  );
}
