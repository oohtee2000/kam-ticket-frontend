"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home,
  Ticket,
  User,
  Menu,
  Settings,
  LogOut,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { useSidebar } from "@/context/SidebarContext";
import { logoutUser } from "@/lib/api/auth";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const items: SidebarItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: <Home size={20} /> },
  { title: "Tickets", href: "/ticket", icon: <Ticket size={20} /> },
  { title: "Users", href: "/user", icon: <User size={20} /> },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { setExpanded } = useSidebar();

  const [isPinned, setIsPinned] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sidebar:pinned") === "true";
  });

  const [isHovered, setIsHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isExpanded = isPinned || isHovered;

  useEffect(() => {
    setExpanded(isExpanded);
  }, [isExpanded, setExpanded]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <>
      <aside
        onMouseEnter={() => !mobileOpen && setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setSettingsOpen(false);
        }}
        className={clsx(
          "fixed top-0 left-0 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-40",
          isExpanded ? "w-64" : "w-16",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16">
          {isExpanded && (
            <h1 className="text-lg font-bold text-indigo-600">
              KAM Ticket
            </h1>
          )}

          <button
            onClick={() => {
              setIsPinned((prev) => {
                const next = !prev;
                localStorage.setItem("sidebar:pinned", String(next));
                return next;
              });
            }}
            className="p-2 rounded-md hover:bg-gray-100 hidden md:block"
          >
            <Menu size={20} />
          </button>

          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-md hover:bg-gray-100 md:hidden"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-2 mt-4">
          {items.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  "group relative flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  active
                    ? "bg-indigo-100 text-indigo-700 font-semibold"
                    : "text-gray-700 hover:bg-indigo-50"
                )}
              >
                {item.icon}
                {isExpanded && <span>{item.title}</span>}

                {!isExpanded && (
                  <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none">
                    {item.title}
                  </span>
                )}
              </Link>
            );
          })}

          {/* SETTINGS DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setSettingsOpen((p) => !p)}
              className={clsx(
                "group flex w-full items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-indigo-50 transition",
                settingsOpen && "bg-indigo-50"
              )}
            >
              <Settings size={20} />
              {isExpanded && <span>Settings</span>}
            </button>

            {settingsOpen && (
              <div
                className={clsx(
                  "absolute left-full top-0 ml-2 w-40 rounded-md border bg-white shadow-md z-50",
                  isExpanded && "left-0 ml-0 mt-2"
                )}
              >
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
        />
      )}

      {/* Mobile open */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-20 p-2 rounded-md bg-white shadow md:hidden"
      >
        <Menu size={20} />
      </button>
    </>
  );
};
