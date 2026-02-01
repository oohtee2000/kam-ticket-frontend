"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { checkAuth, type AuthUser } from "@/lib/auth/checkAuth"; // <-- fixed
import StaffCommentBox from "@/components/ticket/StaffCommentBox";

import { getAllTickets, TicketComment } from "@/lib/api/ticket";
import AssignTicket from "@/components/ticket/AssignTicket";
import ChangeStatus, { TicketStatus } from "@/components/ticket/ChangeStatus";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";

/* ================= TYPES ================= */

type Ticket = {
  _id: string;
  title: string;
  description: string;
  created_at: string;
  assignedTo?: { _id: string; name: string };
  status: string;
  created_by?: string;
  department: string;
  image?: string;
  comments?: TicketComment[]; // <-- add this
};



/* ================= HELPERS ================= */

const toISODate = (date?: string) => {
  if (!date) return "—";
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return "—";
  return parsed.toISOString().split("T")[0];
};

const resolveImageUrl = (image?: string) => {
  if (!image) return "";
  const cleanPath = image.startsWith("/") ? image.slice(1) : image;
  return `${process.env.NEXT_PUBLIC_API_URL}/${cleanPath}`;
};

/* ================= PAGE ================= */

export default function ViewTicketsPage() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    department: "all",
    status: "all",
  });
  const [ticketComments, setTicketComments] = useState<
  Record<string, TicketComment[]>
>({});


  /* ================= AUTH ================= */

  useEffect(() => {
    const loadUser = async () => {
      try {
        const authUser = await checkAuth(); //error here if checkAuth is not defined
        setUser(authUser);
      } catch (err) {
        console.error(err);
      } finally {
        setAuthLoading(false);
      }
    };
    loadUser();
  }, []);

  /* ================= FETCH TICKETS ================= */

  useEffect(() => {
  const loadTickets = async () => {
    try {
      const data: Ticket[] = await getAllTickets();
      setTickets(data);
      setExpanded(Object.fromEntries(data.map((t) => [t._id, true])));

      // Initialize comments state
      const initialComments: Record<string, TicketComment[]> = {};
      data.forEach((t: Ticket) => {
        initialComments[t._id] = t.comments || [];
      });
      setTicketComments(initialComments);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  loadTickets();
}, []);



  /* ================= FILTERS ================= */

  const unique = (key: keyof Ticket) =>
    Array.from(new Set(tickets.map((t) => t[key]).filter(Boolean))) as string[];

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const iso = toISODate(t.created_at);
      if (filters.startDate && iso < filters.startDate) return false;
      if (filters.endDate && iso > filters.endDate) return false;
      if (filters.department !== "all" && t.department !== filters.department)
        return false;
      if (filters.status !== "all" && t.status !== filters.status) return false;
      return true;
    });
  }, [tickets, filters]);


  /* ================= FILTER TICKETS BY ROLE ================= */
