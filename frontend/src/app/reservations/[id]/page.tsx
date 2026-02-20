"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button/Button";
import styles from "../page.module.scss";

interface Reservation {
  id: number;
  memberName: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function ReservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`http://localhost:5299/api/reservations/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch reservation");
        return res.json();
      })
      .then((data) => {
        setReservation(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this reservation?")) return;

    try {
      const res = await fetch(`http://localhost:5299/api/reservations/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete reservation");

      router.push("/reservations");
    } catch (err) {
      alert("Failed to delete reservation");
    }
  };

  if (loading) return <div className={styles.container}>Loading...</div>;
  if (error) return <div className={styles.container}>Error: {error}</div>;
  if (!reservation) return <div className={styles.container}>Reservation not found</div>;

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Reservation Details</h1>
        <div className={styles.buttonGroup}>
          <Button onClick={() => router.push("/reservations")}>Back</Button>
          <Button onClick={handleDelete}>Delete</Button>
        </div>
      </div>

      <div className={styles.detailCard}>
        <div className={styles.detailRow}>
          <strong>Member Name:</strong>
          <span>{reservation.memberName}</span>
        </div>
        <div className={styles.detailRow}>
          <strong>Destination:</strong>
          <span>{reservation.destination}</span>
        </div>
        <div className={styles.detailRow}>
          <strong>Start Date:</strong>
          <span>{new Date(reservation.startDate).toLocaleDateString()}</span>
        </div>
        <div className={styles.detailRow}>
          <strong>End Date:</strong>
          <span>{new Date(reservation.endDate).toLocaleDateString()}</span>
        </div>
        <div className={styles.detailRow}>
          <strong>Status:</strong>
          <span className={styles[reservation.status]}>{reservation.status}</span>
        </div>
      </div>
    </main>
  );
}
