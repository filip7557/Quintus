"use client";
import { useEffect } from "react";

export default function NavBehavior() {
  useEffect(() => {
    // Wait a moment to ensure all sections are rendered in the DOM
    const timeout = setTimeout(() => {
      const sections = Array.from(
        document.querySelectorAll("section[id]")
      );
      const navLinks = Array.from(
        document.querySelectorAll(".nav-link")
      );

      const linkFor = (id) =>
        document.querySelector(
          `.nav-link[href="#${id}"], .nav-link[href="/#${id}"]`
        );

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              navLinks.forEach((l) => l.classList.remove("active"));
              const link = linkFor(entry.target.id);
              if (link) link.classList.add("active");
            }
          });
        },
        {
          root: null,
          rootMargin: '-50% 0px -50% 0px', // highlights when section is roughly in the middle
          threshold: 0,
        }
      );

      sections.forEach((section) => observer.observe(section));

      // Hamburger toggle
      const hamburger = document.getElementById("hamburger");
      const navMain = document.getElementById("nav-main");

      const handleToggle = () => {
        navMain?.classList.toggle("show");
        hamburger?.classList.toggle("open");
      };

      const closeMenu = () => {
        navMain?.classList.remove("show");
        hamburger?.classList.remove("open");
      };

      const handleNavClick = (e) => {
        const link = e.target?.closest?.("a.nav-link");
        if (link) closeMenu();
      };

      const handleDocumentClick = (e) => {
        if (!navMain?.classList.contains("show")) return;

        const clickedHamburger = hamburger?.contains(e.target);
        const clickedInsideMenu = navMain?.contains(e.target);

        if (!clickedHamburger && !clickedInsideMenu) closeMenu();
      };

      const handleKeyDown = (e) => {
        if (e.key === "Escape") closeMenu();
      };

      hamburger?.addEventListener("click", handleToggle);
      navMain?.addEventListener("click", handleNavClick);
      document.addEventListener("click", handleDocumentClick);
      document.addEventListener("keydown", handleKeyDown);

      return () => {
        observer.disconnect();
        hamburger?.removeEventListener("click", handleToggle);
        navMain?.removeEventListener("click", handleNavClick);
        document.removeEventListener("click", handleDocumentClick);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, 300); // slight delay so sections exist

    return () => clearTimeout(timeout);
  }, []);

  return null;
}
