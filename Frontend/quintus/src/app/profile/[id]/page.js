import ProfileByIdClient from "./ProfileByIdClient";

export default async function ProfileByIdPage({ params }) {
  const resolvedParams = await params;
  return <ProfileByIdClient userId={resolvedParams?.id} />;
}
