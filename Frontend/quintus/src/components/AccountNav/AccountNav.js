"use client";

import { useState, useEffect } from "react";
import { getCurrentUser, logout } from "@/services/authService";
import { useRouter } from "next/navigation";
import styles from "./AccountNav.module.css";

export default function AccountNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on component mount
    const checkAuth = () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        getCurrentUser()
          .then((response) => {
            if (response?.data) {
              setIsLoggedIn(true);
            } else {
              setIsLoggedIn(false);
            }
          })
          .catch(() => setIsLoggedIn(false));
      } else {
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    router.push("/");
    logout().then(() => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setIsLoggedIn(false);
    });
  };

  return (
    <li className={styles.navAccount}>
      <button className={styles.accountTrigger}>
        Račun
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className={styles.dropdownArrow}
        >
          <path
            d="M6 9l6 6 6-6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className={styles.accountDropdown}>
        {isLoggedIn ? (
          <>
            <a href="/profile" className={styles.dropdownItem}>
              Profil
            </a>
            <a href="/requests" className={styles.dropdownItem}>
              Zahtjevi
            </a>
            <button onClick={handleLogout} className={styles.dropdownItem}>
              Odjava
            </button>
          </>
        ) : (
          <a href="/auth" className={styles.dropdownItem}>
            Prijava
          </a>
        )}
      </div>
    </li>
  );
}
