import Image from "next/image";
import Script from "next/script";
import { redirect } from "next/navigation";

import Animations from "../components/Animations";
import NavBehavior from "../components/NavBehavior";

export default function HomePage() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <Animations />
      <NavBehavior />

      <header>
        <nav className="navbar">
          <div className="logo">
            <Image
              src="/static/images/logo.png"
              alt="Quintus logo"
              width={120}
              height={60}
              priority={1}
            />
          </div>

          <button className="hamburger" id="hamburger">
            ☰
          </button>

          <ul className="nav-main" id="nav-main">
            <li>
              <a href="#home" className="nav-link">
                Početna
              </a>
            </li>
            <li>
              <a href="#services" className="nav-link">
                Usluge
              </a>
            </li>
            <li>
              <a href="#about" className="nav-link">
                O nama
              </a>
            </li>
            <li>
              <a href="#contact" className="nav-link">
                Kontakt
              </a>
            </li>
            <li>
              <a href={() => redirect("/login")} className="nav-link">
                Prijava
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <main>
        {/* HERO */}
        <section id="home" className="hero">
          <div className="hero-container">
            <h1 className="hero-title">
              Stručne instalaterske usluge koje nadmašuju očekivanja, bez
              komplikacija.
            </h1>
            <p className="hero-subtitle">
              Primjenjujemo najnovije tehnologije u klimatizaciji, grijanju i
              vodoinstalacijama za maksimalnu učinkovitost i sigurnost vašeg
              doma ili poslovnog prostora po pristupačnim cijenama.
            </p>
            <a href="#services" className="hero-button">
              Naše usluge
            </a>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="services">
          <h2>Naše glavne usluge</h2>
          <div className="services-container">
            <div className="service">
              <h3>Klimatizacija</h3>
              <Image
                src="/static/images/klima.png"
                alt="Klimatizacija"
                width={200}
                height={200}
              />
              <p className="first-text">
                Precizan pristup svakoj instalaciji - od odabira idealnog
                položaja do završnog testiranja rada. Naše dugogodišnje iskustvo
                osigurava optimalno hlađenje uz minimalni trošak.
              </p>
              <p className="second-text">
                Garancija na ugradnju - Servis - Savjetovanje
              </p>
            </div>

            <div className="service">
              <h3>Grijanje</h3>
              <Image
                src="/static/images/grijanje.png"
                alt="Grijanje"
                width={200}
                height={200}
              />
              <p className="first-text">
                Od instalacije novih radijatora do servisa postojećih sustava -
                pružamo topline kada je najpotrebnije. Iskusno rukovanje svim
                tipovima grijalnih sustava uz jamstvo kvalitete.
              </p>
              <p className="second-text">Ugradnja - Održavanje - Popravci</p>
            </div>

            <div className="service">
              <h3>Vodoinstalaterski radovi</h3>
              <Image
                src="/static/images/instalater.png"
                alt="Vodoinstalaterski radovi"
                width={200}
                height={200}
              />
              <p className="first-text">
                Od ugradnje novih slavina do rješavanja hitnih problema s
                cijevima - brzo i pouzdano riješavamo sve vodoinstalaterske
                potrebe.
              </p>
              <p className="second-text">
                Montaža crijevi - Ugradnja sanitarija - Hitni popravci
              </p>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="about">
          <div className="about-container">
            <h2>Tko stoji iza Quintus-a?</h2>
            <p className="about-text">
              Naša tvrtka je nova na tržištu, ali iza nje stoji jedan iskusni
              majstor s gotovo 10 godina rada u klimatizaciji, grijanju i
              vodoinstalacijama.
            </p>
            <p className="about-text">
              Majstor ulaže dodatni trud i pažnju u svaki detalj, koristi
              provjerene materijale te prati najnovije trendove i tehnologije u
              struci.
            </p>
            <p className="about-text">
              Vaše povjerenje nam je važno - zato svaki posao radimo kao da ga
              radimo za sebe. Hvala što birate lokalnog stručnjaka!
            </p>
          </div>
          <div className="about-container image">
            <Image
              src="/static/images/about.png"
              alt="O nama"
              width={400}
              height={400}
            />
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="contact">
          <div className="contact-container">
            <h2>Kontaktirajte nas</h2>
            <p className="contact-subtitle">
              Imate pitanje ili želite ponudu? Javite nam se s povjerenjem.
            </p>

            <div className="contact-subcontainer">
              <div className="contact-info">
                <div className="contact-detail">
                  <p className="contact-detail-title">Adresa</p>
                  <p className="contact-detail-text">Dudić X, 31500 Našice</p>
                </div>
                <div className="contact-detail">
                  <p className="contact-detail-title">Email</p>
                  <p className="contact-detail-text">info@quintus.eu</p>
                </div>
                <div className="contact-detail">
                  <p className="contact-detail-title">Telefon</p>
                  <p className="contact-detail-text">+385 92 XXX XXXX</p>
                </div>
              </div>

              <div className="contact-form">
                <form className="contact-form-form" id="contact-form">
                  <input
                    type="text"
                    name="name"
                    placeholder="Ime i prezime"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email adresa"
                    required
                  />
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="Vaša poruka"
                    required
                  ></textarea>
                  <button type="submit" className="hero-button">
                    Pošalji poruku
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-container">
          <p>© {currentYear} Filip Ćurić | Sva prava pridržana.</p>
          <div className="footer-details">
            Quintus vl. Matej Peti | OIB: XXXXXXXXXXXX | Matični broj: XXXXXXX
            <br />
            Obrt je upisan u Obrtni registar Republike Hrvatske koji vodi
            Upravni odjel za gospodarstvo i fondove Europske unije
            Osječko-baranjske županije, Ispostava Našice, pod brojem obrtnice:
            [XXXXX].
            <br />
            Bankovni račun – <strong>IBAN: HRXXXXXXXXXXXXXXXXXXX</strong>
          </div>
        </div>
      </footer>

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