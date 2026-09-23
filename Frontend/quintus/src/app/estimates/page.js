"use client";

import NavBar from "@/components/NavBar/NavBar";
import EstimateForm from "@/components/Offers/EstimateForm";
import EstimateAccessGate from "./EstimateAccessGate";
import styles from "./page.module.css";

export default function EstimatesPage() {
  return (
    <EstimateAccessGate redirectTo="/estimates">
      <NavBar />
      <main className={styles.container}>
        <EstimateForm />
      </main>
    </EstimateAccessGate>
  );
}
