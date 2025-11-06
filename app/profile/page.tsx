"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User, Mail, Phone } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ✅ Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/auth/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch profile");
        }

        setUser({
          firstName: data.data.firstName || "",
          lastName: data.data.lastName || "",
          email: data.data.email || "",
          phone: data.data.phone || "",
        });
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  // ✅ Handle field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // ✅ Update user profile
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update profile");
      }

      setMessage("Profile updated successfully ✅");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-600 text-lg font-medium">
        Loading your profile...
      </div>
    );

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-xl border border-blue-100 rounded-2xl overflow-hidden">
        <CardHeader className="bg-blue-600 text-white py-8">
          <div className="flex flex-col items-center space-y-3">
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md">
              <Image
                src="/user-avatar.png"
                alt="User Avatar"
                fill
                className="object-cover"
              />
            </div>
            <CardTitle className="text-2xl font-semibold">
              {user.firstName} {user.lastName}
            </CardTitle>
            <p className="text-blue-100 text-sm">Manage your personal details</p>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                First Name
              </label>
              <Input
                name="firstName"
                value={user.firstName}
                onChange={handleChange}
                className="mt-1 py-5 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Last Name
              </label>
              <Input
                name="lastName"
                value={user.lastName}
                onChange={handleChange}
                className="mt-1 py-5 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                Email
              </label>
              <Input
                name="email"
                type="email"
                value={user.email}
                onChange={handleChange}
                disabled
                className="mt-1 py-5 border-2 border-gray-200 rounded-xl bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                Phone
              </label>
              <Input
                name="phone"
                type="tel"
                value={user.phone}
                onChange={handleChange}
                className="mt-1 py-5 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
              />
            </div>
          </div>

          {/* Messages */}
          {message && (
            <p className="text-green-600 text-sm font-medium text-center">
              {message}
            </p>
          )}
          {error && (
            <p className="text-red-600 text-sm font-medium text-center">
              {error}
            </p>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-5 font-semibold rounded-xl shadow-md hover:shadow-lg"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex-1 border-2 border-blue-600 text-blue-700 hover:bg-blue-50 py-5 font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}