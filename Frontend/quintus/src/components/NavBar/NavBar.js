"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import AccountNav from "@/components/AccountNav/AccountNav";
import NavBehavior from "@/components/NavBehavior";

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navMainRef = useRef(null);
  const hamburgerRef = useRef(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const mobileQuery = window.matchMedia("(max-width: 992px)");
    if (!mobileQuery.matches) return;

    const previousOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    const handleBreakpointChange = () => setIsMenuOpen(false);
    mobileQuery.addEventListener("change", handleBreakpointChange);

    const handleDocumentClick = (e) => {
      const navMain = navMainRef.current;
      const hamburger = hamburgerRef.current;
      if (!navMain || !hamburger) return;
      
      const clickedHamburger = hamburger.contains(e.target);
      const clickedInsideMenu = navMainRef.current?.contains(e.target);
      if (!clickedHamburger && !clickedInsideMenu) setIsMenuOpen(false);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        hamburgerRef.current?.focus();
      }
      if (e.key === "Tab") {
        const menuControls = Array.from(
          navMainRef.current?.querySelectorAll("a[href], button:not([disabled])") || []
        ).filter((element) => element.getClientRects().length > 0 &&
          window.getComputedStyle(element).visibility === "visible");
        const controls = [hamburgerRef.current, ...menuControls].filter(Boolean);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleKeyDown);
      mobileQuery.removeEventListener("change", handleBreakpointChange);
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);
  const handleToggle = () => {
    hamburgerRef.current?.focus();
    setIsMenuOpen((v) => !v);
  };

  const handleSectionClick = (event, sectionId) => {
    closeMenu();

    if (window.location.pathname !== "/") return;

    const section = document.getElementById(sectionId);
    if (!section) return;

    event.preventDefault();
    window.history.pushState(null, "", `/#${sectionId}`);
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleNavClick = (e) => {
    const link = e.target?.closest?.("a.nav-link");
    if (link) setIsMenuOpen(false);
  };

  return (
    <header className={isMenuOpen ? "mobile-menu-open" : undefined}>
      <NavBehavior />
      <nav className="navbar">
        <div className="logo">
          <Link href="/" aria-label="Početna">
            <Image
              src="/images/logo.png"
              alt="Quintus logo"
              width={170}
              height={85}
              priority={1}
            />
          </Link>
        </div>

        <button
          className={`hamburger${isMenuOpen ? " open" : ""}`}
          id="hamburger"
          ref={hamburgerRef}
          type="button"
          aria-label={isMenuOpen ? "Zatvori izbornik" : "Otvori izbornik"}
          aria-expanded={isMenuOpen}
          aria-controls="nav-main"
          onClick={handleToggle}
        >
          {isMenuOpen ? "×" : "☰"}
        </button>

        <ul
          className={`nav-main${isMenuOpen ? " show" : ""}`}
          id="nav-main"
          ref={navMainRef}
          onClick={handleNavClick}
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
              <Link
                href="/#diploma"
                className="nav-link"
                onClick={(event) => handleSectionClick(event, "diploma")}
              >
                Certifikati
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
          <AccountNav onNavigate={closeMenu} />
        </ul>
      </nav>
    </header>
  );
}
