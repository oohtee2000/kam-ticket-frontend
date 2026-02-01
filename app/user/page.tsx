"use client";

import { useEffect, useState } from "react";
import { getAllUsers, promoteUserRole, type User } from "@/lib/api/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handlePromote = async (
    userId: string,
    role: "user" | "admin" | "super_admin"
  ) => {
    try {
      setUpdatingId(userId);
      await promoteUserRole(userId, role);
      toast.success("User role updated");
      await loadUsers();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update role");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <p className="text-center py-10 text-muted-foreground">Loading users…</p>;
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Users Management</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        user.role === "super_admin"
                          ? "destructive"
                          : user.role === "admin"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {user.role}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    {user.role === "super_admin" ? (
                      <span className="text-xs text-muted-foreground">
                        Cannot modify
                      </span>
                    ) : (
                      <Select
                        defaultValue={user.role}
                        onValueChange={(value) =>
                          handlePromote(
                            user._id,
                            value as "user" | "admin" | "super_admin"
                          )
                        }
                        disabled={updatingId === user._id}
                      >
                        <SelectTrigger className="w-36 ml-auto">
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {users.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-6"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
