"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { saveProject, projectError } from "@/services/projectService";
import { GalleryDialog } from "./GalleryUI";
import styles from "./page.module.css";

export default function ProjectForm({ project, onClose, onSaved }) {
  const [values, setValues] = useState({ name: project?.name || "", description: project?.description || "", address: project?.address || "", clientName: project?.clientName || "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const change = event => setValues(current => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async event => {
    event.preventDefault();
    if (!values.name.trim()) { setError("Naziv projekta je obavezan."); return; }
    setBusy(true);
    setError("");
    try { onSaved(await saveProject(values, project?.id)); }
    catch (failure) { setError(projectError(failure)); setBusy(false); }
  };
  return <GalleryDialog title={project ? "Uredi projekt" : "Novi projekt"} onClose={onClose} busy={busy}>
    <form onSubmit={submit} className={styles.form}>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <fieldset disabled={busy} className={styles.fields}>
        <label>Naziv projekta<input name="name" value={values.name} onChange={change} required maxLength={200} autoFocus autoComplete="off" /></label>
        <label>Opis <span>(neobavezno)</span><textarea name="description" value={values.description} onChange={change} rows={4} maxLength={4000} /></label>
        <label>Adresa / lokacija <span>(neobavezno)</span><input name="address" value={values.address} onChange={change} maxLength={500} /></label>
        <label>Kupac / klijent <span>(neobavezno)</span><input name="clientName" value={values.clientName} onChange={change} maxLength={200} /></label>
      </fieldset>
      <div className={styles.actions}>
        <button type="button" className={styles.secondaryBtn} onClick={onClose} disabled={busy}>Odustani</button>
        <button type="submit" className={styles.primaryBtn} disabled={busy}><Save size={18} />{busy ? "Spremanje..." : "Spremi projekt"}</button>
      </div>
    </form>
  </GalleryDialog>;
}