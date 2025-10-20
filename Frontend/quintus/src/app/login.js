"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react/cjs/react.production";
import { getCurrentUser } from "@/services/authService";

import RegisterForm from "@/components/RegisterForm";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);

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
      <div className="login">
        {isRegister ? (
          <RegisterForm router={router} setIsRegister={setIsRegister} />
        ) : (
          <LoginForm router={router} setIsRegister={setIsRegister} />
        )}
      </div>
    </>
  );
}
