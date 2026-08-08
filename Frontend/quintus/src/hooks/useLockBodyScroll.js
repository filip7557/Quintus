"use client";

import { useEffect } from "react";

let lockCount = 0;
let savedScrollY = 0;
let savedBodyStyles = null;

function getScrollbarWidth() {
  // Avoid negative values on mobile where the scrollbar overlays.
  return Math.max(0, window.innerWidth - document.documentElement.clientWidth);
}

export default function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return;

    lockCount += 1;

    if (lockCount === 1) {
      const body = document.body;
      savedScrollY = window.scrollY || document.documentElement.scrollTop || 0;

      savedBodyStyles = {
        overflow: body.style.overflow,
        position: body.style.position,
        top: body.style.top,
        width: body.style.width,
        paddingRight: body.style.paddingRight,
      };

      const scrollbarWidth = getScrollbarWidth();

      body.style.overflow = "hidden";
      body.style.position = "fixed";
      body.style.top = `-${savedScrollY}px`;
      body.style.width = "100%";

      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }
    }

    return () => {
      lockCount = Math.max(0, lockCount - 1);

      if (lockCount === 0 && savedBodyStyles) {
        const body = document.body;

        body.style.overflow = savedBodyStyles.overflow;
        body.style.position = savedBodyStyles.position;
        body.style.top = savedBodyStyles.top;
        body.style.width = savedBodyStyles.width;
        body.style.paddingRight = savedBodyStyles.paddingRight;

        // Avoid triggering global `scroll-behavior: smooth` when restoring position.
        const docEl = document.documentElement;
        const prevScrollBehavior = docEl.style.scrollBehavior;
        docEl.style.scrollBehavior = "auto";
        window.scrollTo(0, savedScrollY);
        docEl.style.scrollBehavior = prevScrollBehavior;
        savedBodyStyles = null;
      }
    };
  }, [locked]);
}
