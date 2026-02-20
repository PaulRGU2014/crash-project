"use client";

import styles from './page.module.scss';
import Button from '@/components/Button/Button';

export default function ReservationsPage() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Reservations</h1>
      <p>This is where the reservation list will go.</p>
      <Button onClick={() => console.log('Add Reservation')}>
        Add Reservation
      </Button>      
    </main>
  );
}