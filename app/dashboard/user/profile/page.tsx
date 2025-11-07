"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User, Mail, Phone, Shield, Calendar, CheckCircle, XCircle, MessageCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

interface UserProfile {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role?: string;
  isverified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  avatar?: string;
}

export default function UserProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.replace("/login");
      return;
    }
    fetchProfile(token);
  }, [router]);

  const fetchProfile = async (token: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setUser(data.data);
    } catch (err) {
      console.error(err);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading profile...</p>
        </div>
      </div>
    );

  if (!user) return null;

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-12">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            View and manage your account information
          </p>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* Profile Card */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-200">
            <div className="flex flex-col items-center text-center">
              {user.avatar ? (
                <div className="relative">
                  <Image
                    src={user.avatar}
                    alt={fullName}
                    width={120}
                    height={120}
                    className="rounded-full object-cover border-4 border-blue-100"
                  />
                  {user.isverified && (
                    <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1 border-2 border-white">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-3xl md:text-4xl font-bold shadow-lg">
                    {initials}
                  </div>
                  {user.isverified && (
                    <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1 border-2 border-white">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              )}
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mt-3">{fullName}</h2>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">{user.email}</p>

              <div className="w-full mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                {user.phone && (
                  <div className="flex items-center justify-center gap-2 text-gray-700 text-sm sm:text-base">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center justify-center gap-2 text-sm sm:text-base">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">{user.role || "User"}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm sm:text-base">
                  {user.isverified ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 font-medium">Verified Account</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-600 font-medium">Unverified</span>
                    </>
                  )}
                </div>
                {user.createdAt && (
                  <div className="flex items-center justify-center gap-2 text-gray-600 pt-2 border-t border-gray-100 text-xs sm:text-sm">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>
                      Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="w-full mt-4 sm:mt-6 flex flex-col gap-2">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-all shadow-sm text-sm sm:text-base">
                  Edit Profile
                </button>
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-all text-sm sm:text-base">
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-200">
            <h3 className="flex items-center gap-2 text-lg md:text-xl font-bold mb-4">
              <User className="w-5 h-5 text-blue-600" /> Account Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {[
                { label: "First Name", value: user.firstName },
                { label: "Last Name", value: user.lastName },
                { label: "Email", value: user.email, icon: <Mail className="w-4 h-4" /> },
                { label: "Phone Number", value: user.phone, icon: <Phone className="w-4 h-4" /> },
                { label: "Account Role", value: user.role, icon: <Shield className="w-4 h-4" /> },
                { label: "Verification Status", value: user.isverified ? "Verified" : "Not Verified", icon: user.isverified ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-amber-600" /> },
                { label: "Account Created", value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "—", icon: <Calendar className="w-4 h-4" /> },
                { label: "Last Updated", value: user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "—" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col space-y-1 p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm sm:text-base">
                  <span className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">{item.icon}{item.label}</span>
                  <span className="text-gray-900 font-medium">{item.value || "—"}</span>
                </div>
              ))}
            </div>

            {/* Security Notice */}
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm sm:text-base">
              <div className="flex items-start gap-2 sm:gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 text-sm sm:text-base">Account Security</h4>
                  <p className="text-blue-700 mt-1">Keep your account secure by using a strong password and enabling two-factor authentication.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-6 md:mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 border border-green-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-2 sm:gap-4">
              <div className="bg-green-500 p-2 sm:p-3 rounded-xl">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Need Help?</h3>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  Our support team is here to assist you with any questions or concerns.
                </p>
              </div>
            </div>
            <a
              href="https://wa.me/233557424675"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 sm:gap-3 bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-md transition-all font-medium whitespace-nowrap text-sm sm:text-base"
            >
              <FaWhatsapp className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Contact on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
