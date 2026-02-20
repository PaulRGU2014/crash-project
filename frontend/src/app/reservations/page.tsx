"use client";

import styles from './page.module.scss';
import Button from '@/components/Button/Button';
import ReservationCard from '@/components/ReservationCard/ReservationCard';
import { getReservations } from "@/lib/api";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Reservation {
  id: number;
  memberName: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function ReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getReservations()
      .then(setReservations)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <main className={styles.container}><div>Loading...</div></main>;
  if (error) return <main className={styles.container}><div>Error: {error}</div></main>;

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Reservations</h1>
        <Button onClick={() => router.push("/reservations/new")}>
          Add Reservation
        </Button>
      </div>

      <div className={styles.list}>
        {reservations.length === 0 ? (
          <p>No reservations found. Create your first reservation!</p>
        ) : (
          reservations.map((res: Reservation) => (
            <div key={res.id} onClick={() => router.push(`/reservations/${res.id}`)} className={styles.clickable}>
              <ReservationCard reservation={res} />
            </div>
          ))
        )}
      </div>
    </main>
  );
}
