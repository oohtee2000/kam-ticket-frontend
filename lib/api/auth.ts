// lib/api/auth.ts
import axios, {AxiosError} from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

// ============================
// Types
// ============================
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}


export interface PromoteRoleResponse {
  message: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}
// ============================
// Auth API functions
// ============================

// REGISTER
export const registerUser = async (data: RegisterData): Promise<User> => {
  const response = await axios.post(`${API_URL}/api/register`, data, {
    withCredentials: true, // to handle cookies
  });
  return response.data;
};

// LOGIN
export const loginUser = async (data: LoginData): Promise<{ message: string }> => {
  const response = await axios.post(`${API_URL}/api/login`, data, {
    withCredentials: true,
  });
  return response.data;
};

// LOGOUT
export const logoutUser = async (): Promise<{ message: string }> => {
  const response = await axios.post(`${API_URL}/api/logout`, {}, {
    withCredentials: true,
  });
  return response.data;
};

// GET AUTHENTICATED USER
export const getUser = async (): Promise<User> => {
  const response = await axios.get(`${API_URL}/api/user`, {
    withCredentials: true,
  });
  return response.data;
};

export const getAllUsers = async (): Promise<User[]> => {
  const res = await fetch(`${API_URL}/api/users`, {
    credentials: "include",
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ getAllUsers failed:", errorText);
    throw new Error("Failed to fetch users");
  }

  const data = await res.json();

  console.log("🟢 RAW /api/users RESPONSE:", data);

  // ✅ FIX: return the actual users array
  return Array.isArray(data.users) ? data.users : [];
};


// FORGOT PASSWORD
export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const response = await axios.post(`${API_URL}/api/forgot-password`, { email });
  return response.data;
};

// RESET PASSWORD
export const resetPassword = async (token: string, password: string): Promise<{ message: string }> => {
  const response = await axios.post(`${API_URL}/api/reset-password/${token}`, { password });
  return response.data;
};


// PROMOTE ROLE
/**
 * Promote a user to a new role.
 * - Admins can only promote users to "admin".
 * - Super-admins can promote anyone to any role.
 *
 * @param id - Target user ID
 * @param role - Desired role ("user" | "admin" | "super_admin")
 */
export const promoteUserRole = async (
  id: string,
  role: "user" | "admin" | "super_admin"
): Promise<PromoteRoleResponse> => {
  try {
    const response = await axios.put<PromoteRoleResponse>(
      `${API_URL}/api/promote/${id}`, // Matches your backend route
      { role },
      { withCredentials: true } // send cookies for auth
    );

    return response.data;
  } catch (error: unknown) {
    // Narrow the error type
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message: string }>;
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw new Error(axiosError.message);
    }

    // Fallback for non-Axios errors
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Failed to promote user");
  }
};