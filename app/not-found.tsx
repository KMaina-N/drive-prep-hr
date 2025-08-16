"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-700 flex flex-col items-center justify-center">
      
      {/* Background layers for parallax */}
      <motion.div
        animate={{ x: ["0%", "-100%"] }}
        transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
        className="absolute top-0 left-0 w-[200%] h-full bg-[url('/clouds.png')] bg-repeat-x opacity-30"
      />
      <motion.div
        animate={{ x: ["0%", "-100%"] }}
        transition={{ repeat: Infinity, duration: 120, ease: "linear" }}
        className="absolute top-10 left-0 w-[200%] h-full bg-[url('/city.png')] bg-repeat-x opacity-20"
      />

      {/* Glowing 404 text */}
      <motion.h1
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-[10rem] lg:text-[15rem] font-extrabold text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.7)] animate-pulse"
      >
        404
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="text-xl lg:text-3xl text-white/90 mb-8 text-center max-w-xl"
      >
        The page you’re looking for is lost in traffic. Let’s get you back on the road.
      </motion.p>

      {/* CTA Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link
          href="/"
          className="relative bg-white text-purple-800 font-bold py-3 px-8 rounded-lg shadow-xl hover:shadow-2xl transition-transform"
        >
          Back to Home
        </Link>
      </motion.div>

      {/* Road + car */}
      <div className="absolute bottom-0 w-full h-48 overflow-hidden">
        {/* Road */}
        {/* <motion.div
          animate={{ x: ["0%", "-100%"] }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="absolute bottom-0 w-[200%] h-16 bg-gray-800 flex"
        >
          <div className="w-1/2 h-full bg-gray-800 border-t-4 border-dashed border-white/50"></div>
          <div className="w-1/2 h-full bg-gray-800 border-t-4 border-dashed border-white/50"></div>
        </motion.div> */}

        {/* Car */}
        {/* <motion.div
          animate={{ x: ["-20%", "120%"] }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
          className="absolute bottom-4 w-20 h-10"
        >
          <svg viewBox="0 0 64 32" className="w-full h-full">
            <rect width="64" height="16" rx="3" fill="#fff" />
            <circle cx="16" cy="16" r="4" fill="#333" />
            <circle cx="48" cy="16" r="4" fill="#333" />
          </svg>
        </motion.div> */}
      </div>

    </main>
  );
}
