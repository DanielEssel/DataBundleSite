import { SectionHeading } from "@/components/SectionHeading";

export default function AdminUsers() {
  const users = [
    { name: "Daniel Essel", email: "daniel@example.com" },
    { name: "Kwame Asare", email: "kwame@example.com" },
  ];

  return (
    <div className="p-6 w-full">
      <SectionHeading title="Users" subtitle="List of registered customers" />
      <table className="w-full border text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, i) => (
            <tr key={i} className="border-t">
              <td className="p-3">{user.name}</td>
              <td className="p-3">{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
