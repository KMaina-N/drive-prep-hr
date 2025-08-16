"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="py-20 px-6 lg:px-32 bg-gradient-to-r from-primary to-purple-600 text-white text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold mb-4"
      >
        Ready to Pass Your Test?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="text-lg text-white/90 mb-8 max-w-2xl mx-auto"
      >
        Join thousands of learners who are already practicing smarter.
      </motion.p>
      <Link href="/quiz">
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="bg-white text-primary px-10 py-5 rounded-lg font-semibold shadow-lg hover:bg-gray-100 transition"
        >
          🚀 Start Quiz Now
        </motion.button>
      </Link>
    </section>
  );
}
