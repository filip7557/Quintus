"use client";
import styles from "./page.module.css"
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/services/authService";

import RegisterForm from "@/components/RegisterForm/RegisterForm";
import LoginForm from "@/components/LoginForm/LoginForm";

export default function LoginPage() {
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
    <>
      <div className={styles.login}>
        {isRegister ? (
          <RegisterForm router={router} setIsRegister={setIsRegister} redirectTo={redirectTo} />
        ) : (
          <LoginForm router={router} setIsRegister={setIsRegister} redirectTo={redirectTo} />
        )}
      </div>
    </>
  );
}
