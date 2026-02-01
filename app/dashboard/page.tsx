"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAuth } from "@/lib/auth/checkAuth";
import { getDashboardMetrics } from "@/lib/api/ticket";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

// ----- Types -----
interface TicketWithComments {
  _id: string;
  totalComments: number;
}

interface TicketsByCategory {
  _id: string;
  count: number;
}

interface TicketsByDepartment {
  _id: string;
  count: number;
}

interface TicketMetrics {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  ticketsWithComments: TicketWithComments[];
  ticketsByDepartment: TicketsByDepartment[];
  ticketsByCategory: TicketsByCategory[];
}

interface UserMetrics {
  totalUsers: number;
  totalAdmins: number;
  totalSuperAdmins: number;
}

interface DashboardMetrics {
  tickets: TicketMetrics;
  users: UserMetrics;
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    const protectAndFetch = async () => {
      const user = await checkAuth();
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const data = await getDashboardMetrics();
        setMetrics(data);
      } catch (err: unknown) {
        console.error("Failed to fetch dashboard metrics:", (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    protectAndFetch();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">Failed to load dashboard metrics.</p>
      </div>
    );
  }

  const { tickets, users } = metrics;

  return (
    <div className="space-y-6 p-4">
      {/* ----- Page Header ----- */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of recent helpdesk activity
        </p>
      </div>

      {/* ----- Summary Cards ----- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>{tickets.totalTickets}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>{tickets.openTickets}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>In Progress</CardTitle>
          </CardHeader>
          <CardContent>{tickets.inProgressTickets}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resolved Tickets</CardTitle>
          </CardHeader>
          <CardContent>{tickets.resolvedTickets}</CardContent>
        </Card>
      </div>

      {/* ----- Ticket Status Bar Chart ----- */}
      <Card>
        <CardHeader>
          <CardTitle>Ticket Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { name: "Open", count: tickets.openTickets },
                { name: "In Progress", count: tickets.inProgressTickets },
                { name: "Resolved", count: tickets.resolvedTickets },
                { name: "Closed", count: tickets.closedTickets },
              ]}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

     {/* ----- Tickets by Department Pie Chart ----- */}
<Card>
  <CardHeader>
    <CardTitle>Tickets by Department</CardTitle>
  </CardHeader>
  <CardContent className="h-64 flex justify-center items-center">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={tickets.ticketsByDepartment}
          dataKey="count"
          nameKey="_id"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#82ca9d"
          label={(entry) => {
            const data = entry.payload as TicketsByDepartment;
            const total = tickets.ticketsByDepartment.reduce(
              (acc, t) => acc + t.count,
              0
            );
            const percent = ((data.count / total) * 100).toFixed(1);
            return `${data._id}: ${data.count} (${percent}%)`;
          }}
        >
          {tickets.ticketsByDepartment.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </CardContent>
</Card>

      {/* ----- Tickets with Most Comments Table ----- */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets with Most Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th className="p-2">Ticket ID</th>
                  <th className="p-2">Comments</th>
                </tr>
              </thead>
              <tbody>
                {tickets.ticketsWithComments.map((t: TicketWithComments) => (
                  <tr key={t._id} className="border-b hover:bg-muted/50">
                    <td className="p-2">{t._id}</td>
                    <td className="p-2">{t.totalComments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* ----- User Summary Cards ----- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>{users.totalUsers}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Admins</CardTitle>
          </CardHeader>
          <CardContent>{users.totalAdmins}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Super Admins</CardTitle>
          </CardHeader>
          <CardContent>{users.totalSuperAdmins}</CardContent>
        </Card>
      </div>
    </div>
  );
}
