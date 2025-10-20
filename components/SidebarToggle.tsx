"use client";

interface SidebarToggleProps {
  onClick: () => void;
}

export default function SidebarToggle({ onClick }: SidebarToggleProps) {
  return (
    <button
      onClick={onClick}
      className="md:hidden inline-flex items-center justify-center p-2 rounded-lg bg-blue-600 text-white"
    >
      ☰
    </button>
  );
}
