document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const linkFor = id => document.querySelector(`.nav-link[href="#${id}"]`);

  const observerOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const link = linkFor(entry.target.id);
        if (link) link.classList.add('active');
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
});