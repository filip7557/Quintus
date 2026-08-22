import Image from "next/image";

import styles from "./LogoMarquee.module.css";

const manufacturers = [
  { name: "Midea", src: "/images/midea.png", width: 788, height: 340 },
  { name: "Korel", src: "/images/korel.png", width: 641, height: 167 },
  { name: "Samsung", src: "/images/samsung.png", width: 2064, height: 340 },
  { name: "Toshiba", src: "/images/toshiba.png", width: 779, height: 140 },
];

function LogoGroup({ duplicate = false }) {
  return (
    <div className={styles.group} aria-hidden={duplicate || undefined}>
      {manufacturers.map((manufacturer) => (
        <Image
          key={manufacturer.name}
          className={styles.logo}
          src={manufacturer.src}
          alt={duplicate ? "" : manufacturer.name}
          width={manufacturer.width}
          height={manufacturer.height}
          sizes="(max-width: 600px) 220px, 340px"
          loading="eager"
        />
      ))}
    </div>
  );
}

export default function LogoMarquee() {
  return (
    <section
      className={styles.marquee}
      aria-label="Proizvođači klima uređaja"
    >
      <div className={styles.viewport}>
        <div className={styles.track}>
          <LogoGroup />
          <LogoGroup duplicate />
        </div>
      </div>
    </section>
  );
}