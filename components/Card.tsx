interface CardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function Card({ title, description, children }: CardProps) {
  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && <p className="text-gray-500 mb-4">{description}</p>}
      {children}
    </div>
  );
}
