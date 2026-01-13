"use client";
import styles from "./page.module.css";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentUser } from "@/services/authService";

import RegisterForm from "@/components/RegisterForm/RegisterForm";
import LoginForm from "@/components/LoginForm/LoginForm";

function AuthInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRegister, setIsRegister] = useState(false);
  const redirectTo = searchParams.get("from") || "/";

  useEffect(() => {
    const currentUser = async () => {
      try {
        const result = await getCurrentUser();
        if (result?.data) router.back();
      } catch (e) {}
    };

    currentUser();
  }, [router]);

  return (
    <div className={styles.login}>
      {isRegister ? (
        <RegisterForm
          router={router}
          setIsRegister={setIsRegister}
          redirectTo={redirectTo}
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
