"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();
  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <div className="flex-shrink-0">
            <Link href="/">
              <span className="text-2xl font-bold text-orange-500 cursor-pointer">
                StudyHub
              </span>
            </Link>
          </div>

          {/* Links */}
          <div className="flex space-x-4">
            <Link
              href="/"
              className="text-gray-700 hover:text-orange-500 font-medium"
            >
              Home
            </Link>

            {user && (
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-orange-500 font-medium"
              >
                Dashboard
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className="text-gray-700 hover:text-orange-500 font-medium"
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
