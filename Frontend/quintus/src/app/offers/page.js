"use client";

import NavBar from "@/components/NavBar/NavBar";
import OfferForm from "@/components/Offers/OfferForm";
import styles from "./page.module.css";

export default function OffersPage() {
  return (
    <>
      <NavBar />
      <main className={styles.container}>
        <OfferForm />
      </main>
    </>
  );
}
