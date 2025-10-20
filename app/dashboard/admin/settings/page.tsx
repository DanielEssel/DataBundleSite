import { SectionHeading } from "@/components/SectionHeading";

export default function AdminSettings() {
  return (
    <div className="p-6 w-full">
      <SectionHeading title="Admin Settings" subtitle="Manage system configuration" />

      <form className="max-w-lg space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Default Data Provider</label>
          <select className="w-full border rounded-lg px-3 py-2">
            <option>MTN API</option>
            <option>Vodafone API</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notification Email</label>
          <input type="email" className="w-full border rounded-lg px-3 py-2" defaultValue="admin@example.com" />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Save Changes</button>
      </form>
    </div>
  );
}