const visibleTickets = useMemo(() => {
  // If user is admin/super admin, show all filtered tickets
  if (user?.isAdmin || user?.isSuperAdmin) return filteredTickets;

  // Otherwise (regular user), only show tickets assigned to them
  return filteredTickets.filter(
    (t) => t.assignedTo?._id === user?._id
  );
}, [filteredTickets, user]);


  /* ================= UI ================= */

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-muted-foreground">
        Checking permissions…
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      {/* ===== HEADER ===== */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">All Tickets</h1>
        <p className="text-muted-foreground">
          View and manage all submitted tickets
        </p>
      </div>

     <Card className="p-6">
  <CardHeader className="p-0 pb-4">
    <CardTitle className="text-lg">Filters</CardTitle>
  </CardHeader>

  <CardContent className="p-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {/* Start Date */}
    <div className="flex flex-col gap-1 w-full">
      <Label htmlFor="startDate">Start Date</Label>
      <Input
        id="startDate"
        type="date"
        className="w-full"
        value={filters.startDate}
        onChange={(e) =>
          setFilters({ ...filters, startDate: e.target.value })
        }
      />
    </div>

    {/* End Date */}
    <div className="flex flex-col gap-1 w-full">
      <Label htmlFor="endDate">End Date</Label>
      <Input
        id="endDate"
        type="date"
        className="w-full"
        value={filters.endDate}
        onChange={(e) =>
          setFilters({ ...filters, endDate: e.target.value })
        }
      />
    </div>

    {/* Department Dropdown */}
    <div className="flex flex-col gap-1 w-full">
      <Label>Department</Label>
      <select
  value={filters.department}
  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  <option value="all">All</option>
  {unique("department").map((d) => (
    <option key={d} value={d}>
      {d}
    </option>
  ))}
</select>

    </div>

    {/* Status Dropdown */}
   <div className="flex flex-col gap-1 w-full">
  <Label>Status</Label>

  <select
    value={filters.status}
    onChange={(e) =>
      setFilters({ ...filters, status: e.target.value })
    }
    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm
               shadow-sm focus:outline-none focus:ring-2 focus:ring-black
               focus:border-black"
  >
    <option value="">Select Status</option>
    <option value="all">All</option>

    {unique("status").map((s) => (
      <option key={s} value={s}>
        {s}
      </option>
    ))}
  </select>
</div>

  </CardContent>
</Card>



      {/* ===== TICKETS ===== */}
      {loading ? (
        <p className="text-center text-muted-foreground">Loading tickets…</p>
      ) : filteredTickets.length === 0 ? (
        <p className="text-center text-muted-foreground">No tickets found</p>
      ) : (
        <div className="space-y-6">
          {visibleTickets.length === 0 ? (
  <p className="text-center text-muted-foreground">No tickets found</p>
) : (
  <div className="space-y-6">
    {visibleTickets.map((t) => (
      <Card key={t._id} className="p-6 space-y-6 bg-white shadow-sm rounded-lg">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-gray-800">{t.title}</h3>
            <p className="text-sm text-gray-500">
              {toISODate(t.created_at)} • {t.department}
            </p>
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="text-gray-400 hover:text-gray-600"
            onClick={() =>
              setExpanded((p) => ({ ...p, [t._id]: !p[t._id] }))
            }
          >
            {expanded[t._id] ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </div>

        {/* Expanded Section */}
        {expanded[t._id] && (
          <div className="space-y-6">
            <p className="text-sm text-gray-700 leading-relaxed">{t.description}</p>

            <div className="flex flex-wrap items-center gap-3">
              <Badge className="px-3 py-1">{t.status}</Badge>
              <Badge variant="outline" className="px-3 py-1">{t.department}</Badge>
              {t.assignedTo && (
                <span className="text-sm text-gray-500">
                  Assigned to: <strong>{t.assignedTo.name}</strong>
                </span>
              )}
            </div>

            {t.image && (
              <ScrollArea className="rounded-md border border-gray-200 max-w-md h-48 overflow-hidden">
                <div className="relative w-full h-full">
                  <Image
                    src={resolveImageUrl(t.image)}
                    alt="Ticket"
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              </ScrollArea>
            )}

            {/* Staff Comments */}
{(user?.isAdmin ||
  user?.isSuperAdmin ||
  t.assignedTo?._id === user?._id) && (
  <div className="pt-4 border-t space-y-3">
    <StaffCommentBox
      ticketId={t._id}
      onCommentAdded={(comment) => {
  const commentWithDate = {
    ...comment,
    createdAt: comment.createdAt || new Date().toISOString()
  };

  setTicketComments((prev) => ({
    ...prev,
    [t._id]: [...(prev[t._id] || []), commentWithDate],
  }));
}}

    />
  </div>
)}

{/* Comments */}
<div className="space-y-3 mt-4">
  {(ticketComments[t._id]?.length ?? 0) === 0 ? (
    <p className="text-sm text-muted-foreground">No comments yet</p>
  ) : (
    ticketComments[t._id].map((comment) => (
      <Card key={comment._id}>
        <CardContent className="py-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">
              {comment.senderType === "user" ? "User" : comment.sender?.name ?? "Staff"}
            </span>
            <span className="text-muted-foreground">
                {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : "—"}
                </span>

          </div>
          <p className="text-sm leading-relaxed">{comment.message}</p>
        </CardContent>
      </Card>
    ))
  )}
</div>


            {/* Assign Ticket (Super Admin Only) */}
            {(user?.isSuperAdmin) && (
              <div className="pt-4 border-t border-gray-200">
                <AssignTicket
                  ticketId={t._id}
                  assignedTo={t.assignedTo}
                  onAssigned={() => getAllTickets().then(setTickets)}
                />
              </div>
            )}
          </div>
        )}


        {/* Change Status (Assigned User or Admins) */}
        {(user?.isAdmin || user?.isSuperAdmin || t.assignedTo?._id === user?._id) && (
          <div className="pt-4 border-t border-gray-200">
            <ChangeStatus
              ticketId={t._id}
              currentStatus={t.status as TicketStatus}
              onStatusChanged={(newStatus: TicketStatus) => {
                setTickets((prev) =>
                  prev.map((ticket) =>
                    ticket._id === t._id ? { ...ticket, status: newStatus } : ticket
                  )
                );
              }}
            />
          </div>
        )}
      </Card>
    ))}
  </div>
)}

        </div>
      )}
    </div>
  );
}

