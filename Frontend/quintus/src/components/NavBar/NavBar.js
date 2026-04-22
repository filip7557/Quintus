"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AccountNav from "@/components/AccountNav/AccountNav";

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const navMainRef = useRef(null);
  const hamburgerRef = useRef(null);

  // Close the menu when navigating to a different route.
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // On non-home pages, pin the gold indicator under the "Račun" button.
  useEffect(() => {
    // Home page: NavBehavior handles the indicator via IntersectionObserver.
    if (pathname === "/" || pathname === "") return;

    const navMain = navMainRef.current;
    if (!navMain) return;

    const positionIndicator = () => {
      const trigger = navMain.querySelector("button[aria-haspopup='menu']");
      if (!trigger) {
        navMain.style.setProperty("--nav-indicator-opacity", "0");
        return;
      }
      const triggerRect = trigger.getBoundingClientRect();
      const navRect = navMain.getBoundingClientRect();
      navMain.style.setProperty("--nav-indicator-left", `${Math.max(0, triggerRect.left - navRect.left)}px`);
      navMain.style.setProperty("--nav-indicator-width", `${Math.max(0, triggerRect.width)}px`);
      navMain.style.setProperty("--nav-indicator-opacity", "1");
    };

    // Slight delay so fonts/layout are settled.
    const timer = setTimeout(positionIndicator, 60);
    window.addEventListener("resize", positionIndicator);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", positionIndicator);
      if (navMainRef.current) {
        navMainRef.current.style.setProperty("--nav-indicator-opacity", "0");
      }
    };
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
