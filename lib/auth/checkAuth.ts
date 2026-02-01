import { getUser, type User } from "@/lib/api/auth";

export type AuthUser = User & {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  hasRole: (role: "user" | "admin" | "super_admin") => boolean;
};

export const checkAuth = async (): Promise<AuthUser | null> => {
  try {
    const user = await getUser();

    return {
      ...user,
      isAdmin: user.role === "admin" || user.role === "super_admin",
      isSuperAdmin: user.role === "super_admin",
      hasRole: (role) => user.role === role,
    };
  } catch {
    return null;
  }
};
