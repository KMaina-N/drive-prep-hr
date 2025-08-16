"use client";

import { motion } from "framer-motion";

const testimonials = [
  { name: "Alice", text: "This app helped me pass my test on the first try!" },
  { name: "Bob", text: "AI explanations are so clear and helpful!" },
  { name: "Carol", text: "I love tracking my progress and focusing on weak areas." }
];

export default function Testimonials() {
  return (
    <section className="py-20 px-6 lg:px-32 bg-white">
      <h2 className="text-4xl font-bold text-center mb-12">💬 What Our Learners Say</h2>
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-start">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            viewport={{ once: true }}
            className="bg-gray-50 p-6 rounded-xl shadow text-center flex-1"
          >
            <p className="text-gray-700 italic">"{t.text}"</p>
            <span className="mt-4 block font-semibold text-primary">— {t.name}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
