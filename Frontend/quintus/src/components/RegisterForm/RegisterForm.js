"use client";

import { useState } from "react";
import styles from "./RegisterForm.module.css";

import { register } from "@/services/authService";
import { getEmailWarning, getPasswordWarning, getPhoneWarning } from "@/lib/formValidation";

function getApiMessage(payload) {
  if (!payload) return "";
  if (typeof payload === "string") return payload;
  if (typeof payload === "object") {
    return payload.message || payload.title || payload.error || "";
  }
  return "";
}

export default function RegisterForm({ setIsRegister, router, onRegistered }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const validatePassword = (pass) => {
    setPasswordChecks({
      length: pass.length >= 8 && pass.length <= 128,
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
    if (formWarning) {
      setError(formWarning);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      register({ email, firstName, lastName, password, phoneNumber })
        .then((res) => {
          if (res?.status === 200) {
            const message =
              getApiMessage(res?.data) ||
              "Verifikacijski email je poslan. Potvrdite email adresu prije prijave.";

            if (typeof onRegistered === "function") {
              onRegistered({ email, message });
            } else {
              setIsRegister(false);
            }
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
      setError("Nešto je pošlo po zlu. Pokušajte ponovno.");
      setLoading(false);
    }
  };

  function handleBackClick() {
    router.back();
    setTimeout(() => {
      window.location.reload(); // force reload after navigation
    }, 100);
  }

  const formWarning =
    firstName.trim().length > 0 && firstName.trim().length < 3
      ? "Ime mora imati najmanje 3 znaka."
      : lastName.trim().length > 0 && lastName.trim().length < 3
        ? "Prezime mora imati najmanje 3 znaka."
        : email && getEmailWarning(email)
          ? getEmailWarning(email)
          : getPhoneWarning(phoneNumber)
            ? getPhoneWarning(phoneNumber)
            : password && getPasswordWarning(password, { requireComplexity: true })
              ? getPasswordWarning(password, { requireComplexity: true })
              : confirmPassword && password !== confirmPassword
                ? "Lozinke se ne podudaraju."
                : "";
  const canSubmit =
    firstName.trim().length >= 3 &&
    firstName.trim().length <= 100 &&
    lastName.trim().length >= 3 &&
    lastName.trim().length <= 100 &&
    !getEmailWarning(email) &&
    !getPhoneWarning(phoneNumber) &&
    !getPasswordWarning(password, { requireComplexity: true }) &&
    password === confirmPassword;

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
                minLength={3}
                maxLength={100}
                required
                disabled={loading}
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
                minLength={3}
                maxLength={100}
                required
                disabled={loading}
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
                maxLength={32}
                disabled={loading}
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
                maxLength={254}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          <div className={styles.form_row}>
            <div className={styles.form_group}>
              <label htmlFor="password">Lozinka</label>
              <div className={styles.password_field}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Lozinka"
                  value={password}
                  onChange={handlePasswordChange}
                  minLength={8}
                  maxLength={128}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.password_toggle}
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={loading}
                  aria-label={showPassword ? "Sakrij lozinku" : "Prikaži lozinku"}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              <div className={styles.password_checks}>
                <div className={styles.password_checks}>
                  <div
                    className={`${styles.check_item} ${
                      passwordChecks.length ? styles.valid : styles.invalid
                    }`}
                  >
                    Najmanje 8 znakova
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
              <div className={styles.password_field}>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Potvrdite lozinku"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  maxLength={128}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.password_toggle}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  disabled={loading}
                  aria-label={showConfirmPassword ? "Sakrij lozinku" : "Prikaži lozinku"}
                >
                  <EyeIcon open={showConfirmPassword} />
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <div className={styles.password_match_error}>
                  <div
                    className={`${styles.check_item} ${styles.invalid}`}
                  >
                    Lozinke se ne podudaraju
                  </div>
                </div>
              )}
            </div>
          </div>

          {formWarning && <p className={styles.error_message}>{formWarning}</p>}

          <button
            type="submit"
            className={styles.submit_btn}
            disabled={
              loading ||
              !canSubmit
            }
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
              "Registracija"
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
