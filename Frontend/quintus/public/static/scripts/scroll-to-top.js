document.addEventListener("scroll", () => {
  const btn = document.getElementById("scroll-to-top");

  // Return early if button doesn't exist
  if (!btn) return;

  // how close to the bottom before showing (in px)
  const offset = 50;

  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - offset) {
    btn.classList.add("show");
  } else {
    btn.classList.remove("show");
  }
});