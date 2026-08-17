"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar/NavBar";
import { getCurrentUser } from "@/services/authService";
import { assignUserRole, getRoles, getUsers, updateUserColor } from "@/services/userAdminService";
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

  const admin = isAdmin(currentUser);
  const canAccess = isAdminOrOwner(currentUser);
  const visibleRoles = admin
    ? roles
    : roles.filter((role) => ["worker", "user"].includes(roleName(role).toLowerCase()));

  const load = async (nextPage = page, nextPageSize = pageSize) => {
    setLoading(true);
    setError("");
    const response = await getUsers({ search: search.trim() || undefined, role: roleFilter || undefined, page: nextPage, pageSize: nextPageSize });
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
          </form>
          {error ? <div className={styles.error}>{error}</div> : null}
          <div className={styles.tableWrap}>
            <table className={styles.table}><thead><tr><th>Korisnik</th><th>Email</th><th>Telefon</th><th>Uloga</th><th>Boja</th></tr></thead><tbody>
              {loading ? <tr><td colSpan="5">Učitavanje...</td></tr> : users.length === 0 ? <tr><td colSpan="5">Nema korisnika za odabrane filtere.</td></tr> : users.map((user) => {
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
                return <tr key={id}><td data-label="Korisnik">{valueOf(user, ["firstName", "FirstName"])} {valueOf(user, ["lastName", "LastName"])}</td><td data-label="Email">{valueOf(user, ["email", "Email"])}</td><td data-label="Telefon">{valueOf(user, ["phoneNumber", "PhoneNumber"], "—")}</td><td data-label="Uloga" className={styles.roleCell}><select value={currentRoleId} disabled={roleLocked || savingId === `${id}:role`} title={roleLocked ? "Samo Admin može mijenjati ovu ulogu." : undefined} onChange={(event) => saveRole(user, event.target.value)}>{roleOptions.map((role) => <option key={valueOf(role, ["id", "Id"])} value={valueOf(role, ["id", "Id"])}>{roleName(role)}</option>)}</select></td>{/* full role list only shown so a locked select still displays the correct current role */}<td data-label="Boja"><div className={styles.colorCell}><button type="button" className={styles.colorSwatchBtn} style={{ "--swatch-color": color }} onClick={(event) => { if (!colorLocked) openColorEditor(user, event); }} disabled={colorLocked || savingId === `${id}:color`} title={colorLocked ? "Owneri mogu mijenjati samo svoju boju ili boju Worker korisnika." : undefined} aria-label="Promijeni boju korisnika" /><span>{color}</span></div></td></tr>;
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
