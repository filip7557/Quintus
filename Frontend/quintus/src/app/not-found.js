import Link from "next/link";
import NavBar from "@/components/NavBar/NavBar";

export const metadata = {
  title: "Stranica nije pronađena | Quintus",
  description: "Tražena stranica ne postoji ili je premještena.",
};

export default function NotFound() {
  return (
    <>
      <NavBar />
      <main className="service-page">
        <div className="service-page-shell">
          <article className="service-page-card not-found-card">
            <p className="not-found-code">404</p>
            <h1 className="service-page-title">Stranica nije pronađena</h1>
            <p className="service-description service-details-text">
              Tražena stranica ne postoji, uklonjena je ili je adresa pogrešno
              upisana.
            </p>
            <Link href="/" className="not-found-home-link">
              Povratak na početnu stranicu
            </Link>
          </article>
        </div>
      </main>
    </>
  );
}
