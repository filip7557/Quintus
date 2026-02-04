"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

import NavBar from "@/components/NavBar/NavBar";

import useCanManageSite from "@/hooks/useCanManageSite";
import { getRoleName } from "@/lib/authz";
import { getCurrentUser } from "@/services/authService";
import { addOwnerByEmail, getOwners } from "@/services/ownerAdminService";
import { useToast } from "@/components/Common/ToastProvider";

function normalizeOwnersPayload(respData) {
  if (!respData) return [];
  if (Array.isArray(respData)) return respData;
  if (Array.isArray(respData.items)) return respData.items;
  if (Array.isArray(respData.owners)) return respData.owners;
  return [];
}

function getEmail(owner) {
  return owner?.email ?? owner?.Email ?? owner?.userName ?? owner?.UserName ?? "";
}

function getId(owner) {
  return owner?.id ?? owner?.Id ?? getEmail(owner);
}

export default function OwnersAdminPage() {
  const { showToast } = useToast();
  const { canManage, loading: canManageLoading } = useCanManageSite();

  const [meRole, setMeRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [owners, setOwners] = useState([]);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canAccess = canManage; // keep consistent with the rest of the site

  const ownersSorted = useMemo(() => {
    const list = Array.isArray(owners) ? [...owners] : [];
    list.sort((a, b) => getEmail(a).localeCompare(getEmail(b)));
    return list;
  }, [owners]);

  const refresh = async () => {
    setError("");
    setLoading(true);
    try {
      const resp = await getOwners();
      const ok = resp?.status === 200;
      if (!ok) {
        setError(resp?.data?.message || "Greška pri dohvaćanju vlasnika.");
        setOwners([]);
        return;
      }
      setOwners(normalizeOwnersPayload(resp.data));
    } catch {
      setError("Greška pri dohvaćanju vlasnika.");
      setOwners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const me = await getCurrentUser();
      const role = getRoleName(me?.data || me) || "";
      if (!cancelled) setMeRole(role);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!canAccess) {
      setLoading(false);
      return;
    }
    refresh();
  }, [canAccess]);

  const onAdd = async () => {
    const trimmed = String(email || "").trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError("");
    try {
      const resp = await addOwnerByEmail(trimmed);
      const ok = resp?.status === 200 || resp?.status === 201 || resp?.status === 204;
      if (!ok) {
        const msg = resp?.data?.message || "Greška pri dodavanju vlasnika.";
        setError(msg);
        showToast({ type: "error", title: "Neuspješno", message: msg });
        return;
      }

      showToast({ type: "success", title: "Spremljeno", message: "Vlasnik je dodan." });
      setEmail("");
      await refresh();
    } catch {
      setError("Greška pri dodavanju vlasnika.");
      showToast({ type: "error", title: "Greška", message: "Pokušajte ponovno." });
    } finally {
      setSubmitting(false);
    }
  };

  if (canManageLoading) {
    return (
      <>
        <NavBar />
        <main className={styles.container}>
          <div className={styles.requestCard}>Učitavanje...</div>
        </main>
      </>
    );
  }

  if (!canAccess) {
    return (
      <>
        <NavBar />
        <main className={styles.container}>
          <div className={styles.requestCard}>
            Nemate ovlasti za pristup. (Role: {meRole || "-"})
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className={styles.container}>
        <div className={styles.requestCard}>
          <div className={styles.header}>
            <h1 className={styles.title}>Admin: Vlasnici (Owner)</h1>
            <p className={styles.subtitle}>
              Dodajte vlasnika po email adresi ili pregledajte listu vlasnika.
            </p>
          </div>

          <div className={styles.form}>
            <label className={styles.formGrow}>
              <div className={styles.label}>Dodaj vlasnika po emailu</div>
              <input
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="npr. osoba@email.com"
                inputMode="email"
                autoComplete="email"
                disabled={submitting}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onAdd();
                  }
                }}
              />
            </label>

            <button
              type="button"
              className={styles.primaryBtn}
              onClick={onAdd}
              disabled={submitting || !String(email || "").trim()}
            >
              {submitting ? "Dodavanje..." : "Dodaj"}
            </button>

            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={refresh}
              disabled={submitting}
            >
              Osvježi
            </button>
          </div>

          <div className={styles.help}>
            Dodavanje radi tako da prvo pronađe korisnika po email adresi, pa ga postavlja u ulogu Owner.
          </div>

          {error ? <div className={styles.errorMessage}>{error}</div> : null}

          <div className={styles.list}>
            {loading ? (
              <div className={styles.meta}>Učitavanje liste...</div>
            ) : ownersSorted.length === 0 ? (
              <div className={styles.meta}>Nema vlasnika za prikaz.</div>
            ) : (
              ownersSorted.map((o) => (
                <div key={getId(o)} className={styles.row}>
                  <div className={styles.email}>{getEmail(o) || "(bez emaila)"}</div>
                  <div className={styles.meta}>
                    {o?.role?.name || o?.Role || o?.role || "Owner"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
}
