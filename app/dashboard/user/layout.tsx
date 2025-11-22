"use client";

import Sidebar from "@/app/dashboard/user/components/UserSidebar";
import Header from "@/app/dashboard/user/components/UserHeader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar - Fixed positioning on mobile, static on desktop */}
      <div className="fixed inset-y-0 left-0 z-40 lg:static lg:z-auto">
        <Sidebar />
      </div>

      {/* Main content area - Add left margin on desktop to account for sidebar */}
      <div className="flex flex-col flex-1 min-w-0 lg:ml-0">
        {/* Static Header */}
        <Header />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}