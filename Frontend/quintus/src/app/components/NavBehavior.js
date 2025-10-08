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
        document.querySelector(`.nav-link[href="#${id}"]`);

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
      };

      hamburger?.addEventListener("click", handleToggle);

      return () => {
        observer.disconnect();
        hamburger?.removeEventListener("click", handleToggle);
      };
    }, 300); // slight delay so sections exist

    return () => clearTimeout(timeout);
  }, []);

  return null;
}
