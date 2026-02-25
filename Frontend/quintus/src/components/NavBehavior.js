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
      const navWrappers = Array.from(
        document.querySelectorAll(".nav-link-wrapper")
      );
      const navMain = document.querySelector(".nav-main");
      if (navMain) {
        navMain.classList.add("initializing");
      }

      const hoverState = {
        isHovering: false,
        el: null,
      };

      const linkFor = (id) =>
        document.querySelector(
          `.nav-link[href="#${id}"], .nav-link[href="/#${id}"]`
        );

      const setIndicatorHidden = () => {
        if (!navMain) return;
        navMain.style.setProperty("--nav-indicator-opacity", "0");
        navMain.style.setProperty("--nav-indicator-width", "0px");
      };

      const setIndicatorToEl = (el) => {
        if (!navMain || !el) return;
        const activeRect = el.getBoundingClientRect();
        const navRect = navMain.getBoundingClientRect();

        const left = Math.max(0, activeRect.left - navRect.left);
        const width = Math.max(0, activeRect.width);

        navMain.style.setProperty("--nav-indicator-left", `${left}px`);
        navMain.style.setProperty("--nav-indicator-width", `${width}px`);
        navMain.style.setProperty("--nav-indicator-opacity", "1");

        // remove initializing state on first actual movement
        if (navMain.classList.contains("initializing")) {
          navMain.classList.remove("initializing");
        }

        // we will animate in CSS via a temporary class
        navMain.classList.add("indicator-rotate");
        setTimeout(() => navMain.classList.remove("indicator-rotate"), 400);
      };

      const updateIndicator = () => {
        if (!navMain) return;
        const active = navMain.querySelector(".nav-link.active");
        if (!active) {
          setIndicatorHidden();
          return;
        }

        setIndicatorToEl(active);
      };

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              navLinks.forEach((l) => l.classList.remove("active"));
              const link = linkFor(entry.target.id);
              if (link) link.classList.add("active");
              if (!hoverState.isHovering) updateIndicator();
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

      // Keep indicator aligned on resize / font load / layout changes.
      const onResize = () => {
        if (hoverState.isHovering && hoverState.el) {
          setIndicatorToEl(hoverState.el);
        } else {
          updateIndicator();
        }
      };
      window.addEventListener("resize", onResize);

      const ro = navMain && "ResizeObserver" in window
        ? new ResizeObserver(() => updateIndicator())
        : null;
      if (ro && navMain) ro.observe(navMain);

      if (document.fonts?.ready) {
        document.fonts.ready.then(() => updateIndicator()).catch(() => {});
      }

      // Best-effort initial position.
      updateIndicator();

      // Hover animation: temporarily move indicator under hovered link.
      const canHover =
        window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

      const hoverListeners = [];

      if (canHover && navMain) {
        const desktopLinks = navLinks.filter((l) => navMain.contains(l));
        desktopLinks.forEach((linkEl) => {
          const wrapper = linkEl.closest(".nav-link-wrapper");
          const baseTarget = wrapper || linkEl;
          const isMenuTrigger =
            String(linkEl.getAttribute("aria-haspopup") || "").toLowerCase() === "menu";
          const hoverTarget = isMenuTrigger ? linkEl.closest("li") || baseTarget : baseTarget;

          const onEnter = (e) => {
            hoverState.isHovering = true;
            hoverState.el = linkEl;
            setIndicatorToEl(linkEl);
          };

          const onLeave = (e) => {
            // if we are moving directly into another nav link/wrapper, keep hover state
            const to = e.relatedTarget;
            if (to && navMain.contains(to) &&
                (to.classList.contains("nav-link") || to.classList.contains("nav-link-wrapper"))) {
              return; // let the other listener handle the change
            }
            hoverState.isHovering = false;
            hoverState.el = null;
            updateIndicator();
          };

          hoverTarget.addEventListener("mouseenter", onEnter);
          hoverTarget.addEventListener("mouseleave", onLeave);
          hoverListeners.push([hoverTarget, onEnter, onLeave]);
        });

        // also attach to any wrappers that don't already map to a link
        const desktopWrappers = navWrappers.filter((w) => navMain.contains(w));
        desktopWrappers.forEach((wr) => {
          const innerLink = wr.querySelector(".nav-link");
          if (innerLink) return; // already handled above
          const onEnter = (e) => {
            hoverState.isHovering = true;
            updateIndicator();
          };
          const onLeave = (e) => {
            const to = e.relatedTarget;
            if (to && navMain.contains(to) &&
                (to.classList.contains("nav-link") || to.classList.contains("nav-link-wrapper"))) {
              return;
            }
            hoverState.isHovering = false;
            updateIndicator();
          };
          wr.addEventListener("mouseenter", onEnter);
          wr.addEventListener("mouseleave", onLeave);
          hoverListeners.push([wr, onEnter, onLeave]);
        });
      }

      return () => {
        observer.disconnect();
        window.removeEventListener("resize", onResize);
        if (ro) ro.disconnect();

        hoverListeners.forEach(([el, onEnter, onLeave]) => {
          el.removeEventListener("mouseenter", onEnter);
          el.removeEventListener("mouseleave", onLeave);
        });
      };
    }, 300); // slight delay so sections exist

    return () => clearTimeout(timeout);
  }, []);

  return null;
}
