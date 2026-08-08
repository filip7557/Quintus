import RequestDetailsClient from "./RequestDetailsClient";

export default async function RequestDetailsPage({ params }) {
  const resolvedParams = await params;
  return <RequestDetailsClient requestId={resolvedParams?.id} />;
}
