import ProjectDetailClient from "./ProjectDetailClient";

export default async function ProjectPage({ params }) {
  const { id } = await params;
  return <ProjectDetailClient key={id} id={id} />;
}