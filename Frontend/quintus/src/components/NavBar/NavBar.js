"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AccountNav from "@/components/AccountNav/AccountNav";
import NavBehavior from "@/components/NavBehavior";

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const navMainRef = useRef(null);
  const hamburgerRef = useRef(null);

  // Close the menu when navigating to a different route.
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Close the menu when clicking outside or pressing Escape.
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleDocumentClick = (e) => {
      const navMain = navMainRef.current;
      const hamburger = hamburgerRef.current;
      if (!navMain || !hamburger) return;

      const clickedHamburger = hamburger.contains(e.target);
      const clickedInsideMenu = navMain.contains(e.target);

      if (!clickedHamburger && !clickedInsideMenu) setIsMenuOpen(false);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header>
      <NavBehavior />
      <nav className="navbar">
        <div className="logo">
          <Image
            src="/images/logo.png"
            alt="Quintus logo"
            width={170}
            height={85}
            priority={1}
          />
        </div>

        <button
          type="button"
          className={`hamburger${isMenuOpen ? " open" : ""}`}
          id="hamburger"
          ref={hamburgerRef}
          aria-label={isMenuOpen ? "Zatvori izbornik" : "Otvori izbornik"}
          aria-expanded={isMenuOpen}
          aria-controls="nav-main"
          onClick={() => setIsMenuOpen((v) => !v)}
        >
          ☰
        </button>

        <ul
          className={`nav-main${isMenuOpen ? " show" : ""}`}
          id="nav-main"
          ref={navMainRef}
        >
          <li>
            <div className="nav-link-wrapper">
              <Link href="/#home" className="nav-link" onClick={closeMenu}>
                Početna
              </Link>
            </div>
          </li>
          <li>
            <div className="nav-link-wrapper">
              <Link href="/#services" className="nav-link" onClick={closeMenu}>
                Usluge
              </Link>
            </div>
          </li>
          <li>
            <div className="nav-link-wrapper">
              <Link href="/#about" className="nav-link" onClick={closeMenu}>
                O nama
              </Link>
            </div>
          </li>
          <li>
            <div className="nav-link-wrapper">
              <Link href="/#contact" className="nav-link" onClick={closeMenu}>
                Kontakt
              </Link>
            </div>
          </li>
          <AccountNav />
        </ul>
      </nav>
    </header>
  );
}
