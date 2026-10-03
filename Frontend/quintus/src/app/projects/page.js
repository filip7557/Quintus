"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderOpen, MapPin, Plus, Search, UserRound } from "lucide-react";
import { getProjects, projectError } from "@/services/projectService";
import ProjectForm from "./ProjectForm";
import { GalleryImage, Pagination } from "./GalleryUI";
import { formatPhotoCount, formatProjectCount } from "./labels";
import styles from "./page.module.css";

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const results = await getProjects({ search, page, pageSize: 12 }, controller.signal);
        if (!controller.signal.aborted) setData(results);
      }
      catch (failure) { if (!controller.signal.aborted) setError(projectError(failure)); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [search, page, attempt]);

  return <main className={styles.container}>
    <div className={styles.content}>
      <div className={styles.projectHeading}>
        <div><h1 className={styles.title}>Galerija projekata</h1><p className={styles.notice}>{data ? formatProjectCount(data.totalCount) : "Projekti"}</p></div>
        <button className={styles.primaryBtn} onClick={() => setCreating(true)}><Plus size={20} />Novi projekt</button>
      </div>
      <div className={styles.toolbar}>
        <label className={styles.search}><Search size={20} /><input aria-label="Pretraži projekte" placeholder="Naziv, adresa ili klijent" value={search} maxLength={200} onChange={event => { setSearch(event.target.value); setPage(1); }} /></label>
      </div>
      {error && <div className={styles.error} role="alert">{error}<button className={styles.secondaryBtn} onClick={() => setAttempt(value => value + 1)}>Pokušaj ponovno</button></div>}
      <section aria-label="Projekti" aria-busy={loading}>
        {loading && !data ? <div className={styles.projectGrid}>{Array.from({ length: 6 }, (_, index) => <div key={index} className={styles.skeleton} />)}</div>
          : !error && !data?.items?.length ? <div className={styles.empty}><FolderOpen size={40} /><h2>{search ? "Nema rezultata" : "Još nema projekata"}</h2>{search ? <button className={styles.secondaryBtn} onClick={() => { setSearch(""); setPage(1); }}>Očisti pretragu</button> : <button className={styles.primaryBtn} onClick={() => setCreating(true)}><Plus size={18} />Novi projekt</button>}</div>
          : !error && <div className={styles.projectGrid}>{data.items.map((project, index) => <Link key={project.id} href={`/projects/${project.id}`} className={styles.projectCard}>
            <div className={styles.projectCover}><GalleryImage key={project.coverUrl || "empty"} src={project.coverUrl} alt={project.name} loading={index < 3 ? "eager" : "lazy"} /><span className={styles.photoCount}>{formatPhotoCount(project.photoCount)}</span></div>
            <div className={styles.projectBody}><h2>{project.name}</h2>{project.address && <p><MapPin size={15} /><span>{project.address}</span></p>}{project.clientName && <p><UserRound size={15} /><span>{project.clientName}</span></p>}<time dateTime={project.createdAt}>{new Date(project.createdAt).toLocaleDateString("hr-HR")}</time></div>
          </Link>)}</div>}
      </section>
      {!error && <Pagination data={data} disabled={loading} onChange={value => { setPage(value); window.scrollTo({ top: 0, behavior: "smooth" }); }} />}
    </div>
    {creating && <ProjectForm onClose={() => setCreating(false)} onSaved={project => router.push(`/projects/${project.id}`)} />}
  </main>;
}