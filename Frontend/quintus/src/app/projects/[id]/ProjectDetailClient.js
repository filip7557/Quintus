"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, ImagePlus, Images, Pencil, RotateCcw, Trash2, X } from "lucide-react";
import { useToast } from "@/components/Common/ToastProvider";
import { deleteProject, deleteProjectPhoto, getProject, getProjectPhotos, projectError, uploadProjectPhoto } from "@/services/projectService";
import ProjectForm from "../ProjectForm";
import { GalleryDialog, GalleryImage, Pagination } from "../GalleryUI";
import { formatPhotoCount } from "../labels";
import styles from "../page.module.css";

function PhotoViewer({ photos, initialIndex, projectName, onClose }) {
  const [index, setIndex] = useState(initialIndex);
  const touch = useRef(null);
  useEffect(() => {
    const handleKey = event => {
      if (event.key === "ArrowLeft") { event.preventDefault(); setIndex(value => Math.max(0, value - 1)); }
      if (event.key === "ArrowRight") { event.preventDefault(); setIndex(value => Math.min(photos.length - 1, value + 1)); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [photos.length]);
  return <GalleryDialog title={projectName} onClose={onClose} wide>
    <div className={styles.viewerStage} onTouchStart={event => { touch.current = event.changedTouches[0].clientX; }}
      onTouchEnd={event => {
        if (touch.current === null) return;
        const distance = event.changedTouches[0].clientX - touch.current;
        if (Math.abs(distance) > 50) setIndex(value => Math.max(0, Math.min(photos.length - 1, value + (distance < 0 ? 1 : -1))));
        touch.current = null;
      }}>
      <GalleryImage key={photos[index].id} src={photos[index].url} alt={`${projectName}, fotografija ${index + 1}`} contain loading="eager" />
    </div>
    <div className={styles.viewerControls}>
      <button className={styles.iconBtn} onClick={() => setIndex(value => value - 1)} disabled={index === 0} title="Prethodna fotografija" aria-label="Prethodna fotografija"><ChevronLeft size={22} /></button>
      <span aria-live="polite">{index + 1} / {photos.length}</span>
      <button className={styles.iconBtn} onClick={() => setIndex(value => value + 1)} disabled={index === photos.length - 1} title="Sljedeća fotografija" aria-label="Sljedeća fotografija"><ChevronRight size={22} /></button>
    </div>
  </GalleryDialog>;
}

export default function ProjectDetailClient({ id }) {
  const [project, setProject] = useState(null);
  const [photos, setPhotos] = useState(null);
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [viewer, setViewer] = useState(null);
  const [queue, setQueue] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [leaveTarget, setLeaveTarget] = useState(null);
  const input = useRef(null);
  const queueRef = useRef([]);
  const activeUpload = useRef(null);
  const mounted = useRef(false);
  const running = useRef(false);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      activeUpload.current?.abort();
      queueRef.current.forEach(item => URL.revokeObjectURL(item.preview));
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [metadata, gallery] = await Promise.all([getProject(id, controller.signal), getProjectPhotos(id, page, controller.signal)]);
        if (!controller.signal.aborted) { setProject(metadata); setPhotos(gallery); }
      } catch (failure) {
        if (!controller.signal.aborted) setError(projectError(failure));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [id, page, revision]);

  useEffect(() => {
    if (!uploading) return;
    const beforeUnload = event => { event.preventDefault(); event.returnValue = ""; };
    const onClick = event => {
      const link = event.target.closest?.("a[href]");
      if (!link || link.target === "_blank" || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const destination = new URL(link.href, window.location.href);
      if (destination.href === window.location.href) return;
      event.preventDefault();
      event.stopPropagation();
      setLeaveTarget(destination.href);
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", onClick, true);
    return () => { window.removeEventListener("beforeunload", beforeUnload); document.removeEventListener("click", onClick, true); };
  }, [uploading]);

  const updateItem = (itemId, values) => {
    queueRef.current = queueRef.current.map(item => item.id === itemId ? { ...item, ...values } : item);
    if (mounted.current) setQueue([...queueRef.current]);
  };

  const uploadItems = async items => {
    if (running.current) return;
    running.current = true;
    setUploading(true);
    let completed = 0;
    try {
      for (const selected of items) {
        if (!mounted.current) break;
        const item = queueRef.current.find(entry => entry.id === selected.id);
        if (!item || !item.valid) continue;
        const controller = new AbortController();
        activeUpload.current = controller;
        updateItem(item.id, { status: "uploading", progress: 0, error: "" });
        try {
          await uploadProjectPhoto(id, item.file, event => {
            const progress = Math.min(100, Math.round(event.loaded / (event.total || item.file.size) * 100));
            updateItem(item.id, { progress });
          }, controller.signal);
          updateItem(item.id, { status: "done", progress: 100 });
          completed++;
        } catch (failure) {
          if (controller.signal.aborted) break;
          updateItem(item.id, { status: "failed", error: projectError(failure) });
          if (failure?.response?.status === 404 || failure?.response?.status === 403) break;
        }
      }
    } finally {
      running.current = false;
      activeUpload.current = null;
      if (mounted.current) {
        setUploading(false);
        setRevision(value => value + 1);
        if (completed) showToast({ type: "success", message: `Prijenos dovršen: ${formatPhotoCount(completed)}.` });
      }
    }
  };

  const selectFiles = event => {
    const selected = Array.from(event.target.files || []).map(file => {
      const valid = file.size > 0 && file.size <= 20 * 1024 * 1024;
      return { id: crypto.randomUUID(), file, preview: URL.createObjectURL(file), valid, status: valid ? "queued" : "invalid", progress: 0,
        error: file.size === 0 ? "Datoteka je prazna." : valid ? "" : "Najveća veličina slike je 20 MB." };
    });
    event.target.value = "";
    queueRef.current = [...queueRef.current, ...selected];
    setQueue([...queueRef.current]);
    if (selected.some(item => item.valid)) uploadItems(selected);
  };

  const removeQueueItem = itemId => {
    const item = queueRef.current.find(entry => entry.id === itemId);
    if (item) URL.revokeObjectURL(item.preview);
    queueRef.current = queueRef.current.filter(entry => entry.id !== itemId);
    setQueue([...queueRef.current]);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      if (confirmation.type === "project") {
        await deleteProject(id);
        showToast({ type: "success", message: "Projekt je obrisan." });
        router.push("/projects");
      } else {
        await deleteProjectPhoto(id, confirmation.photo.id);
        setConfirmation(null);
        setRevision(value => value + 1);
        showToast({ type: "success", message: "Fotografija je obrisana." });
      }
    } catch (failure) { setDeleteError(projectError(failure)); }
    finally { setDeleting(false); }
  };

  return <main className={styles.container}>
    <div className={styles.content}>
      <Link href="/projects" className={styles.back}><ArrowLeft size={18} />Galerija projekata</Link>
      {error && <div className={styles.error} role="alert">{error}<button className={styles.secondaryBtn} onClick={() => setRevision(value => value + 1)}>Pokušaj ponovno</button></div>}
      {!project ? !error && <p className={styles.notice} role="status">Učitavanje projekta...</p> : <>
        <div className={styles.header}>
          <div><h1 className={styles.title}>{project.name}</h1><p className={styles.notice}>Dodano {new Date(project.createdAt).toLocaleDateString("hr-HR")}</p></div>
          <div className={styles.actions}>
            <button className={styles.secondaryBtn} disabled={uploading || deleting} onClick={() => setEditing(true)}><Pencil size={18} />Uredi</button>
            <button className={styles.dangerBtn} disabled={uploading || deleting} onClick={() => { setDeleteError(""); setConfirmation({ type: "project" }); }}><Trash2 size={18} />Obriši projekt</button>
          </div>
        </div>
        {(project.description || project.address || project.clientName) && <dl className={styles.metadata}>
          {project.address && <div><dt>Adresa / lokacija</dt><dd>{project.address}</dd></div>}
          {project.clientName && <div><dt>Kupac / klijent</dt><dd>{project.clientName}</dd></div>}
          {project.description && <div className={styles.description}><dt>Opis</dt><dd>{project.description}</dd></div>}
        </dl>}
        <section aria-label="Fotografije projekta">
          <div className={styles.photoHeader}>
            <h2>Fotografije <span className={styles.notice}>({photos?.totalCount ?? project.photoCount})</span></h2>
            <button className={styles.primaryBtn} onClick={() => input.current.click()} disabled={uploading || deleting}><ImagePlus size={20} />{uploading ? "Prijenos u tijeku..." : "Dodaj fotografije"}</button>
            <input className={styles.visuallyHidden} tabIndex={-1} aria-label="Odaberi fotografije" ref={input} type="file" multiple accept="image/*" onChange={selectFiles} disabled={uploading || deleting} />
          </div>
          {queue.length > 0 && <>
            <ul className={styles.uploadQueue} aria-label="Prijenos fotografija">{queue.map(item => <li className={styles.uploadRow} key={item.id}>
              <div className={styles.uploadPreview}><GalleryImage src={item.preview} alt={item.file.name} loading="eager" /></div>
              <div className={styles.uploadInfo}>
                <span className={styles.uploadName}>{item.file.name}</span>
                <span className={`${styles.uploadStatus} ${item.status === "done" ? styles.success : item.error ? styles.failure : ""}`} role="status">
                  {item.status === "done" ? "Spremljeno" : item.error || (item.status === "uploading" ? item.progress === 100 ? "Spremanje..." : `${item.progress}%` : "Čeka prijenos")}
                </span>
                {item.status === "uploading" && <progress value={item.progress} max={100} aria-label={`Prijenos ${item.file.name}`} />}
              </div>
              <div className={styles.actions}>
                {item.status === "done" && <Check size={20} className={styles.success} aria-label="Spremljeno" />}
                {(item.status === "failed" || item.status === "queued") && <button className={styles.iconBtn} disabled={uploading} onClick={() => uploadItems([item])} title="Pokušaj ponovno" aria-label={`Ponovi prijenos: ${item.file.name}`}><RotateCcw size={18} /></button>}
                {item.status !== "uploading" && <button className={styles.iconBtn} onClick={() => removeQueueItem(item.id)} title="Ukloni iz popisa" aria-label={`Ukloni iz popisa: ${item.file.name}`}><X size={18} /></button>}
              </div>
            </li>)}</ul>
          </>}
          {loading ? <div className={styles.photoGrid} aria-busy="true">{Array.from({ length: 4 }, (_, index) => <div key={index} className={styles.skeleton} />)}</div> : !error && !photos?.items?.length ? <div className={styles.empty}><Images size={40} /><h2>Još nema fotografija</h2></div> : !error && <div className={styles.photoGrid}>
            {photos.items.map((photo, index) => <div key={photo.id} className={styles.photoTile}>
              <button className={styles.photoOpen} onClick={() => setViewer(index)} aria-label={`Otvori fotografiju ${index + 1}: ${project.name}`}><GalleryImage src={photo.url} alt={`${project.name}, fotografija ${index + 1}`} loading={index < 4 ? "eager" : "lazy"} /></button>
              <button className={`${styles.iconBtn} ${styles.photoDelete}`} disabled={uploading || deleting} title="Obriši fotografiju" aria-label={`Obriši fotografiju ${index + 1}`} onClick={() => { setDeleteError(""); setConfirmation({ type: "photo", photo }); }}><Trash2 size={18} /></button>
            </div>)}
          </div>}
          {!error && <Pagination data={photos} disabled={loading || uploading || deleting} onChange={value => { setPage(value); setViewer(null); }} />}
        </section>
      </>}
    </div>
    {editing && <ProjectForm project={project} onClose={() => setEditing(false)} onSaved={saved => { setProject(saved); setEditing(false); showToast({ type: "success", message: "Projekt je spremljen." }); }} />}
    {viewer !== null && photos?.items?.[viewer] && <PhotoViewer photos={photos.items} initialIndex={viewer} projectName={project.name} onClose={() => setViewer(null)} />}
    {confirmation && <GalleryDialog title={confirmation.type === "project" ? "Obriši projekt?" : "Obriši fotografiju?"} onClose={() => setConfirmation(null)} busy={deleting}>
      <p className={styles.confirmText}>{confirmation.type === "project" ? `Projekt „${project.name}” i sve njegove fotografije bit će trajno obrisani.` : "Fotografija će biti trajno obrisana iz projekta."}</p>
      {deleteError && <p className={styles.error} role="alert">{deleteError}</p>}
      <div className={styles.actions}><button className={styles.secondaryBtn} disabled={deleting} onClick={() => setConfirmation(null)}>Odustani</button><button className={styles.dangerBtn} disabled={deleting} onClick={confirmDelete}><Trash2 size={18} />{deleting ? "Brisanje..." : "Obriši"}</button></div>
    </GalleryDialog>}
    {leaveTarget && <GalleryDialog title="Napustiti prijenos?" onClose={() => setLeaveTarget(null)}>
      <p className={styles.confirmText}>Prijenos je u tijeku. Već spremljene fotografije ostat će u projektu; preostali prijenosi bit će prekinuti.</p>
      <div className={styles.actions}><button className={styles.secondaryBtn} onClick={() => setLeaveTarget(null)}>Ostani</button><button className={styles.dangerBtn} onClick={() => { activeUpload.current?.abort(); window.location.assign(leaveTarget); }}>Napusti stranicu</button></div>
    </GalleryDialog>}
  </main>;
}