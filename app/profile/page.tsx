"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, forgotPassword } from "@/lib/api/auth";
import type { User } from "@/lib/api/auth";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUser();
        setUser(data);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleResetPassword = async () => {
    if (!user) return;

    setSending(true);
    try {
      const res = await forgotPassword(user.email);
      toast.success(res.message || "Password reset email sent");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to send reset email");
      }
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading profile...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">{user.name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Role</p>
            <p className="font-medium capitalize">{user.role}</p>
          </div>

          <Button
            className="w-full mt-4"
            variant="outline"
            onClick={handleResetPassword}
            disabled={sending}
          >
            {sending ? "Sending reset link..." : "Reset Password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
