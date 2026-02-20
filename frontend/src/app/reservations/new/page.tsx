"use client";

import { useRouter } from "next/navigation";
import ReservationForm from "@/components/ReservationForm/ReservationForm";
import { createReservation } from "@/lib/api";
import styles from "../page.module.scss";

export default function NewReservationPage() {
  const router = useRouter();

  async function handleCreate(data: {
    memberName: string;
    destination: string;
    startDate: string;
    endDate: string;
    status: string;
  }) {
    try {
      await createReservation(data);
      router.push("/reservations");
    } catch (error) {
      console.error("Failed to create reservation:", error);
      alert("Failed to create reservation. Please try again.");
    }
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Create Reservation</h1>
      <ReservationForm onSubmit={handleCreate} />
    </main>
  );
}
