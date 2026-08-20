"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar/NavBar";
import { getCurrentUser } from "@/services/authService";
import { createAppointment, deleteAppointment, getAppointments, getPendingAppointments, updateAppointment } from "@/services/appointmentService";
import { canUseSchedule, isAdmin } from "@/lib/authz";
import styles from "./page.module.css";

const days = ["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"];

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function mondayOf(date) {
  const result = new Date(date);
  const day = result.getDay() || 7;
  result.setDate(result.getDate() - day + 1);
  result.setHours(0, 0, 0, 0);
  return result;
}

function displayDate(date) {
  return date.toLocaleDateString("hr-HR", { day: "2-digit", month: "2-digit" });
}

function dateTimeValue(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date;
}

function localTime(value) {
  const date = dateTimeValue(value);
  return date ? date.toLocaleTimeString("hr-HR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }) : "";
}

function normalize(item) {
  return {
    id: item?.id ?? item?.Id,
    title: item?.title ?? item?.Title ?? "",
    startAt: item?.startAt ?? item?.StartAt,
    endAt: item?.endAt ?? item?.EndAt,
    repeatUntil: item?.repeatUntil ?? item?.RepeatUntil,
    notes: item?.notes ?? item?.Notes ?? "",
    createdByUserId: item?.createdByUserId ?? item?.CreatedByUserId,
    createdByName: item?.createdByName ?? item?.CreatedByName ?? "",
    createdByColor: item?.createdByColor ?? item?.CreatedByColor ?? "#91120c",
  };
}

function occursOnDay(appointment, dayKey) {
  const start = dateTimeValue(appointment.startAt);
  if (!start) return false;
  const startKey = dateKey(start);
  if (startKey === dayKey) return true;
  const until = dateTimeValue(appointment.repeatUntil);
  if (!until) return false;
  return dayKey > startKey && dayKey <= dateKey(until);
}

export default function SchedulePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [week, setWeek] = useState(() => mondayOf(new Date()));
  const [viewMode, setViewMode] = useState("week");
  const [appointments, setAppointments] = useState([]);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const createMenuRef = useRef(null);

  const weekDays = useMemo(() => days.map((label, index) => {
    const date = new Date(week);
    date.setDate(week.getDate() + index);
    return { label, date, key: dateKey(date) };
  }), [week]);

  const monthDays = useMemo(() => {
    const monthStart = new Date(week.getFullYear(), week.getMonth(), 1);
    const gridStart = mondayOf(monthStart);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return { label: days[index % 7], date, key: dateKey(date) };
    });
  }, [week]);

  const calendarDays = viewMode === "month" ? monthDays : weekDays;
  const visibleStart = calendarDays[0].date;
  const visibleEnd = new Date(calendarDays[calendarDays.length - 1].date);
  visibleEnd.setDate(visibleEnd.getDate() + 1);

  const load = async () => {
    setLoading(true);
    setError("");
    const [rangeResponse, pendingResponse] = await Promise.all([
      getAppointments(visibleStart.toISOString(), visibleEnd.toISOString()),
      getPendingAppointments(),
    ]);
    if (rangeResponse?.status >= 200 && rangeResponse.status < 300) {
      setAppointments((Array.isArray(rangeResponse.data) ? rangeResponse.data : []).map(normalize));
    } else {
      setAppointments([]);
      setError(rangeResponse?.data?.message || "Greška pri dohvaćanju rasporeda.");
    }
    if (pendingResponse?.status >= 200 && pendingResponse.status < 300) {
      setPendingAppointments((Array.isArray(pendingResponse.data) ? pendingResponse.data : []).map(normalize));
    } else {
      setPendingAppointments([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then((response) => {
      if (cancelled) return;
      if (!response?.data) {
        router.replace("/auth?from=/schedule");
        return;
      }
      setCurrentUser(response.data);
      setAuthChecked(true);
    });
    return () => { cancelled = true; };
  }, [router]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px), (pointer: coarse)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!showCreateMenu) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!createMenuRef.current?.contains(event.target)) setShowCreateMenu(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setShowCreateMenu(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [showCreateMenu]);

  useEffect(() => {
    if (currentUser && canUseSchedule(currentUser)) load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, week, viewMode]);

  const movePeriod = (amount) => {
    if (viewMode === "month") {
      setWeek(new Date(week.getFullYear(), week.getMonth() + amount, 1));
      return;
    }

    setWeek(new Date(week.getFullYear(), week.getMonth(), week.getDate() + amount * 7));
  };

  const openCreate = (date = selectedDate || dateKey(new Date())) => {
    setForm({ id: "", title: "", date, startTime: "08:00", endTime: "", repeatEndDate: "", notes: "", canDelete: false, isPending: false });
  };

  const openCreatePending = () => {
    setForm({ id: "", title: "", date: "", startTime: "", endTime: "", repeatEndDate: "", notes: "", canDelete: false, isPending: true });
  };

  const openCreateForDay = (date) => {
    setSelectedDate(date);
    openCreate(date);
  };

  const openEdit = (appointment) => {
    const start = dateTimeValue(appointment.startAt);
    const end = dateTimeValue(appointment.endAt);
    const isPending = !appointment.startAt;
    const isOwner = String(appointment.createdByUserId).toLowerCase() === String(currentUser?.id ?? currentUser?.Id).toLowerCase();
    const editable = isPending || isOwner;
    const canDelete = isPending || isOwner || isAdmin(currentUser);
    const repeatUntil = dateTimeValue(appointment.repeatUntil);
    setForm({ id: appointment.id, title: appointment.title, date: start ? dateKey(start) : "", startTime: start ? start.toTimeString().slice(0, 5) : "", endTime: end ? end.toTimeString().slice(0, 5) : "", repeatEndDate: repeatUntil ? dateKey(repeatUntil) : "", notes: appointment.notes || "", canDelete, readOnly: !editable, isPending, createdByName: appointment.createdByName });
  };

  const remove = async () => {
    if (!form?.id || !form.canDelete) return;
    setSaving(true);
    setError("");
    const response = await deleteAppointment(form.id);
    if (response?.status === 204 || (response?.status >= 200 && response.status < 300)) {
      setConfirmingDelete(false);
      setForm(null);
      await load();
    } else {
      setError(response?.data?.message || "Greška pri brisanju termina.");
    }
    setSaving(false);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const hasStart = Boolean(form.date && form.startTime);
    const startDate = hasStart ? new Date(`${form.date}T${form.startTime}`) : null;
    const endDate = hasStart && form.endTime ? new Date(`${form.date}T${form.endTime}`) : null;
    const repeatUntilDate = hasStart && form.repeatEndDate ? new Date(`${form.repeatEndDate}T00:00`) : null;
    if ((startDate && Number.isNaN(startDate.getTime())) || (endDate && Number.isNaN(endDate.getTime())) || (repeatUntilDate && Number.isNaN(repeatUntilDate.getTime()))) {
      setError("Neispravan datum ili vrijeme termina.");
      return;
    }
    if (repeatUntilDate && startDate && repeatUntilDate < new Date(`${form.date}T00:00`)) {
      setError("Datum ponavljanja mora biti nakon početka.");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title,
      startAt: startDate ? startDate.toISOString() : null,
      endAt: endDate ? endDate.toISOString() : null,
      repeatUntil: repeatUntilDate ? repeatUntilDate.toISOString() : null,
      notes: form.notes,
    };
    const response = form.id ? await updateAppointment(form.id, payload) : await createAppointment(payload);
    if (response?.status >= 200 && response.status < 300) {
      setForm(null);
      await load();
    } else {
      setError(response?.data?.message || "Greška pri spremanju termina.");
    }
    setSaving(false);
  };

  if (!authChecked) {
    return <><NavBar /><main className={styles.container}><div className={styles.card}>Učitavanje...</div></main></>;
  }

  if (!canUseSchedule(currentUser)) {
    return <><NavBar /><main className={styles.container}><div className={styles.card}>Nemate ovlasti za pristup rasporedu.</div></main></>;
  }

  return (
    <>
      <NavBar />
      <main className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div><h1 className={styles.title}>Raspored</h1><p className={styles.subtitle}>{viewMode === "month" ? week.toLocaleDateString("hr-HR", { month: "long", year: "numeric" }) : `Tjedan od ${displayDate(weekDays[0].date)} do ${displayDate(weekDays[6].date)}`}</p></div>
            <div className={styles.actions}><button type="button" onClick={() => movePeriod(-1)}>Prethodni</button><button type="button" onClick={() => setWeek(mondayOf(new Date()))}>Danas</button><button type="button" onClick={() => movePeriod(1)}>Sljedeći</button><div className={styles.viewToggle} role="group" aria-label="Prikaz rasporeda"><button type="button" className={viewMode === "week" ? styles.activeView : ""} onClick={() => setViewMode("week")}>Tjedan</button><button type="button" className={viewMode === "month" ? styles.activeView : ""} onClick={() => setViewMode("month")}>Mjesec</button></div></div>
          </div>
          {error ? <div className={styles.error}>{error}</div> : null}
          {pendingAppointments.length > 0 ? <div className={styles.pendingSection}><div className={styles.pendingHeader} onClick={() => { if (!isMobile) setShowPending((value) => !value); }}><h2 className={styles.pendingTitle}>Termini na čekanju ({pendingAppointments.length})</h2><button type="button" className={styles.pendingToggle} aria-expanded={showPending} onClick={(event) => { event.stopPropagation(); setShowPending((value) => !value); }}>{showPending ? "Sakrij" : "Prikaži"}</button></div>{showPending ? <div className={styles.pendingList}>{pendingAppointments.map((appointment) => <button type="button" key={appointment.id} className={styles.pendingItem} style={{ "--pending-color": appointment.createdByColor }} onClick={() => openEdit(appointment)}><strong>{appointment.title}</strong>{appointment.notes ? <span className={styles.pendingNotes}>{appointment.notes}</span> : null}<small>Dodao/la: {appointment.createdByName}</small></button>)}</div> : null}</div> : null}
          {loading ? <div className={styles.notice}>Učitavanje...</div> : <div key={viewMode} className={`${styles.grid} ${styles.calendarView} ${viewMode === "month" ? styles.monthGrid : ""}`}>{calendarDays.map((day) => <div className={`${styles.day} ${viewMode === "month" && day.date.getMonth() !== week.getMonth() ? styles.outsideMonth : ""}`} key={day.key}><button type="button" className={`${styles.dayHeader} ${selectedDate === day.key ? styles.selected : ""}`} onClick={() => openCreateForDay(day.key)}><strong>{viewMode === "month" ? day.date.getDate() : day.label}</strong><span>{viewMode === "month" ? day.label : displayDate(day.date)}</span></button><div className={styles.dayBody} onClick={() => { if (!isMobile) openCreateForDay(day.key); }}>{appointments.filter((appointment) => occursOnDay(appointment, day.key)).map((appointment) => { const editable = String(appointment.createdByUserId).toLowerCase() === String(currentUser?.id ?? currentUser?.Id).toLowerCase(); return <button type="button" key={appointment.id} className={styles.appointment} style={{ "--appointment-color": appointment.createdByColor }} onClick={(event) => { event.stopPropagation(); openEdit(appointment); }} title={editable ? "Uredi termin" : "Termin drugog korisnika"}><span className={styles.time}>{localTime(appointment.startAt)}{appointment.endAt ? `–${localTime(appointment.endAt)}` : ""}</span><strong>{appointment.title}</strong><small>{appointment.createdByName}</small></button>; })}</div></div>)}</div>}
          <div className={styles.createActions}><div className={styles.mobileCreateMenu} ref={createMenuRef}><div className={`${styles.mobileCreateOptions} ${showCreateMenu ? styles.mobileCreateOptionsOpen : ""}`} role="menu" aria-hidden={!showCreateMenu}><button type="button" className={`${styles.createButton} ${styles.mobileCreateOption}`} tabIndex={showCreateMenu ? 0 : -1} onClick={() => { setShowCreateMenu(false); openCreate(); }}>Novi termin</button><button type="button" className={`${styles.secondaryCreateButton} ${styles.mobileCreateOption}`} tabIndex={showCreateMenu ? 0 : -1} onClick={() => { setShowCreateMenu(false); openCreatePending(); }}>Novi termin na čekanju</button></div><button type="button" className={`${styles.mobileCreateTrigger} ${showCreateMenu ? styles.mobileCreateTriggerOpen : ""}`} aria-label={showCreateMenu ? "Zatvori izbornik za dodavanje termina" : "Dodaj termin"} aria-expanded={showCreateMenu} onClick={() => setShowCreateMenu((value) => !value)}><span className={styles.mobileCreateTriggerIcon} aria-hidden="true" /></button></div><button type="button" className={styles.createButton} onClick={() => openCreate()}>Novi termin</button><button type="button" className={styles.secondaryCreateButton} onClick={openCreatePending}>Novi termin na čekanju</button></div>
        </div>
      </main>
      {form ? <div className={styles.overlay}><form className={styles.modal} onSubmit={form.readOnly ? (event) => event.preventDefault() : submit}><div className={styles.modalHeader}><h2>{!form.id ? "Novi termin" : form.readOnly ? `Termin – ${form.createdByName}` : form.isPending ? "Dovrši termin (na čekanju)" : "Uredi termin"}</h2><button type="button" onClick={() => { setForm(null); setConfirmingDelete(false); }} aria-label="Zatvori">×</button></div><label>Naslov<input required maxLength="200" value={form.title} readOnly={form.readOnly} disabled={form.readOnly} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>{!form.id && form.isPending ? null : <><div className={styles.formRow}><label><span>Datum početka</span><input type="date" lang="hr-HR" value={form.date} readOnly={form.readOnly} disabled={form.readOnly} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label><label><span>Vrijeme početka</span><input type="time" lang="hr-HR" step="60" value={form.startTime} readOnly={form.readOnly} disabled={form.readOnly} onChange={(event) => setForm({ ...form, startTime: event.target.value })} /></label></div><div className={styles.formRow}><label><span>Datum završetka <span className={styles.optional}>(opcionalno)</span></span><input type="date" lang="hr-HR" min={form.date} value={form.repeatEndDate} readOnly={form.readOnly} disabled={form.readOnly} onChange={(event) => setForm({ ...form, repeatEndDate: event.target.value })} /></label><label><span>Vrijeme završetka <span className={styles.optional}>(opcionalno)</span></span><input type="time" lang="hr-HR" step="60" value={form.endTime} readOnly={form.readOnly} disabled={form.readOnly} onChange={(event) => setForm({ ...form, endTime: event.target.value })} /></label></div></>}<label>Bilješke<textarea maxLength="2000" rows="4" value={form.notes} readOnly={form.readOnly} disabled={form.readOnly} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label><div className={styles.modalActions}>{form.canDelete ? <button type="button" className={styles.deleteButton} onClick={() => setConfirmingDelete(true)} disabled={saving}>Obriši</button> : null}<button type="button" onClick={() => { setForm(null); setConfirmingDelete(false); }}>{form.readOnly ? "Zatvori" : "Odustani"}</button>{form.readOnly ? null : <button type="submit" disabled={saving}>{saving ? "Spremanje..." : "Spremi"}</button>}</div></form></div> : null}
      {confirmingDelete ? <div className="modal-overlay" role="presentation" onClick={(event) => { if (event.target === event.currentTarget && !saving) setConfirmingDelete(false); }}><div className="modal" role="alertdialog" aria-modal="true" aria-label="Potvrda brisanja termina" style={{ maxWidth: "420px" }}><div className="modal-header"><h3>Obrisati termin?</h3><button type="button" className="modal-close" onClick={() => setConfirmingDelete(false)} aria-label="Zatvori" disabled={saving}>×</button></div><div className="modal-body"><p>Ova radnja se ne može poništiti.</p></div><div className="modal-actions"><button type="button" className="modal-secondary" onClick={() => setConfirmingDelete(false)} disabled={saving}>Odustani</button><button type="button" className="modal-danger" onClick={remove} disabled={saving}>{saving ? "Brisanje..." : "Obriši"}</button></div></div></div> : null}
    </>
  );
}