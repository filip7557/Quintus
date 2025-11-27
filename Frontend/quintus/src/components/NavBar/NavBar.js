import Image from "next/image";
import AccountNav from "@/components/AccountNav/AccountNav";

export default function NavBar() {
  return (
    <header>
      <nav className="navbar">
        <div className="logo">
          <Image
            src="/images/logo.png"
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
            <a href="/#home" className="nav-link">
              Početna
            </a>
          </li>
          <li>
            <a href="/#services" className="nav-link">
              Usluge
            </a>
          </li>
          <li>
            <a href="/#about" className="nav-link">
              O nama
            </a>
          </li>
          <li>
            <a href="/#contact" className="nav-link">
              Kontakt
            </a>
          </li>
          <AccountNav />
        </ul>
      </nav>
    </header>
  );
}
