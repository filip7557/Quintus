"use client";

import NavBar from "@/components/NavBar/NavBar";
import EstimateForm from "@/components/Offers/EstimateForm";
import EstimateAccessGate from "../EstimateAccessGate";
import styles from "./page.module.css";

export default function CreateEstimatePage() {
  return (
    <EstimateAccessGate redirectTo="/estimates/create">
      <NavBar />
      <main className={styles.container}>
        <EstimateForm />
      </main>
    </EstimateAccessGate>
  );
}
