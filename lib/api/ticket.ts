// lib/api/ticket.ts

export interface CreateTicketPayload {
  title: string;
  description: string;
  email: string;
  department: string;
  image?: File;
}

export type TicketComment = {
  _id: string;
  senderType: "user" | "staff";
  sender?: {
    _id: string;
    name: string;
    email: string;
    role: "user" | "admin" | "super_admin";
  };
  message: string;
  createdAt: string;
};


const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

/**
 * Helper to get auth token (edit based on your auth setup)
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("token"); // or cookie-based
  return {
    Authorization: token ? `Bearer ${token}` : "",
  };
};

/* ---------------- CREATE TICKET ---------------- */
export const createTicket = async (data: FormData) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/tickets`,
    {
      method: "POST",
      credentials: "include",
      body: data,
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to create ticket");
  }

  return res.json();
};

/* ---------------- GET ALL TICKETS ---------------- */
export const getAllTickets = async () => {
  const res = await fetch(`${API_URL}/api/tickets`, {
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch tickets");

  return res.json();
};

/* ---------------- GET TICKET BY ID ---------------- */
export const getTicketById = async (id: string) => {
  const res = await fetch(`${API_URL}/api/tickets/${id}`, {
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
  });

  if (!res.ok) throw new Error("Ticket not found");

  return res.json();
};

/* ---------------- GET TICKETS BY EMAIL ---------------- */
export const getTicketsByEmail = async (email: string) => {
  const res = await fetch(`${API_URL}/api/tickets/email/${email}`, {
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch tickets");

  return res.json();
};

/* ---------------- ASSIGN TICKET ---------------- */
export const assignTicket = async (ticketId: string, userId: string) => {
  const res = await fetch(`${API_URL}/api/tickets/assign/${ticketId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ userId }),
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to assign ticket");

  return res.json();
};

/* ---------------- CHANGE STATUS ---------------- */
export const changeTicketStatus = async (
  ticketId: string,
  status: "Open" | "In Progress" | "Resolved" | "Closed"
) => {
  const res = await fetch(`${API_URL}/api/tickets/status/${ticketId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ status }),
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to update status");

  return res.json();
};

/* ---------------- DELETE SINGLE ---------------- */
export const deleteTicket = async (id: string) => {
  const res = await fetch(`${API_URL}/api/tickets/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to delete ticket");

  return res.json();
};

/* ---------------- DASHBOARD METRICS ---------------- */
export const getTicketMetrics = async () => {
  const res = await fetch(`${API_URL}/api/tickets/metrics`, {
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch metrics");

  return res.json();
};


/* ---------------- ADD COMMENT (TRACKING USER) ---------------- */
export const addCommentByTracker = async (
  trackingToken: string,
  message: string
) => {
  const res = await fetch(
    `${API_URL}/api/tickets/track/${trackingToken}/comment`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to add comment");
  }

  return res.json();
};

/* ---------------- ADD COMMENT (STAFF) ---------------- */
export const addCommentByStaff = async (
  ticketId: string,
  message: string
) => {
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ message }),
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to send reply");
  }

  return res.json();
};


/* ---------------- DASHBOARD METRICS ---------------- */
export const getDashboardMetrics = async () => {
  const res = await fetch(`${API_URL}/api/metrics`, {
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include", // send cookies if using session auth
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to fetch dashboard metrics");
  }

  return res.json();
};