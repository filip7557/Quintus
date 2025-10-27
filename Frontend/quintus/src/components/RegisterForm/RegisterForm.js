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

  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const validatePassword = (pass) => {
    setPasswordChecks({
      length: pass.length >= 6,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[!@#$%^&*()_\-=+[\]{}|;:'",.<>?/`~]/.test(
        pass.replace(/[A-Za-z0-9]/g, "")
      ),
    });
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

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
          <div className={styles.form_row}>
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
          </div>

          <div className={styles.form_row}>
            <div className={styles.form_group}>
              <label htmlFor="tel">Broj telefona</label>
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
          </div>

          <div className={styles.form_row}>
            <div className={styles.form_group}>
              <label htmlFor="password">Lozinka</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Lozinka"
                value={password}
                onChange={handlePasswordChange}
              />
              <div className={styles.password_checks}>
                <div className={styles.password_checks}>
                  <div
                    className={`${styles.check_item} ${
                      passwordChecks.length ? styles.valid : styles.invalid
                    }`}
                  >
                    Najmanje 6 znakova
                  </div>
                  <div
                    className={`${styles.check_item} ${
                      passwordChecks.uppercase ? styles.valid : styles.invalid
                    }`}
                  >
                    Barem jedno veliko slovo
                  </div>
                  <div
                    className={`${styles.check_item} ${
                      passwordChecks.lowercase ? styles.valid : styles.invalid
                    }`}
                  >
                    Barem jedno malo slovo
                  </div>
                  <div
                    className={`${styles.check_item} ${
                      passwordChecks.number ? styles.valid : styles.invalid
                    }`}
                  >
                    Barem jedan broj
                  </div>
                  <div
                    className={`${styles.check_item} ${
                      passwordChecks.special ? styles.valid : styles.invalid
                    }`}
                  >
                    Barem jedan poseban znak
                  </div>
                </div>
              </div>
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
          </div>

          <button
            type="submit"
            className={styles.submit_btn}
            disabled={
              email.length < 10 ||
              !email.includes("@") ||
              !passwordChecks.length ||
              !passwordChecks.uppercase ||
              !passwordChecks.lowercase ||
              !passwordChecks.number ||
              !passwordChecks.special ||
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
