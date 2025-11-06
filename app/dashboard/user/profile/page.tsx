"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  createdAt?: string;
}

export default function UserProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/profile");
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12 text-gray-500">
        Failed to load profile. Please try again.
      </div>
    );
  }

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={user.name}
            width={100}
            height={100}
            className="rounded-full border object-cover"
          />
        ) : (
          <div className="w-24 h-24 flex items-center justify-center rounded-full bg-blue-600 text-white text-3xl font-semibold">
            {initials}
          </div>
        )}

        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-600">{user.email}</p>
          {user.phone && <p className="text-gray-600">{user.phone}</p>}

          {user.createdAt && (
            <p className="text-gray-400 text-sm mt-2">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      <hr className="my-6" />

      <div className="space-y-3 text-gray-700">
        <p>
          <span className="font-medium">Email:</span> {user.email}
        </p>
        {user.phone && (
          <p>
            <span className="font-medium">Phone:</span> {user.phone}
          </p>
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Edit Profile
        </button>
      </div>
    </div>
  );
}
