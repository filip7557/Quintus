"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import NavBar from "@/components/NavBar/NavBar";
import styles from "./page.module.css";

import { getCurrentUser } from "@/services/authService";
import { getUserProfileById } from "@/services/userService";
import { isAdminOrOwner } from "@/lib/authz";

function canViewOtherProfiles(currentUser) {
  return isAdminOrOwner(currentUser);
}

function pickProfileField(profile, candidates) {
  for (const key of candidates) {
    const value = profile?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return "";
}

function ProfilePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestedId = useMemo(() => {
    const id = searchParams.get("id");
    return id ? String(id).trim() : "";
  }, [searchParams]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      setProfile(null);

      const auth = await getCurrentUser();
      if (!auth?.data) {
        router.push(`/auth?from=/profile${requestedId ? `?id=${encodeURIComponent(requestedId)}` : ""}`);
        return;
      }

      if (cancelled) return;
      setCurrentUser(auth.data);

      if (requestedId) {
        if (!canViewOtherProfiles(auth.data)) {
          setError("Nemate ovlasti za pregled tuđih profila.");
          setLoading(false);
          return;
        }

        const response = await getUserProfileById(requestedId);
        if (cancelled) return;

        if (response?.status >= 200 && response?.status < 300) {
          setProfile(response.data);
        } else {
          setError(response?.data?.message || "Greška pri dohvaćanju profila.");
        }
      } else {
        // For own profile, reuse currentUser to avoid an extra request.
        setProfile(auth.data);
      }

      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [router, requestedId]);

  const firstName = useMemo(
    () =>
      profile
        ? pickProfileField(profile, ["FirstName", "firstName", "givenName", "ime"])
        : "",
    [profile]
  );

  const lastName = useMemo(
    () =>
      profile
        ? pickProfileField(profile, ["LastName", "lastName", "surname", "prezime"])
        : "",
    [profile]
  );

  const email = useMemo(
    () =>
      profile
        ? pickProfileField(profile, ["Email", "email", "userName", "username"])
        : "",
    [profile]
  );

  const phone = useMemo(
    () =>
      profile
        ? pickProfileField(profile, [
            "PhoneNumber",
            "phoneNumber",
            "phone",
            "telefon",
          ])
        : "",
    [profile]
  );

  const isViewingOther = Boolean(requestedId);
  const requestsCount = 0;

  return (
    <>
      <NavBar />
      <main className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Moj profil</h1>
          </div>

          {loading ? (
            <div className={styles.notice}>Učitavanje...</div>
          ) : error ? (
            <div className={`${styles.notice} ${styles.error}`}>{error}</div>
          ) : profile ? (
            <>
              <div className={styles.infoGrid}>
                <div className={styles.field}>
                  <span className={styles.label}>Ime</span>
                  <div className={styles.value}>{firstName || "—"}</div>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Prezime</span>
                  <div className={styles.value}>{lastName || "—"}</div>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Email</span>
                  <div className={styles.value}>{email || "—"}</div>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Telefon</span>
                  <div className={styles.value}>{phone || "—"}</div>
                </div>
              </div>

              <div className={styles.requestsBlock}>
                <div className={styles.requestsText}>
                  <p className={styles.requestsTitle}>
                    {isViewingOther ? "Zahtjevi korisnika" : "Moji zahtjevi"}
                  </p>
                  <p className={styles.requestsSubtitle}>
                    { isViewingOther ? "Broj zahtjeva korisnika." : "Broj zahtjeva koje ste kreirali." }
                  </p>
                </div>
                <div className={styles.requestsMeta}>
                  <span className={styles.requestsCount} title="U izradi">
                    {requestsCount}
                  </span>
                  {requestsCount === 0 ? (
                    <span
                      className={`${styles.button} ${styles.buttonSecondary} ${styles.buttonDisabled}`}
                      aria-disabled="true"
                      title="Nema zahtjeva"
                    >
                      Otvori
                    </span>
                  ) : (
                    <Link
                      href={
                        isViewingOther
                          ? `/requests?userId=${encodeURIComponent(requestedId)}`
                          : "/requests"
                      }
                      className={`${styles.button} ${styles.buttonSecondary}`}
                    >
                      Otvori
                    </Link>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className={styles.notice}>Nema podataka o profilu.</div>
          )}

          <div className={styles.actions}>
            <Link href="/" className={`${styles.button} ${styles.buttonSecondary}`}>
              Početna
            </Link>
            {isViewingOther ? (
              <Link href="/profile" className={styles.button}>
                Moj profil
              </Link>
            ) : null}
          </div>
        </div>
      </main>
    </>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className={styles.container} />}>
      <ProfilePageInner />
    </Suspense>
  );
}
