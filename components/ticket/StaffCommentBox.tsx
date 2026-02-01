"use client";

import { useState } from "react";
import { addCommentByStaff, TicketComment } from "@/lib/api/ticket";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  ticketId: string;
  onCommentAdded?: (comment: TicketComment) => void;
};

export default function StaffCommentBox({
  ticketId,
  onCommentAdded,
}: Props) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;

    try {
      setSending(true);
      const res = await addCommentByStaff(ticketId, message);

      // Expect backend to return the created comment
      const newComment: TicketComment =
        res.comment ?? res;

      onCommentAdded?.(newComment);
      setMessage("");
    } catch (err) {
      console.error("Failed to add staff comment", err);
      alert("Failed to send comment");
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-3 pt-4">
        <Textarea
          placeholder="Write an internal comment or reply to the user..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={sending || !message.trim()}
          >
            {sending ? "Sending..." : "Add Comment"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
