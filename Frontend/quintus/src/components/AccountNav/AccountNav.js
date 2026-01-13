"use client";

import { useRef, useState, useEffect } from "react";
import { getCurrentUser, logout } from "@/services/authService";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./AccountNav.module.css";

export default function AccountNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const rootRef = useRef(null);

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

  useEffect(() => {
    if (!isOpen) return;

    const handleDocumentClick = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setIsOpen(false);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout().then(() => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setIsLoggedIn(false);
      setIsOpen(false);
      router.push("/");
    }).catch(() => {
      // Even if logout fails, clear the state
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setIsLoggedIn(false);
      setIsOpen(false);
      router.push("/");
    });
  };

  const handleToggle = () => {
    setIsOpen((v) => !v);
  };

  const handleItemClick = () => {
    setIsOpen(false);
  };

  return (
    <li
      ref={rootRef}
      className={`${styles.navAccount} ${isOpen ? styles.open : ""}`}
    >
      <button
        type="button"
        className={`${styles.accountTrigger} nav-link`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={handleToggle}
      >
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
            <Link
              href="/profile"
              className={styles.dropdownItem}
              onClick={handleItemClick}
            >
              Profil
            </Link>
            <Link
              href="/requests"
              className={styles.dropdownItem}
              onClick={handleItemClick}
            >
              Zahtjevi
            </Link>
            <button onClick={handleLogout} className={styles.dropdownItem}>
              Odjava
            </button>
          </>
        ) : (
          <Link
            href="/auth"
            className={styles.dropdownItem}
            onClick={handleItemClick}
          >
            Prijava
          </Link>
        )}
      </div>
    </li>
  );
}
