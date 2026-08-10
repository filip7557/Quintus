"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import NavBar from "@/components/NavBar/NavBar";
import styles from "./page.module.css";

import { resendVerification, verifyEmail } from "@/services/authService";

function getApiMessage(response) {
  const data = response?.data;
  if (!data) return "";
  if (typeof data === "string") return data;
  return data.message || data.title || data.error || "";
}

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const params = useMemo(() => {
    const entries = Array.from(searchParams.entries());
    const obj = {};
    for (const [key, value] of entries) obj[key] = value;

    // Backends commonly use either `token` or `t`.
    if (!obj.token && obj.t) obj.token = obj.t;

    return obj;
  }, [searchParams]);

  const token = params.token ? String(params.token).trim() : "";

  const [verifyState, setVerifyState] = useState({
    loading: true,
    ok: false,
    message: "",
  });

  const [email, setEmail] = useState(() => {
    const initialEmail = params.email ? String(params.email).trim() : "";
    return initialEmail;
  });

  const [resendState, setResendState] = useState({
    loading: false,
    ok: false,
    message: "",
  });

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setVerifyState({ loading: true, ok: false, message: "" });

      if (!token) {
        setVerifyState({
          loading: false,
          ok: false,
          message: "Nedostaje token za potvrdu email adrese.",
        });
        return;
      }

      const response = await verifyEmail(params);
      if (cancelled) return;

      const ok = response?.status >= 200 && response?.status < 300;
      const message =
        getApiMessage(response) ||
        (ok
          ? "Email adresa je uspješno potvrđena."
          : "Potvrda email adrese nije uspjela.");

      setVerifyState({ loading: false, ok, message });

      // If backend returns email inside the response, prefer that.
      const returnedEmail =
        typeof response?.data === "object" ? response?.data?.email : undefined;
      if (!email && returnedEmail) setEmail(String(returnedEmail));
    };

    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  const resend = async (e) => {
    e.preventDefault();

    const trimmed = String(email || "").trim();
    if (!trimmed) {
      setResendState({
        loading: false,
        ok: false,
        message: "Unesite email adresu.",
      });
      return;
    }

    setResendState({ loading: true, ok: false, message: "" });

    const response = await resendVerification(trimmed);
    const ok = response?.status >= 200 && response?.status < 300;
    const message =
      getApiMessage(response) ||
      (ok
        ? "Verifikacijski email je ponovno poslan."
        : "Slanje verifikacijskog emaila nije uspjelo.");

    setResendState({ loading: false, ok, message });
  };

  return (
    <>
      <NavBar />
      <main className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Potvrda email adrese</h1>

          {verifyState.loading ? (
            <div className={styles.notice}>Provjera u tijeku...</div>
          ) : (
            <div
              className={`${styles.notice} ${
                verifyState.ok ? styles.success : styles.error
              }`}
            >
              {verifyState.message}
            </div>
          )}

          {!verifyState.loading && verifyState.ok ? (
            <div className={styles.primaryActions}>
              <Link href="/auth" prefetch={false} className={styles.buttonLink}>
                Prijava
              </Link>
            </div>
          ) : null}

          <div className={styles.resendBlock}>
            <h2 className={styles.subtitle}>Niste primili email?</h2>
            <p className={styles.helpText}>
              Ako je link istekao ili je već korišten, možete zatražiti novi.
            </p>

            <form className={styles.form} onSubmit={resend}>
              <label className={styles.label}>
                Email
                <input
                  className={styles.input}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vas@email.com"
                  autoComplete="email"
                />
              </label>

              <button
                className={styles.button}
                type="submit"
                disabled={resendState.loading}
              >
                {resendState.loading
                  ? "Slanje..."
                  : "Ponovno pošalji verifikaciju"}
              </button>

              {resendState.message ? (
                <div
                  className={`${styles.notice} ${
                    resendState.ok ? styles.success : styles.error
                  }`}
                >
                  {resendState.message}
                </div>
              ) : null}
            </form>
          </div>

          <div className={styles.actions}>
            <Link href="/auth" prefetch={false} className={styles.link}>
              Prijava
            </Link>
            <span className={styles.divider}>•</span>
            <Link href="/" className={styles.link}>
              Početna
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className={styles.container} />}>
      <VerifyEmailInner />
    </Suspense>
  );
}
