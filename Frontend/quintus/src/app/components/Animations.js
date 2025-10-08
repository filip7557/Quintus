"use client";
import { useEffect } from "react";

export default function Animations() {
  useEffect(() => {
    // HERO animation — trigger once the component mounts
    const hero = document.querySelector(".hero-container");
    if (hero) {
      // Small delay so layout is stable before animating
      setTimeout(() => {
        hero.classList.add("animate-in");
      }, 100);
    }

    // SERVICES animation
    const services = document.querySelectorAll(".services-container .service");
    const servicesSection = document.querySelector(".services");

    if (servicesSection) {
      const servicesObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              services.forEach((service, index) => {
                setTimeout(() => {
                  service.classList.add("animate-in");
                }, index * 200);
              });
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      servicesObserver.observe(servicesSection);
    }

    // ABOUT animation
    const aboutContainers = document.querySelectorAll(".about-container");
    const aboutObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    aboutContainers.forEach((container) => aboutObserver.observe(container));
  }, []);

  return null;
}
