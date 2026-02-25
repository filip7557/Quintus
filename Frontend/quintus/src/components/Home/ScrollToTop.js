import Script from "next/script";

export default function ScrollToTop() {
  return (
    <>
      <a
        href="#home"
        id="scroll-to-top"
        className="scroll-to-top"
        aria-label="Povratak na vrh"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 19V5M5 12l7-7 7 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
      <Script
        src="/static/scripts/scroll-to-top.js"
        strategy="afterInteractive"
      />
    </>
  );
}
