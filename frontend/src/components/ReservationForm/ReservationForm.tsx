"use client";

import { useState } from "react";
import styles from "./ReservationForm.module.scss";
import Button from "@/components/Button/Button";

interface ReservationFormProps {
  onSubmit: (form: {
    memberName: string;
    destination: string;
    startDate: string;
    endDate: string;
    status: string;
  }) => void;
}

export default function ReservationForm({ onSubmit }: ReservationFormProps) {
  const [form, setForm] = useState({
    memberName: "",
    destination: "",
    startDate: "",
    endDate: "",
    status: "pending",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="memberName" className={styles.label}>Member Name</label>
        <input
          id="memberName"
          className={styles.input}
          name="memberName"
          value={form.memberName}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="destination" className={styles.label}>Destination</label>
        <input
          id="destination"
          className={styles.input}
          name="destination"
          value={form.destination}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="startDate" className={styles.label}>Start Date</label>
        <input
          id="startDate"
          type="date"
          className={styles.input}
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="endDate" className={styles.label}>End Date</label>
        <input
          id="endDate"
          type="date"
          className={styles.input}
          name="endDate"
          value={form.endDate}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="status" className={styles.label}>Status</label>
        <select
          id="status"
          className={styles.select}
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className={styles.actions}>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}