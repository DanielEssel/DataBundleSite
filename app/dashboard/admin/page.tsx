import DashboardShell from "@/components/DashboardShell";
import DashboardHeader from "@/components/DashboardHeader";
import AdminSidebar from "./components/AdminSidebar";
import AdminCard from "./components/AdminCard";

export default function AdminDashboard() {
  return (
    <DashboardShell
      sidebar={<AdminSidebar />}
      header={<DashboardHeader title="Admin Dashboard" buttonText="New Offer" />}
    >
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <AdminCard title="Total Orders" value="132" />
        <AdminCard title="Total Users" value="48" />
        <AdminCard title="Revenue" value="₵1,240" />
      </div>
    </DashboardShell>
  );
}
