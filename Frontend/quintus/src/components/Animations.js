"use client";
import { useEffect } from "react";

export default function Animations() {
  useEffect(() => {
    const timeouts = new Set();
    let rafId = null;

    const clearAllTimeouts = () => {
      for (const t of timeouts) clearTimeout(t);
      timeouts.clear();
    };

    const servicesObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          const delay = Math.max(0, Number(el?.dataset?.animDelayMs) || 0);
          const t = setTimeout(() => {
            el.classList.add("animate-in");
          }, delay);
          timeouts.add(t);
          observer.unobserve(el);
        });
      },
      { threshold: 0.2 }
    );

    const aboutObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = Math.max(0, Number(el?.dataset?.animDelayMs) || 0);
          const t = setTimeout(() => {
            el.classList.add("animate-in");
          }, delay);
          timeouts.add(t);
          observer.unobserve(el);
        });
      },
      { threshold: 0.25 }
    );

    const run = () => {
      // HERO animation
      const hero = document.querySelector(".hero-container");
      if (hero && !hero.classList.contains("animate-in")) {
        const t = setTimeout(() => {
          hero.classList.add("animate-in");
        }, 100);
        timeouts.add(t);
      }

      // SERVICES animation (observe individual cards so new ones animate too)
      const services = document.querySelectorAll(".services-container .service");
      services.forEach((service, index) => {
        if (service.classList.contains("animate-in")) return;
        if (!service.dataset.animDelayMs) {
          // Stagger, but cap so it never feels like it's hanging.
          service.dataset.animDelayMs = String(Math.min(index * 120, 600));
        }
        servicesObserver.observe(service);
      });

      // ABOUT animation (also observe individual containers)
      const aboutContainers = document.querySelectorAll(".about-container");
      aboutContainers.forEach((container) => {
        if (container.classList.contains("animate-in")) return;
        aboutObserver.observe(container);
      });

      // CONTACT animation (two panels)
      const contactPanels = document.querySelectorAll(".contact-panel");
      contactPanels.forEach((panel) => {
        if (panel.classList.contains("animate-in")) return;
        aboutObserver.observe(panel);
      });
    };

    const scheduleRun = () => {
      if (rafId != null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        run();
      });
    };

    // Initial run
    run();

    // Re-run when DOM changes (e.g., after adding/editing services + router.refresh)
    const mo = new MutationObserver(scheduleRun);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      servicesObserver.disconnect();
      aboutObserver.disconnect();
      clearAllTimeouts();
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}
