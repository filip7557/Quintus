"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import NavBar from "@/components/NavBar/NavBar";
import styles from "./page.module.css";

import { resetPassword } from "@/services/authService";

function getApiMessage(payload) {
  if (!payload) return "";
  if (typeof payload === "string") return payload;
  if (typeof payload === "object") {
    return payload.message || payload.title || payload.error || "";
  }
  return "";
}

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const token = useMemo(() => {
    const raw = searchParams.get("token") || searchParams.get("t") || "";
    return String(raw).trim();
  }, [searchParams]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [state, setState] = useState({
    loading: false,
    ok: false,
    message: "",
  });

  const passwordsMismatch =
    Boolean(confirmPassword) && newPassword !== confirmPassword;

  const canSubmit =
    Boolean(token) &&
    !state.loading &&
    Boolean(newPassword) &&
    newPassword.length >= 6 &&
    Boolean(confirmPassword) &&
    !passwordsMismatch;

  const EyeIcon = ({ open }) => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      {open ? (
        <>
          <path
            d="M12 5c7 0 10 7 10 7s-3 7-10 7S2 12 2 12s3-7 10-7Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </>
      ) : (
        <>
          <path
            d="M3 3l18 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.42-4.42"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M6.22 6.22C3.61 8.08 2 12 2 12s3 7 10 7c2.03 0 3.74-.47 5.14-1.2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.88 5.08C10.55 4.9 11.26 4.8 12 4.8c7 0 10 7.2 10 7.2s-1.05 2.52-3.22 4.58"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );

  useEffect(() => {
    // Clear previous messages when URL changes.
    setState({ loading: false, ok: false, message: "" });
  }, [queryString]);

  const submit = async (e) => {
    e.preventDefault();

    if (!token) {
      setState({
        loading: false,
        ok: false,
        message: "Nedostaje token za reset lozinke.",
      });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setState({
        loading: false,
        ok: false,
        message: "Lozinka mora imati najmanje 6 znakova.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setState({ loading: false, ok: false, message: "Lozinke se ne podudaraju." });
      return;
    }

    setState({ loading: true, ok: false, message: "" });

    const res = await resetPassword(token, newPassword);
    const ok = res?.status >= 200 && res?.status < 300;

    if (ok) {
      setState({
        loading: false,
        ok: true,
        message: "Lozinka je uspješno promijenjena.",
      });
      return;
    }

    const message =
      getApiMessage(res?.data) ||
      "Reset lozinke nije uspio. Provjerite link ili zatražite novi.";

    setState({ loading: false, ok: false, message });
  };

  return (
    <>
      <NavBar />
      <main className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Reset lozinke</h1>

          {state.ok ? (
            <>
              <div className={`${styles.notice} ${styles.success}`}>
                Lozinka je uspješno promijenjena. Sada se možete prijaviti.
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.button}
                  onClick={() => router.push("/auth")}
                >
                  Prijava
                </button>
              </div>
            </>
          ) : (
            <>
              {!token ? (
                <div className={`${styles.notice} ${styles.error}`}>
                  Nedostaje token u URL-u.
                </div>
              ) : null}

              <form className={styles.form} onSubmit={submit}>
                <label className={styles.label}>
                  Nova lozinka
                  <div className={styles.passwordField}>
                    <input
                      className={styles.input}
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nova lozinka"
                      autoComplete="new-password"
                      disabled={state.loading}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowNewPassword((v) => !v)}
                      disabled={state.loading}
                      aria-label={showNewPassword ? "Sakrij lozinku" : "Prikaži lozinku"}
                    >
                      <EyeIcon open={showNewPassword} />
                    </button>
                  </div>
                </label>

                <label className={styles.label}>
                  Potvrdite lozinku
                  <div className={styles.passwordField}>
                    <input
                      className={styles.input}
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Potvrdite lozinku"
                      autoComplete="new-password"
                      disabled={state.loading}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      disabled={state.loading}
                      aria-label={showConfirmPassword ? "Sakrij lozinku" : "Prikaži lozinku"}
                    >
                      <EyeIcon open={showConfirmPassword} />
                    </button>
                  </div>
                  {passwordsMismatch ? (
                    <div className={styles.mismatchHint}>Lozinke se ne podudaraju.</div>
                  ) : null}
                </label>

                <button className={styles.button} type="submit" disabled={!canSubmit}>
                  {state.loading ? "Spremanje..." : "Promijeni lozinku"}
                </button>
              </form>

              {state.message ? (
                <div className={`${styles.notice} ${state.ok ? styles.success : styles.error}`}>
                  {state.message}
                </div>
              ) : null}

              <div className={styles.actions}>
                <Link href="/auth" prefetch={false} className={styles.link}>
                  Povratak na prijavu
                </Link>
                <span className={styles.divider}>•</span>
                <Link href="/forgot-password" className={styles.link}>
                  Zatraži novi link
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className={styles.container} />}>
      <ResetPasswordInner />
    </Suspense>
  );
}
