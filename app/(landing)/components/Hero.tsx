"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-white via-gray-50 to-gray-100 min-h-screen flex flex-col lg:flex-row items-center justify-between px-6 sm:px-12 lg:px-24 py-16 overflow-hidden">
      
      {/* Left: Text + Buttons */}
      <div className="z-10 max-w-xl lg:max-w-lg text-center lg:text-left">
        <motion.h1
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
        >
          🚗 Master Your Driving Test{" "}
          <span className="text-primary">Smarter & Faster</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-base sm:text-lg text-gray-600 mb-8"
        >
          Practice real exam questions, track your progress, and learn with AI-powered explanations. Get ready to pass with confidence!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-wrap justify-center lg:justify-start gap-4"
        >
          <Link href="/home">
            <button className="bg-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold shadow-lg hover:scale-105 transition-transform">
              Start Practicing
            </button>
          </Link>
          <Link href="#how-it-works">
            <button className="border border-primary text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-primary hover:text-white transition">
              Learn More
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Right: Illustration / Mockup */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="relative w-full lg:w-1/2 mt-12 lg:mt-0 flex justify-center"
      >
        <div className="relative w-[320px] h-[260px] sm:w-[420px] sm:h-[360px] lg:w-[600px] lg:h-[500px]">
          <Image
            src="/assets/hero-dashboard.png"
            // src={`/assets/bmw.jpg`}
            alt="App dashboard preview"
            fill
            priority
            className="object-contain"
          />
        </div>

        {/* Floating feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 120 }}
          className="absolute top-4 sm:top-10 left-4 sm:left-10 bg-white p-3 sm:p-4 rounded-xl shadow-lg w-32 sm:w-36 text-xs sm:text-sm"
        >
          ✅ AI-Powered Explanations
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 120 }}
          className="absolute bottom-6 sm:bottom-10 right-6 sm:right-20 bg-white p-3 sm:p-4 rounded-xl shadow-lg w-32 sm:w-40 text-xs sm:text-sm"
        >
          📊 Track Your Progress
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, type: "spring", stiffness: 120 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-3 sm:p-4 rounded-xl shadow-lg w-36 sm:w-44 text-xs sm:text-sm"
        >
          🏆 Boost Confidence
        </motion.div>
      </motion.div>

      {/* Background shapes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute w-72 sm:w-96 h-72 sm:h-96 bg-purple-200/20 rounded-full -top-20 -left-20"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
          className="absolute w-60 sm:w-72 h-60 sm:h-72 bg-blue-200/20 rounded-full -bottom-16 -right-16"
        />
      </div>
    </section>
  );
}
