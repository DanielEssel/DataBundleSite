"use client";

import { useState } from "react";
import SidebarToggle from "./SidebarToggle";

interface DashboardShellProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
}

export default function DashboardShell({ sidebar, header, children }: DashboardShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed md:static z-40 w-64 h-screen bg-white border-r p-4 transition-transform ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {sidebar}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-white sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <SidebarToggle onClick={() => setOpen(!open)} />
            {header}
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
