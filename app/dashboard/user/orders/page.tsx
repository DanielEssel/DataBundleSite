import { Card } from "@/components/Card";
import { SectionHeading } from "@/components/SectionHeading";

export default function UserOrders() {
  return (
    <div className="p-6 w-full">
      <SectionHeading title="My Orders" subtitle="Track your previous data purchases" />
      <div className="grid md:grid-cols-2 gap-6">
        <Card title="MTN 2GB" description="Purchased on Oct 10, 2025">
          <p>Status: <span className="text-green-600 font-medium">Delivered</span></p>
        </Card>
        <Card title="Vodafone 5GB" description="Purchased on Oct 8, 2025">
          <p>Status: <span className="text-yellow-600 font-medium">Pending</span></p>
        </Card>
      </div>
    </div>
  );
}
