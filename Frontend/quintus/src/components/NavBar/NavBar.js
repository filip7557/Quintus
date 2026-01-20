import Image from "next/image";
import Link from "next/link";
import AccountNav from "@/components/AccountNav/AccountNav";

export default function NavBar() {
  return (
    <header>
      <nav className="navbar">
        <div className="logo">
          <Image
            src="/images/logo.png"
            alt="Quintus logo"
            width={170}
            height={85}
            priority={1}
          />
        </div>

        <button className="hamburger" id="hamburger">
          ☰
        </button>

        <ul className="nav-main" id="nav-main">
          <li>
            <Link href="/#home" className="nav-link">
              Početna
            </Link>
          </li>
          <li>
            <Link href="/#services" className="nav-link">
              Usluge
            </Link>
          </li>
          <li>
            <Link href="/#about" className="nav-link">
              O nama
            </Link>
          </li>
          <li>
            <Link href="/#contact" className="nav-link">
              Kontakt
            </Link>
          </li>
          <AccountNav />
        </ul>
      </nav>
    </header>
  );
}
