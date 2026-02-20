const API_URL = "http://localhost:5299/api/reservations";

export async function getReservations() {
  const res = await fetch(API_URL, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch reservations");
  }

  return res.json();
}

export async function getReservation(id: string | number) {
  const res = await fetch(`${API_URL}/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch reservation");
  }

  return res.json();
}

export async function createReservation(data: {
  memberName: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: string;
}) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create reservation");
  }

  return res.json();
}

export async function updateReservation(
  id: string | number,
  data: {
    memberName: string;
    destination: string;
    startDate: string;
    endDate: string;
    status: string;
  }
) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update reservation");
  }
}

export async function deleteReservation(id: string | number) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete reservation");
  }
}
