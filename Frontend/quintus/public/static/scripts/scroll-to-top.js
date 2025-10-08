document.addEventListener("scroll", () => {
  const btn = document.getElementById("scroll-to-top");

  // how close to the bottom before showing (in px)
  const offset = 50;

  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - offset) {
    btn.classList.add("show");
  } else {
    btn.classList.remove("show");
  }
});