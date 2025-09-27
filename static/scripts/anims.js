window.addEventListener("load", () => {
  const hero = document.querySelector(".hero-container");
  hero.classList.add("animate-in");
});

document.addEventListener("DOMContentLoaded", () => {
  const services = document.querySelectorAll(".services-container .service");

  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
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

  const servicesSection = document.querySelector(".services");
  if (servicesSection) observer.observe(servicesSection);
});

document.addEventListener("DOMContentLoaded", () => {
  const aboutContainers = document.querySelectorAll(".about-container");

  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    { threshold: 0.3 }
  );

  aboutContainers.forEach(container => observer.observe(container));
});