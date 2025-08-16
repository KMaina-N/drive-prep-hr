"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { categories } from "@/data/mockQuestions";

export default function Categories() {
  return (
    <section className="py-20 px-6 lg:px-32 bg-white">
      <h2 className="text-4xl font-bold text-center mb-4"><span>
        <Image src="/icons/study.png" alt="Category Icon" width={40} height={40} className="inline-block mr-2" />
        </span> Choose Your Category</h2>
      <p className="text-center text-gray-600 mb-12">Focus on specific topics to strengthen your knowledge.</p>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="bg-gray-50 rounded-xl p-6 flex flex-col items-center text-center hover:shadow-xl transition-all cursor-pointer"
          >
            <Image src={`/icons/${cat.icon}`} alt={cat.name} width={60} height={60} className="mb-4" />
            <h3 className="font-semibold text-lg">{cat.name}</h3>
            <p className="text-gray-600 mt-2">{cat.description}</p>
            <span className="mt-4 text-xs text-gray-500">{cat.questionCount} Questions</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
