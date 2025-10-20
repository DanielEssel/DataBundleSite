import DashboardShell from "@/components/DashboardShell";
import DashboardHeader from "@/components/DashboardHeader";
import UserSidebar from "./components/UserSidebar";
import UserCard from "./components/UserCard";

export default function UserDashboard() {
  return (
    <DashboardShell
      sidebar={<UserSidebar />}
      header={<DashboardHeader title="Welcome Back 👋" buttonText="Buy Data" />}
    >
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <UserCard title="MTN Data" amount="1GB" />
        <UserCard title="Vodafone Data" amount="2GB" />
        <UserCard title="AirtelTigo Data" amount="5GB" />
      </div>
    </DashboardShell>
  );
}
