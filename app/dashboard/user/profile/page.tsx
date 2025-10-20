import { SectionHeading } from "@/components/SectionHeading";

export default function UserProfile() {
  return (
    <div className="p-6 w-full">
      <SectionHeading title="Profile Settings" subtitle="Manage your account information" />

      <form className="max-w-lg space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input type="text" className="w-full border rounded-lg px-3 py-2" defaultValue="Daniel Essel" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" className="w-full border rounded-lg px-3 py-2" defaultValue="daniel@example.com" />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Update</button>
      </form>
    </div>
  );
}
