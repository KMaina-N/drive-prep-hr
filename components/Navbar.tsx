"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="w-full py-6 px-8 lg:px-32 flex justify-between items-center bg-white shadow-md sticky top-0 z-50">
      <Link href="/">
        <span className="text-2xl font-bold text-primary cursor-pointer">DrivePrep</span>
      </Link>

      <ul className="hidden md:flex gap-8 text-gray-700 font-semibold">
        <li>
          <Link href="#features" className="hover:text-primary transition">Features</Link>
        </li>
        <li>
          <Link href="#dashboard" className="hover:text-primary transition">Dashboard</Link>
        </li>
        <li>
          <Link href="#pricing" className="hover:text-primary transition">Pricing</Link>
        </li>
        <li>
          <Link href="#contact" className="hover:text-primary transition">Contact</Link>
        </li>
      </ul>

      <div className="flex items-center gap-4">
        <Link href="/signup">
          <button className="bg-primary text-white px-6 py-2 rounded-lg hover:scale-105 transition-transform">
            Sign Up
          </button>
        </Link>
        <button className="md:hidden">
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </nav>
  );
}
