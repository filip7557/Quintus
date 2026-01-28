"use client";

import { useState } from "react";
import Link from "next/link";

import NavBar from "@/components/NavBar/NavBar";
import styles from "./page.module.css";

import { forgotPassword } from "@/services/authService";

function getApiMessage(payload) {
  if (!payload) return "";
  if (typeof payload === "string") return payload;
  if (typeof payload === "object") {
    return payload.message || payload.title || payload.error || "";
  }
  return "";
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState({
    loading: false,
    ok: false,
    message: "",
  });

  const submit = async (e) => {
    e.preventDefault();

    const trimmed = String(email || "").trim();
    if (!trimmed) {
      setState({ loading: false, ok: false, message: "Unesite email adresu." });
      return;
    }

    setState({ loading: true, ok: false, message: "" });

    const res = await forgotPassword(trimmed);
    const ok = res?.status >= 200 && res?.status < 300;

    const message =
      getApiMessage(res?.data) ||
      (ok
        ? "Zahtjev za reset lozinke je poslan. Provjerite email."
        : "Slanje zahtjeva nije uspjelo.");

    setState({ loading: false, ok, message });
  };

  return (
    <>
      <NavBar />
      <main className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Zaboravljena lozinka</h1>
          <p className={styles.helpText}>
            Unesite email adresu i poslat ćemo vam link za reset lozinke.
          </p>

          <form className={styles.form} onSubmit={submit}>
            <label className={styles.label}>
              Email
              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vas@email.com"
                autoComplete="email"
                disabled={state.loading}
              />
            </label>

            <button className={styles.button} type="submit" disabled={state.loading}>
              {state.loading ? "Slanje..." : "Pošalji reset link"}
            </button>
          </form>

          {state.message ? (
            <div className={`${styles.notice} ${state.ok ? styles.success : styles.error}`}>
              {state.message}
            </div>
          ) : null}

          <div className={styles.actions}>
            <Link href="/auth" className={styles.link}>
              Povratak na prijavu
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
