export default function UserCard({ title, amount }: { title: string; amount: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <h2 className="font-semibold text-lg mb-2">{title}</h2>
      <p className="text-gray-500">{amount}</p>
    </div>
  );
}
