"use client";

import { useState } from "react";
import styles from "./LoginForm.module.css";
import Link from "next/link";

import { login, resendVerification } from "@/services/authService";

function getApiMessage(payload) {
  if (!payload) return "";
  if (typeof payload === "string") return payload;
  if (typeof payload === "object") {
    return payload.message || payload.title || payload.error || "";
  }
  return "";
}

function isEmailNotVerifiedMessage(message) {
  const m = String(message || "").toLowerCase();
  if (!m) return false;
  return (
    m.includes("not validated") ||
    m.includes("not verified") ||
    m.includes("not confirmed") ||
    m.includes("email is not") ||
    m.includes("email nije") ||
    m.includes("nije potvr") ||
    m.includes("nije verific")
  );
}

export default function LoginForm({ setIsRegister, router }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendState, setResendState] = useState({
    loading: false,
    ok: false,
    message: "",
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setShowResend(false);
    setResendState({ loading: false, ok: false, message: "" });
    setLoading(true);
    try {
      login(email, password)
        .then((res) => {
          if (res?.status === 200) {
            // successful login - navigate away
            router.push("/");
          } else {
            const message =
              getApiMessage(res?.data) ||
              "Nešto je pošlo po zlu. Pokušajte ponovno.";
            setError(message);
            setShowResend(isEmailNotVerifiedMessage(message));
          }
        })
        .catch((res) => {
          const message =
            getApiMessage(res?.data) || "Nešto je pošlo po zlu. Pokušajte ponovno.";
          setError(message);
          setShowResend(isEmailNotVerifiedMessage(message));
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (e) {
      const message =
        getApiMessage(e?.data) || "Nešto je pošlo po zlu. Pokušajte ponovno.";
      setError(message);
      setShowResend(isEmailNotVerifiedMessage(message));
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const trimmed = String(email || "").trim();
    if (!trimmed) {
      setResendState({ loading: false, ok: false, message: "Unesite email adresu." });
      return;
    }

    setResendState({ loading: true, ok: false, message: "" });
    const res = await resendVerification(trimmed);
    const ok = res?.status >= 200 && res?.status < 300;
    const message =
      getApiMessage(res?.data) ||
      (ok
        ? "Verifikacijski email je ponovno poslan."
        : "Slanje verifikacijskog emaila nije uspjelo.");
    setResendState({ loading: false, ok, message });
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

        {error ? (
          <div className={styles.error_message}>
            <p className={styles.error_text}>{error}</p>

            {showResend ? (
              <div className={styles.resend_block}>
                <button
                  type="button"
                  className={styles.resend_link}
                  onClick={handleResendVerification}
                  disabled={loading || resendState.loading}
                >
                  Ponovno pošalji verifikaciju
                </button>
                <span className={styles.resend_hint}>
                  (koristi email koji ste unijeli)
                </span>

                {resendState.message ? (
                  <p
                    className={`${styles.resend_message} ${
                      resendState.ok ? styles.resend_success : styles.resend_error
                    }`}
                  >
                    {resendState.message}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

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
            <div className={styles.password_field}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Lozinka"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
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
            <Link href="/forgot-password" className={styles.forgot_link}>
              Zaboravljena lozinka?
            </Link>
          </p>

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
