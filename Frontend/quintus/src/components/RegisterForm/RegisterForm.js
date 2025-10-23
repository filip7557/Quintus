"use client";

import { useState } from "react";
import styles from "./RegisterForm.module.css";

import { register } from "@/services/authService";

export default function RegisterForm({ setIsRegister, router }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Lozinke se ne podudaraju.");
      return;
    }
    try {
      register({ email, firstName, lastName, password, phoneNumber })
        .then((res) => {
          if (res?.status === 200) {
            setIsRegister(false);
            router.push("/login");
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
    <div className={styles.register_form}>
      <div className={styles.register_card}>
        <div className={styles.register_header}>
          <h2 className={styles.register_title}>Registracija</h2>
          <p className={styles.register_subtitle}>
            Kreirajte svoj račun za nastavak.
          </p>
        </div>

        {error && <p className={styles.error_message}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className={styles.form_group}>
            <label htmlFor="given-name">Ime</label>
            <input
              id="given-name"
              name="given-name"
              type="text"
              placeholder="Ime"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
            />
          </div>

          <div className={styles.form_group}>
            <label htmlFor="family-name">Prezime</label>
            <input
              id="family-name"
              name="family-name"
              type="text"
              placeholder="Prezime"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
            />
          </div>

          <div className={styles.form_group}>
            <label htmlFor="tel">Broj tefelona</label>
            <input
              id="tel"
              name="tel"
              type="tel"
              placeholder="Broj telefona"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              autoComplete="tel"
            />
          </div>

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
            />
          </div>

          <div className={styles.form_group}>
            <label htmlFor="confirm-password">Potvrdite lozinku</label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              placeholder="Potvrdite lozinku"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className={styles.submit_btn}
            disabled={
              email.length < 10 ||
              !email.includes("@") ||
              password.length < 4 ||
              password !== confirmPassword ||
              firstName.length < 3 ||
              lastName.length < 3
            }
          >
            Registracija
          </button>

          <button
            type="button"
            className={styles.secondary_btn}
            onClick={() => router.back()}
          >
            Natrag
          </button>

          <p className={styles.toggle_text}>
            Već imate račun?{" "}
            <span
              className={styles.toggle_link}
              onClick={() => setIsRegister(false)}
            >
              Prijavite se.
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
