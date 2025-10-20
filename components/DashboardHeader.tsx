interface DashboardHeaderProps {
  title: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export default function DashboardHeader({ title, buttonText, onButtonClick }: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {buttonText && (
        <button
          onClick={onButtonClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}
