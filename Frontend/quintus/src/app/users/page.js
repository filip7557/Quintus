"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar/NavBar";
import { getCurrentUser } from "@/services/authService";
import { assignUserRole, getRoles, getUsers, hardDeleteUser, restoreUser, softDeleteUser, updateUserColor } from "@/services/userAdminService";
import { getRoleName, isAdmin, isAdminOrOwner } from "@/lib/authz";
import styles from "./page.module.css";

function valueOf(item, names, fallback = "") {
  for (const name of names) {
    if (item?.[name] !== undefined && item?.[name] !== null) return item[name];
  }
  return fallback;
}

function roleName(role) {
  return String(valueOf(role, ["name", "Name"], ""));
}

function normalizeColor(value) {
  const color = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color : "#91120c";
}

export default function UsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [colorEditor, setColorEditor] = useState(null); // { id, color }
  const colorPopoverRef = useRef(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name, mode: "soft" | "hard" | "restore" }
  const [deleting, setDeleting] = useState(false);

  const admin = isAdmin(currentUser);
  const canAccess = isAdminOrOwner(currentUser);
  const visibleRoles = admin
    ? roles
    : roles.filter((role) => ["worker", "user"].includes(roleName(role).toLowerCase()));

  const load = async (nextPage = page, nextPageSize = pageSize, nextShowDeleted = showDeleted) => {
    setLoading(true);
    setError("");
    const response = await getUsers({ search: search.trim() || undefined, role: roleFilter || undefined, page: nextPage, pageSize: nextPageSize, showDeleted: admin && nextShowDeleted });
    if (response?.status >= 200 && response.status < 300) {
      const payload = response.data || {};
      const items = Array.isArray(payload) ? payload : payload.items || payload.Items || [];
      const count = Number(valueOf(payload, ["totalCount", "TotalCount"], items.length));
      const pages = Number(valueOf(payload, ["totalPages", "TotalPages"], Math.max(1, Math.ceil(count / nextPageSize))));
      setUsers(items);
      setTotalCount(count);
      setTotalPages(Math.max(1, pages));
      setPage(nextPage);
      setPageSize(nextPageSize);
      window.history.replaceState(null, "", `?search=${encodeURIComponent(search)}&role=${encodeURIComponent(roleFilter)}&page=${nextPage}&pageSize=${nextPageSize}`);
    } else {
      setUsers([]);
      setError(response?.data?.message || "Greška pri dohvaćanju korisnika.");
    }
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    const initialize = async () => {
      const auth = await getCurrentUser();
      if (cancelled) return;
      if (!auth?.data) {
        router.replace("/auth?from=/users");
        return;
      }
      setCurrentUser(auth?.data || null);
      setAuthChecked(true);
      if (!auth?.data || !isAdminOrOwner(auth.data)) {
        setLoading(false);
        return;
      }
      const roleResponse = await getRoles();
      if (!cancelled && roleResponse?.status >= 200 && roleResponse.status < 300) {
        setRoles(Array.isArray(roleResponse.data) ? roleResponse.data : []);
      }
      await load(1, 10);
    };
    initialize();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const saveRole = async (user, roleId) => {
    const id = valueOf(user, ["id", "Id"]);
    setSavingId(`${id}:role`);
    const response = await assignUserRole(id, roleId);
    if (!(response?.status >= 200 && response.status < 300)) {
      setError(response?.data?.message || "Greška pri spremanju uloge.");
    } else {
      await load();
    }
    setSavingId("");
  };

  const openColorEditor = (user, event) => {
    const id = valueOf(user, ["id", "Id"]);
    const rect = event.currentTarget.getBoundingClientRect();
    const left = Math.min(rect.left, window.innerWidth - 260);
    // Popover height is ~150px; anchor its bottom to the button's top so it opens upward, above the button.
    setColorEditor({ id, color: normalizeColor(valueOf(user, ["color", "Color"], "")), anchor: { bottom: window.innerHeight - rect.top + 8, left: Math.max(8, left) } });
  };

  const cancelColorEditor = () => setColorEditor(null);

  const confirmColorEditor = async () => {
    if (!colorEditor) return;
    const { id, color } = colorEditor;
    setSavingId(`${id}:color`);
    const response = await updateUserColor(id, color);
    if (!(response?.status >= 200 && response.status < 300)) {
      setError(response?.data?.message || "Greška pri spremanju boje.");
    } else {
      await load();
    }
    setSavingId("");
    setColorEditor(null);
  };

  useEffect(() => {
    if (!colorEditor) return;
    const handleClickOutside = (event) => {
      if (colorPopoverRef.current && !colorPopoverRef.current.contains(event.target)) {
        setColorEditor(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [colorEditor]);

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { id, mode } = deleteTarget;
    setDeleting(true);
    setError("");
    const action = mode === "hard" ? hardDeleteUser : mode === "restore" ? restoreUser : softDeleteUser;
    const response = await action(id);
    if (!(response?.status >= 200 && response.status < 300)) {
      setError(response?.data?.message || response?.data || "Greška pri obradi zahtjeva.");
    } else {
      await load();
      setDeleteTarget(null);
    }
    setDeleting(false);
  };

  const toggleShowDeleted = (checked) => {
    setShowDeleted(checked);
    load(1, pageSize, checked);
  };


  if (!authChecked) {
    return <><NavBar /><main className={styles.container}><div className={styles.card}>Učitavanje...</div></main></>;
  }

  if (!canAccess) {
    return <><NavBar /><main className={styles.container}><div className={styles.card}>Nemate ovlasti za pristup.</div></main></>;
  }

  return (
    <>
      <NavBar />
      <main className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div><h1 className={styles.title}>Korisnici</h1><p className={styles.subtitle}>Upravljanje registriranim korisnicima, ulogama i bojama.</p></div>
            <span className={styles.summary}>Ukupno: {totalCount}</span>
          </div>
          <form className={styles.filters} onSubmit={(event) => { event.preventDefault(); load(1, pageSize); }}>
            <label className={styles.field}><span>Pretraga</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ime, prezime ili email" /></label>
            <label className={styles.field}><span>Uloga</span><select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}><option value="">Sve uloge</option>{roles.map((role) => <option key={valueOf(role, ["id", "Id"])} value={roleName(role)}>{roleName(role)}</option>)}</select></label>
            <button className={styles.primaryButton} type="submit" disabled={loading}>Primijeni</button>
            <button className={styles.secondaryButton} type="button" onClick={() => { setSearch(""); setRoleFilter(""); load(1, pageSize); }}>Reset</button>
            {admin ? (
              <label className={styles.toggleField}>
                <input type="checkbox" checked={showDeleted} onChange={(event) => toggleShowDeleted(event.target.checked)} />
                <span>Prikaži obrisane korisnike</span>
              </label>
            ) : null}
          </form>
          {error ? <div className={styles.error}>{error}</div> : null}
          <div className={styles.tableWrap}>
            <table className={styles.table}><thead><tr><th>Korisnik</th><th>Email</th><th>Telefon</th><th>Uloga</th><th>Boja</th>{admin ? <th>Akcije</th> : null}</tr></thead><tbody>
              {loading ? <tr><td colSpan={admin ? 6 : 5}>Učitavanje...</td></tr> : users.length === 0 ? <tr><td colSpan={admin ? 6 : 5}>Nema korisnika za odabrane filtere.</td></tr> : users.map((user) => {
                const id = valueOf(user, ["id", "Id"]);
                const currentRole = valueOf(user.role || user.Role, ["name", "Name"], valueOf(user, ["role", "Role"], ""));
                const currentRoleId = valueOf(
                  roles.find((role) => roleName(role).toLowerCase() === String(currentRole).toLowerCase()),
                  ["id", "Id"],
                  ""
                );
                const color = normalizeColor(valueOf(user, ["color", "Color"], ""));
                const roleLocked = !admin && ["admin", "owner"].includes(String(currentRole).toLowerCase());
                const roleOptions = roleLocked ? roles : visibleRoles;
                const isSelf = String(id).toLowerCase() === String(valueOf(currentUser, ["id", "Id"], "")).toLowerCase();
                const colorLocked = !admin && !isSelf && ["admin", "owner"].includes(String(currentRole).toLowerCase());
                const userName = `${valueOf(user, ["firstName", "FirstName"])} ${valueOf(user, ["lastName", "LastName"])}`.trim();
                const deleteDisabled = isSelf || String(currentRole).toLowerCase() === "admin";
                return <tr key={id}><td data-label="Korisnik">{valueOf(user, ["firstName", "FirstName"])} {valueOf(user, ["lastName", "LastName"])}</td><td data-label="Email">{valueOf(user, ["email", "Email"])}</td><td data-label="Telefon">{valueOf(user, ["phoneNumber", "PhoneNumber"], "—")}</td><td data-label="Uloga" className={styles.roleCell}><select value={currentRoleId} disabled={roleLocked || savingId === `${id}:role`} title={roleLocked ? "Samo Admin može mijenjati ovu ulogu." : undefined} onChange={(event) => saveRole(user, event.target.value)}>{roleOptions.map((role) => <option key={valueOf(role, ["id", "Id"])} value={valueOf(role, ["id", "Id"])}>{roleName(role)}</option>)}</select></td>{/* full role list only shown so a locked select still displays the correct current role */}<td data-label="Boja"><div className={styles.colorCell}><button type="button" className={styles.colorSwatchBtn} style={{ "--swatch-color": color }} onClick={(event) => { if (!colorLocked) openColorEditor(user, event); }} disabled={colorLocked || savingId === `${id}:color`} title={colorLocked ? "Owneri mogu mijenjati samo svoju boju ili boju Worker korisnika." : undefined} aria-label="Promijeni boju korisnika" /><span>{color}</span></div></td>{admin ? (
                  <td data-label="Akcije">
                    {showDeleted ? (
                      <button type="button" className={styles.secondaryButton} onClick={() => setDeleteTarget({ id, name: userName, mode: "restore" })}>Vrati</button>
                    ) : (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button type="button" className={styles.secondaryButton} disabled={deleteDisabled} title={deleteDisabled ? "Ne možete obrisati ovog korisnika." : undefined} onClick={() => setDeleteTarget({ id, name: userName, mode: "soft" })}>Obriši</button>
                        <button type="button" className="modal-danger" disabled={deleteDisabled} title={deleteDisabled ? "Ne možete obrisati ovog korisnika." : undefined} onClick={() => setDeleteTarget({ id, name: userName, mode: "hard" })}>Obriši trajno</button>
                      </div>
                    )}
                  </td>
                ) : null}</tr>;
              })}
            </tbody></table>
          </div>
          {colorEditor ? createPortal(
            <div className={styles.colorPopover} style={{ bottom: colorEditor.anchor.bottom, left: colorEditor.anchor.left }} role="dialog" aria-label="Odabir boje" ref={colorPopoverRef}>
              <div className={styles.colorPopoverActions}>
                <button type="button" className={styles.colorCancelBtn} onClick={cancelColorEditor}>Odustani</button>
                <button type="button" className={styles.colorConfirmBtn} onClick={confirmColorEditor} disabled={savingId === `${colorEditor.id}:color`}>{savingId === `${colorEditor.id}:color` ? "Spremanje..." : "Potvrdi"}</button>
              </div>
              <input type="color" value={colorEditor.color} onChange={(event) => setColorEditor({ ...colorEditor, color: event.target.value })} />
            </div>,
            document.body
          ) : null}
          {deleteTarget ? (
            <div className="modal-overlay" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) closeDeleteModal(); }}>
              <div className="modal" role="alertdialog" aria-modal="true" aria-label="Potvrda radnje" style={{ maxWidth: "420px" }}>
                <div className="modal-header">
                  <h3>
                    {deleteTarget.mode === "hard" ? "Trajno obrisati korisnika?" : deleteTarget.mode === "restore" ? "Vratiti korisnika?" : "Obrisati korisnika?"}
                  </h3>
                  <button type="button" className="modal-close" onClick={closeDeleteModal} aria-label="Zatvori" disabled={deleting}>×</button>
                </div>
                <div className="modal-body">
                  <p>{deleteTarget.name}</p>
                  {deleteTarget.mode === "hard" ? (
                    <p>Ova radnja se ne može poništiti. Svi termini i zahtjevi ovog korisnika bit će trajno obrisani.</p>
                  ) : deleteTarget.mode === "restore" ? (
                    <p>Korisnik će ponovno postati vidljiv i moći će se prijaviti.</p>
                  ) : (
                    <p>Korisnik će biti sakriven i neće se moći prijaviti, ali podaci ostaju sačuvani. Radnju je moguće poništiti.</p>
                  )}
                </div>
                <div className="modal-actions">
                  <button type="button" className="modal-secondary" onClick={closeDeleteModal} disabled={deleting}>Odustani</button>
                  <button type="button" className={deleteTarget.mode === "hard" ? "modal-danger" : "modal-primary"} onClick={confirmDelete} disabled={deleting}>
                    {deleting ? "Obrada..." : deleteTarget.mode === "hard" ? "Obriši trajno" : deleteTarget.mode === "restore" ? "Vrati" : "Obriši"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          <div className={styles.paginationBar}>
            <div className={styles.paginationInfo}>Stranica {page} od {totalPages}</div>
            <div className={styles.paginationControls}>
              <label htmlFor="userPageSize" className={styles.pageSizeLabel}>Po stranici</label>
              <select id="userPageSize" className={styles.pageSizeSelect} value={pageSize} onChange={(event) => load(1, Number(event.target.value))} disabled={loading}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <button type="button" className={styles.secondaryButton} onClick={() => load(page - 1)} disabled={loading || page <= 1}>Prethodna</button>
              <button type="button" className={styles.primaryButton} onClick={() => load(page + 1)} disabled={loading || page >= totalPages}>Sljedeća</button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
