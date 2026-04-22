import OfferDetailsClient from "./OfferDetailsClient";

export default async function OfferDetailsPage({ params }) {
  const resolvedParams = await params;
  return <OfferDetailsClient offerId={resolvedParams?.id} />;
}
