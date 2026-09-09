import Image from "next/image";

import styles from "./LogoMarquee.module.css";

const manufacturers = [
  { name: "Midea", src: "/images/midea.png", width: 733, height: 285 },
  { name: "Korel", src: "/images/korel.png", width: 630, height: 153 },
  // { name: "Samsung", src: "/images/samsung.png", width: 2000, height: 306 },
  { name: "Vaillant", src: "/images/vaillant.png", width: 613, height: 161 },
  { name: "Tesla", src: "/images/tesla.webp", width: 947, height: 232 },
  // { name: "Toshiba", src: "/images/toshiba.png", width: 747, height: 122 },
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