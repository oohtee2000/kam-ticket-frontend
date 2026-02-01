"use client";


import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { addCommentByTracker } from "@/lib/api/ticket";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type AssignedUser = {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "super_admin";
};
type TicketComment = {
  _id: string;
  senderType: "user" | "staff";
  sender?: {
    name: string;
    email: string;
  };
  message: string;
  createdAt: string;
};


type TrackedTicket = {
  _id: string;
  title: string;
  description: string;
  department: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  assignedTo?: AssignedUser | null;
  comments: TicketComment[]; // 👈 ADD THIS
  createdAt: string;
  updatedAt: string;
};


export default function TrackTicketPage() {
  const { token } = useParams<{ token: string }>();
  const [ticket, setTicket] = useState<TrackedTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<TicketComment[]>([]);

const [newComment, setNewComment] = useState("");

const handleAddComment = async () => {
  if (!newComment.trim() || !token) return;

  try {
    const res = await addCommentByTracker(token, newComment);

    // backend returns updated ticket OR new comment
    const newBackendComment = res.comment || res;

    setComments((prev) => [...prev, newBackendComment]);
    setNewComment("");
  } catch (err) {
    console.error("Failed to add comment", err);
    alert("Failed to send comment. Please try again.");
  }
};


  useEffect(() => {
    if (!token) return;

    const fetchTicket = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/track/${token}`
        );

        if (!res.ok) {
          setTicket(null);
          return;
        }

        const data: TrackedTicket = await res.json();
        setTicket(data);
        setComments(data.comments || []);

      } catch {
        setTicket(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [token]);

  /* ---------------- Loading UI ---------------- */
  if (loading) {
    return (
      <div className="max-w-xl mx-auto mt-10">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---------------- Not Found ---------------- */
  if (!ticket) {
    return (
      <div className="max-w-xl mx-auto mt-10">
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Ticket not found or link is invalid.
          </CardContent>
        </Card>
      </div>
    );
  }

 const getStatusBadge = (status: TrackedTicket["status"]) => {
  switch (status) {
    case "Open":
      return <Badge>{status}</Badge>;

    case "In Progress":
      return <Badge variant="secondary">{status}</Badge>;

    case "Resolved":
      return (
        <Badge className="bg-green-600 text-white hover:bg-green-600">
          {status}
        </Badge>
      );

    case "Closed":
      return <Badge variant="destructive">{status}</Badge>;
  }
};


  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>{ticket.title}</CardTitle>
            {getStatusBadge(ticket.status)}

          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Department</p>
            <p className="font-medium">{ticket.department}</p>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="leading-relaxed">{ticket.description}</p>
          </div>

         {/* Assigned To */}
{ticket.assignedTo && (
  <>
    <Separator />
    <div>
      <p className="text-sm text-muted-foreground">Assigned To</p>
      <p className="font-medium">{ticket.assignedTo.name}</p>
      <p className="text-sm text-muted-foreground">
        {ticket.assignedTo.email}
      </p>
    </div>
  </>
)}

<Separator />

{/* ---------------- Comments Section ---------------- */}
<div className="space-y-4">
  <h3 className="font-semibold text-sm">Comments</h3>

  {/* Add Comment */}
  <div className="space-y-2">
    <Textarea
      placeholder="Write a comment..."
      value={newComment}
      onChange={(e) => setNewComment(e.target.value)}
    />
    <div className="flex justify-end">
      <Button onClick={handleAddComment}>
        Add Comment
      </Button>
    </div>
  </div>

  {/* Comment List */}
  {comments.length === 0 ? (
    <p className="text-sm text-muted-foreground">
      No comments yet.
    </p>
  ) : (
    <div className="space-y-3">
      {comments.map((comment, index) => (
  <Card key={comment._id ?? `${comment.createdAt}-${index}`}>

          <CardContent className="py-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                {comment.senderType === "user"
                  ? "You"
                  : comment.sender?.name}
              </span>
              <span className="text-muted-foreground">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>

            <p className="text-sm leading-relaxed">
              {comment.message}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )}
</div>

        </CardContent>
      </Card>
    </div>
  );
}
