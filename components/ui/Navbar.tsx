"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "./button";

export const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-md">
      {/* Logo */}
      <Link href="/" className="text-xl font-bold text-indigo-600">
        KAM Ticket
      </Link>

      {/* Desktop Links */}
      <div className="hidden md:flex gap-6">
        <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600">
          Dashboard
        </Link>
        <Link href="/ticket" className="text-gray-700 hover:text-indigo-600">
          Tickets
        </Link>
        <Link href="/profile" className="text-gray-700 hover:text-indigo-600">
          Profile
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        className="md:hidden"
        onClick={() => setOpen(!open)}
      >
        <Menu />
      </Button>

      

      {/* Mobile Links */}
      {open && (
        <div className="absolute top-16 left-0 w-full bg-white border-t border-gray-200 shadow-md flex flex-col md:hidden">
          <Link href="/dashboard" className="px-4 py-2 hover:bg-gray-100">
            Dashboard
          </Link>
          <Link href="/tickets" className="px-4 py-2 hover:bg-gray-100">
            Tickets
          </Link>
          <Link href="/profile" className="px-4 py-2 hover:bg-gray-100">
            Profile
          </Link>
        </div>
      )}
    </nav>
  );
};
