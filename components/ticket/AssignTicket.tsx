"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { assignTicket } from "@/lib/api/ticket";
import { getAllUsers, type User } from "@/lib/api/auth";
import { toast } from "react-hot-toast";

interface AssignTicketProps {
  ticketId: string;
  assignedTo?: { _id: string; name: string };
  onAssigned?: () => void;
}

export default function AssignTicket({
  ticketId,
  assignedTo,
  onAssigned,
}: AssignTicketProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(false);

  // Load all users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (err) {
        console.error("❌ Failed to fetch users:", err);
        toast.error("Failed to load users");
      }
    };
    loadUsers();
  }, []);

  // Preselect assigned admin
  useEffect(() => {
    if (assignedTo?._id) {
      setSelectedUser(assignedTo._id);
    }
  }, [assignedTo]);

  const handleAssign = async () => {
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }

    if (assignedTo?._id === selectedUser) {
      toast("Ticket is already assigned to this user");
      return;
    }

    try {
      setLoading(true);
      await assignTicket(ticketId, selectedUser);
      toast.success(
        assignedTo
          ? "Ticket reassigned successfully!"
          : "Ticket assigned successfully!"
      );
      onAssigned?.();
    } catch (err) {
      console.error("❌ Assign ticket failed:", err);
      toast.error("Failed to assign ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-2">
      {/* Native Select */}
      <select
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
        className="w-64 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-black focus:border-black
                   disabled:bg-gray-100"
      >
        <option value="" disabled>
          Select user
        </option>

        {users.length === 0 && (
          <option disabled>No users available</option>
        )}

        {users.map((u) => (
          <option key={u._id} value={u._id}>
            {u.name} ({u.email})
          </option>
        ))}
      </select>

      <Button
        size="sm"
        onClick={handleAssign}
        disabled={loading || !selectedUser}
      >
        {loading
          ? assignedTo
            ? "Reassigning..."
            : "Assigning..."
          : assignedTo
          ? "Reassign"
          : "Assign"}
      </Button>

      {assignedTo && (
        <span className="text-sm text-gray-500 mt-1 sm:mt-0">
          Currently assigned: <strong>{assignedTo.name}</strong>
        </span>
      )}
    </div>
  );
}
