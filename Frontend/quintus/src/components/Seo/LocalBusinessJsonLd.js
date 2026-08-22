const SITE_URL = "https://www.instalacije-quintus.hr";
const LOGO_URL =
  "https://www.instalacije-quintus.hr/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdzhmn7c4d%2Fimage%2Fupload%2Fv1780157613%2Fquintus_images%2Fzv34ptnsgknm1jookolw.png&w=640&q=75";

function pick(value, pascalKey, camelKey) {
  return value?.[pascalKey] ?? value?.[camelKey];
}

function cleanText(value) {
  const text = String(value ?? "").trim();

  if (
    !text ||
    text === "Nije postavljeno" ||
    /\bX+\b/i.test(text) ||
    text === "+385912345678"
  ) {
    return undefined;
  }

  return text;
}

function getServices(settings) {
  const value = pick(settings, "Services", "services");

  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.$values)) return value.$values;
  return [];
}

function buildOffers(settings) {
  return getServices(settings)
    .map((service) => {
      const name = cleanText(pick(service, "Title", "title"));
      const description = cleanText(
        pick(service, "Description", "description")
      );

      if (!name) return null;

      return {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name,
          ...(description ? { description } : {}),
        },
      };
    })
    .filter(Boolean);
}

function buildLocalBusinessSchema(settings) {
  const address = cleanText(pick(settings, "Address", "address"));
  const telephone = cleanText(pick(settings, "PhoneNumber", "phoneNumber"));
  const email = cleanText(pick(settings, "ContactEmail", "contactEmail"));
  const offers = buildOffers(settings);

  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "HVACBusiness"],
    "@id": `${SITE_URL}/#business`,
    name: "Quintus",
    url: SITE_URL,
    logo: LOGO_URL,
    image: LOGO_URL,
    description:
      "Ovlašteni monteri klima uređaja za montažu, servis i održavanje u Našicama i Slavoniji, uz usluge grijanja, vode i plina.",
    knowsLanguage: "hr",
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Slavonija, Hrvatska",
    },
    ...(address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: address,
            addressCountry: "HR",
          },
        }
      : {}),
    ...(telephone ? { telephone } : {}),
    ...(email ? { email } : {}),
    ...(offers.length
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            itemListElement: offers,
          },
        }
      : {}),
  };
}

export default function LocalBusinessJsonLd({ settings }) {
  const schema = buildLocalBusinessSchema(settings);
  const serializedSchema = JSON.stringify(schema).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializedSchema }}
    />
  );
}