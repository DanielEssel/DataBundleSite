"use client";

import { useState, ReactNode } from "react";
import AdminSidebar from "./components/AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
}

export default function AdminLayout({ 
  children, 
  title = "Admin Dashboard",
  showHeader = true 
}: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        
        {/* Main Content */}
        <div className="flex-1">
          <main className="p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}