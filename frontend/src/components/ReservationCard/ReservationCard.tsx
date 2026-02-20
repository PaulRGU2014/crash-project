import styles from './ReservationCard.module.scss';

interface Reservation {
  memberName: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function ReservationCard({ reservation }: { reservation: Reservation }) {
  return (
    <div className={styles.card}>
      <div className={styles.info}>
        <span className={styles.name}>{reservation.memberName}</span>
        <span className={styles.details}>
          {reservation.destination} • {reservation.startDate} → {reservation.endDate}
        </span>
      </div>

      <span className={`${styles.status} ${styles[reservation.status]}`}>
        {reservation.status}
      </span>
    </div>
  );
}