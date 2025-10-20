export default function AdminCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <h2 className="font-semibold text-lg mb-2">{title}</h2>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
