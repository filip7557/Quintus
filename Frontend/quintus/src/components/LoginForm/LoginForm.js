"use client";

import { useState } from "react";
import styles from "./LoginForm.module.css";

import { login } from "@/services/authService";

export default function LoginForm({ setIsRegister, router, redirectTo = "/" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      login(email, password)
        .then((res) => {
          if (res?.status === 200) {
            // successful login - navigate to redirectTo or home
            router.push(redirectTo);
          } else {
            setError(res?.data || "Nešto je pošlo po zlu. Pokušajte ponovno.");
          }
        })
        .catch((res) => {
          setError(res?.data || "Nešto je pošlo po zlu. Pokušajte ponovno.");
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (e) {
      setError(e?.data || "Nešto je pošlo po zlu. Pokušajte ponovno.");
      setLoading(false);
    }
  };

  function handleBackClick() {
    router.back();
    setTimeout(() => {
    window.location.reload(); // force reload after navigation
  }, 100);
  }

  return (
    <div className={styles.login_form}>
      <div className={styles.login_card}>
        <div className={styles.login_header}>
          <h2 className={styles.login_title}>Dobrodošli!</h2>
          <p className={styles.login_subtitle}>
            Molimo vas prijavite se za nastavak.
          </p>
        </div>

        {error && <p className={styles.error_message}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className={styles.form_group}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className={styles.form_group}>
            <label htmlFor="password">Lozinka</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Lozinka"
              value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className={styles.submit_btn}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className={styles.spinner}
                  width="16"
                  height="16"
                  viewBox="0 0 50 50"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-hidden="true"
                >
                  <circle
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    stroke="white"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray="31.4 31.4"
                    strokeDashoffset="0"
                  />
                </svg>
                Učitavanje...
              </>
            ) : (
              "Prijava"
            )}
          </button>

          <button
            type="button"
            className={styles.secondary_btn}
            onClick={handleBackClick}
            disabled={loading}
          >
            Natrag
          </button>

          <p className={styles.toggle_text}>
            Nemate račun?{" "}
            <span
              className={styles.toggle_link}
              onClick={() => setIsRegister(true)}
            >
              Registrirajte se.
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
