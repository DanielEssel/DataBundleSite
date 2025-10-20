import { SectionHeading } from "@/components/SectionHeading";
import { Card } from "@/components/Card";

export default function AdminOrders() {
  return (
    <div className="p-6 w-full">
      <SectionHeading title="All Orders" subtitle="View and manage all customer transactions" />
      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Order #001" description="User: John Doe">
          <p>Network: MTN 5GB</p>
          <p>Status: <span className="text-yellow-600 font-medium">Pending</span></p>
        </Card>
        <Card title="Order #002" description="User: Sarah Owusu">
          <p>Network: Vodafone 3GB</p>
          <p>Status: <span className="text-green-600 font-medium">Delivered</span></p>
        </Card>
      </div>
    </div>
  );
}
