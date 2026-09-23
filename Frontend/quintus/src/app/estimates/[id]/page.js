import EstimateDetailsClient from "./EstimateDetailsClient";

export default async function EstimateDetailsPage({ params }) {
  const resolvedParams = await params;
  return <EstimateDetailsClient estimateId={resolvedParams?.id} />;
}
