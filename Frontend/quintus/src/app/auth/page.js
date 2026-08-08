"use client";
import styles from "./page.module.css";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentUser } from "@/services/authService";

import RegisterForm from "@/components/RegisterForm/RegisterForm";
import LoginForm from "@/components/LoginForm/LoginForm";

function AuthInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRegister, setIsRegister] = useState(false);
  const redirectTo = searchParams.get("from") || "/";

  const [registeredInfo, setRegisteredInfo] = useState(null);

  const registeredEmail = useMemo(() => {
    const value = searchParams.get("email");
    return value ? String(value).trim() : "";
  }, [searchParams]);

  const showRegisteredNotice = useMemo(() => {
    const flag = String(searchParams.get("registered") || "").toLowerCase();
    return flag === "1" || flag === "true" || flag === "yes";
  }, [searchParams]);

  const [dismissedRegisteredNotice, setDismissedRegisteredNotice] = useState(false);

  useEffect(() => {
    // When params change (e.g., a fresh register redirect), show the banner again.
    setDismissedRegisteredNotice(false);
  }, [registeredEmail, showRegisteredNotice]);

  useEffect(() => {
    const currentUser = async () => {
      try {
        const result = await getCurrentUser();
        if (result?.data) router.back();
      } catch (e) {}
    };

    currentUser();
  }, [router]);

  const showPostRegister = Boolean(registeredInfo);

  const handleRegistered = ({ email, message }) => {
    setRegisteredInfo({ email: email || "", message: message || "" });
  };

  const goToLogin = () => {
    setRegisteredInfo(null);
    setIsRegister(false);
  };

  return (
    <div className={styles.login}>
      {showRegisteredNotice && !dismissedRegisteredNotice ? (
        <div className={styles.noticeBanner} role="status" aria-live="polite">
          <div className={styles.noticeText}>
            Poslali smo verifikacijski email{registeredEmail ? ` na ${registeredEmail}` : ""}.
            Provjerite inbox i spam.
          </div>
          <button
            type="button"
            className={styles.noticeClose}
            onClick={() => setDismissedRegisteredNotice(true)}
            aria-label="Zatvori obavijest"
          >
            ×
          </button>
        </div>
      ) : null}

      {showPostRegister ? (
        <div className={styles.successCard} role="status" aria-live="polite">
          <h2 className={styles.successTitle}>Provjerite email</h2>
          <p className={styles.successText}>
            {registeredInfo?.message
              ? registeredInfo.message
              : `Poslali smo verifikacijski email${registeredInfo?.email ? ` na ${registeredInfo.email}` : ""}.`}
          </p>
          <p className={styles.successSubtext}>Provjerite inbox i spam.</p>
          <button type="button" className={styles.successButton} onClick={goToLogin}>
            Prijava
          </button>
        </div>
      ) : isRegister ? (
        <RegisterForm
          router={router}
          setIsRegister={setIsRegister}
          redirectTo={redirectTo}
          onRegistered={handleRegistered}
        />
      ) : (
        <LoginForm
          router={router}
          setIsRegister={setIsRegister}
          redirectTo={redirectTo}
        />
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className={styles.login} />}> 
      <AuthInner />
    </Suspense>
  );
}
