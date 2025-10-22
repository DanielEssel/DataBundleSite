"use client";

import { Facebook, Instagram, Twitter, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-blue-600 text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center md:text-left">
        {/* Brand Section */}
        <div>
          <h2 className="text-3xl font-bold tracking-wide">AcDataHub</h2>
          <p className="text-blue-100 mt-3 text-sm leading-relaxed">
            Fast & reliable data bundle delivery — MTN, Vodafone & AirtelTigo.
            Get connected instantly, anywhere in Ghana.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <a href="/about" className="text-blue-100 hover:text-white transition">
                About Us
              </a>
            </li>
            <li>
              <a href="/contact" className="text-blue-100 hover:text-white transition">
                Contact
              </a>
            </li>
            <li>
              <a href="/faq" className="text-blue-100 hover:text-white transition">
                FAQs
              </a>
            </li>
          </ul>
        </div>

        {/* Contact / Socials */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Connect With Us</h3>
          <div className="flex justify-center md:justify-start gap-4 mb-4">
            <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="mailto:support@acdatahub.com" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
              <Mail className="w-5 h-5" />
            </a>
          </div>
          <p className="text-blue-100 text-sm">
            support@acdatahub.com  
            <br />
            (+233) 055 742 4675
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/20 mt-10 pt-4 text-center text-blue-100 text-sm">
        © {new Date().getFullYear()} <span className="font-semibold text-white">AcDataHub</span>. All rights reserved.
      </div>
    </footer>
  );
}
