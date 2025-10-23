"use client";

import { useState } from "react";
import styles from "./LoginForm.module.css";

import { login } from "@/services/authService";

export default function LoginForm({ setIsRegister, router }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      login(email, password)
        .then((res) => {
          console.log(res.data);
          if (res?.status === 200) {
            router.push("/");
          } else {
            setError(res?.data || "Nešto je pošlo po zlu. Pokušajte ponovno.");
          }
        })
        .catch((res) => {
          setError(res?.data || "Nešto je pošlo po zlu. Pokušajte ponovno.");
        });
    } catch (e) {
      setError("Nešto je pošlo po zlu. Pokušajte ponovno.");
    }
  };

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
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className={styles.submit_btn}
            disabled={
              email.length < 10 || !email.includes("@") || password.length < 4
            }
          >
            Prijava
          </button>

          <button
            type="button"
            className={styles.secondary_btn}
            onClick={() => router.back()}
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
