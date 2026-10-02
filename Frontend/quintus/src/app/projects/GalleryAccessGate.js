"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import NavBar from "@/components/NavBar/NavBar";
import { subscribeToAuthChanges } from "@/services/authService";
import api from "@/lib/api";
import { canManageProjects } from "@/lib/authz";
import styles from "./page.module.css";

export default function GalleryAccessGate({ children }) {
  const [access, setAccess] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let generation = 0;
    let cancelled = false;
    const check = async () => {
      const current = ++generation;
      try {
        const response = await api.get("/Auth/getCurrentUser");
        if (cancelled || current !== generation) return;
        if (!response?.data || response.status === 401) {
          setAccess("denied");
          router.replace(`/auth?from=${encodeURIComponent(pathname)}`);
        } else if (response.status !== 200) {
          setAccess("error");
        } else {
          setAccess(canManageProjects(response.data) ? "allowed" : "denied");
        }
      } catch (failure) {
        if (cancelled || current !== generation) return;
        if (failure?.response?.status === 401) {
          setAccess("denied");
          router.replace(`/auth?from=${encodeURIComponent(pathname)}`);
        } else {
          setAccess(failure?.response?.status === 403 ? "denied" : "error");
        }
      }
    };
    check();
    const unsubscribe = subscribeToAuthChanges(check);
    return () => { cancelled = true; unsubscribe(); };
  }, [router, pathname, attempt]);

  return <>
    <NavBar />
    {access === "allowed" ? children : <main className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Galerija projekata</h1>
        <p role="status" className={styles.notice}>
          {access === "loading" ? "Provjera pristupa..." : access === "error" ? "Pristup nije moguće provjeriti." : "Nemate ovlasti za pristup galeriji."}
        </p>
        {access === "error" && <button className={styles.secondaryBtn} onClick={() => setAttempt(value => value + 1)}>Pokušaj ponovno</button>}
      </div>
    </main>}
  </>;
}