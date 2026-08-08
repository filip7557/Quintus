"use client";

import { useRef, useState, useEffect } from "react";
import { getCurrentUser, logout, subscribeToAuthChanges } from "@/services/authService";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./AccountNav.module.css";
import { isAdmin, isAdminOrOwner } from "@/lib/authz";

export default function AccountNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [offersOpen, setOffersOpen] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [isAdminOrOwnerUser, setIsAdminOrOwnerUser] = useState(false);
  const router = useRouter();
  const rootRef = useRef(null);

  useEffect(() => {
    // Check auth on mount and whenever auth state changes.
    const checkAuth = () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        getCurrentUser()
          .then((response) => {
            if (response?.data) {
              setIsLoggedIn(true);
              setAdmin(isAdmin(response.data));
              setIsAdminOrOwnerUser(isAdminOrOwner(response.data));
            } else {
              setIsLoggedIn(false);
              setAdmin(false);
              setIsAdminOrOwnerUser(false);
            }
          })
          .catch(() => {
            setIsLoggedIn(false);
            setAdmin(false);
            setIsAdminOrOwnerUser(false);
          });
      } else {
        setIsLoggedIn(false);
        setAdmin(false);
        setIsAdminOrOwnerUser(false);
      }
    };

    checkAuth();

    const unsubscribeAuth = subscribeToAuthChanges(checkAuth);
    const onStorage = (e) => {
      if (!e || e.key === null || e.key === "accessToken") {
        checkAuth();
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      unsubscribeAuth();
      window.removeEventListener("storage", onStorage);
    };
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

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setIsLoggedIn(false);
      setAdmin(false);
      setIsAdminOrOwnerUser(false);
      setIsOpen(false);
      router.refresh();
      router.push("/");
    }
  };

  const handleToggle = () => {
    setIsOpen((v) => !v);
  };

  const handleItemClick = () => {
    setIsOpen(false);
    setOffersOpen(false);
  };

  return (
    <li
      ref={rootRef}
      className={`${styles.navAccount} ${isOpen ? styles.open : ""}`}
    >
      <button
        type="button"
        className={styles.accountTrigger}
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
            {isAdminOrOwnerUser ? (
              <div className={`${styles.subMenuWrapper} ${offersOpen ? styles.subMenuOpen : ""}`}>
                <button
                  type="button"
                  className={`${styles.dropdownItem} ${styles.subMenuTrigger}`}
                  onClick={() => setOffersOpen((v) => !v)}
                  aria-expanded={offersOpen}
                >
                  Ponude
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className={styles.subMenuArrow}
                  >
                    <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className={styles.subMenuItems}>
                  <Link
                    href="/offers/create"
                    className={`${styles.dropdownItem} ${styles.subMenuItem}`}
                    onClick={handleItemClick}
                  >
                    Izrada ponude
                  </Link>
                  <Link
                    href="/offers/list"
                    className={`${styles.dropdownItem} ${styles.subMenuItem}`}
                    onClick={handleItemClick}
                  >
                    Pretraga ponuda
                  </Link>
                </div>
              </div>
            ) : null}
            {admin ? (
              <Link
                href="/admin/owners"
                className={styles.dropdownItem}
                onClick={handleItemClick}
              >
                Vlasnici (Admin)
              </Link>
            ) : null}
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
