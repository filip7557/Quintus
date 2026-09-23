"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar/NavBar";
import { getCurrentUser } from "@/services/authService";
import { canManageEstimates } from "@/lib/authz";
import styles from "./page.module.css";

export default function EstimateAccessGate({ redirectTo, children }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then((response) => {
      if (cancelled) return;
      if (!response?.data) {
        router.replace(`/auth?from=${encodeURIComponent(redirectTo)}`);
        return;
      }
      setCurrentUser(response.data);
      setAuthChecked(true);
    });
    return () => {
      cancelled = true;
    };
  }, [router, redirectTo]);

  if (!authChecked) {
    return (
      <>
        <NavBar />
        <main className={styles.container}>
          <div className={styles.gateCard}>Učitavanje...</div>
        </main>
      </>
    );
  }

  if (!canManageEstimates(currentUser)) {
    return (
      <>
        <NavBar />
        <main className={styles.container}>
          <div className={styles.gateCard}>
            Nemate ovlasti za pristup predračunima.
          </div>
        </main>
      </>
    );
  }

  return children;
}
