"use client";

import { useSidebar } from "@/context/SidebarContext";
import { Navbar } from "@/components/ui/Navbar";
import { Sidebar } from "@/components/ui/Sidebar";
import { Toaster } from "react-hot-toast";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded } = useSidebar();

  return (
    <>
      <Sidebar />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isExpanded ? "pl-64" : "pl-16"
        }`}
      >
        <Navbar />
        <main className="p-6 min-h-screen">{children}</main>
      </div>

      {/* Toast notifications */}
      <Toaster position="top-right" />
    </>
  );
}
