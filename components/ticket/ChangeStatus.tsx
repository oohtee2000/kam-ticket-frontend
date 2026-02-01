"use client";

import { useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { changeTicketStatus } from "@/lib/api/ticket";
import { toast } from "react-hot-toast";

export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";

interface ChangeStatusProps {
  ticketId: string;
  currentStatus: TicketStatus;
  onStatusChanged?: (newStatus: TicketStatus) => void; // optional callback
}

const statuses: TicketStatus[] = ["Open", "In Progress", "Resolved", "Closed"];

export default function ChangeStatus({ ticketId, currentStatus, onStatusChanged }: ChangeStatusProps) {
  const [status, setStatus] = useState<TicketStatus>(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleChange = async (newStatus: TicketStatus) => {
    setStatus(newStatus);
    setLoading(true);

    try {
      const res = await changeTicketStatus(ticketId, newStatus);
      toast.success(res.message || "Status updated");
      onStatusChanged?.(newStatus);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to update status";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
  value={status}
  onChange={(e) =>
    handleChange(e.target.value as TicketStatus)
  }
  disabled={loading}
  className="w-48 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm
             shadow-sm focus:outline-none focus:ring-2 focus:ring-black
             focus:border-black disabled:opacity-60 disabled:cursor-not-allowed"
>
  <option value="" disabled>
    Change Status
  </option>

  {statuses.map((s) => (
    <option key={s} value={s}>
      {s}
    </option>
  ))}
</select>

  );
}
