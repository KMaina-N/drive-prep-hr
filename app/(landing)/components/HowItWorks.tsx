"use client";

import { motion } from "framer-motion";

const steps = [
  { step: "1", title: "Select a Category", text: "Pick the topic you want to focus on and start your journey." },
  { step: "2", title: "Answer Questions", text: "Choose your answers and get instant feedback with AI explanations." },
  { step: "3", title: "Track Progress", text: "Monitor your improvement and get ready to ace the real test." }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-6 lg:px-32 bg-gray-50">
      <h2 className="text-4xl font-bold text-center mb-12">⚡ How It Works</h2>
      <div className="grid sm:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {steps.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            viewport={{ once: true }}
            className="text-center p-8 rounded-lg bg-white shadow hover:shadow-lg transition"
          >
            <div className="text-4xl font-bold text-primary mb-2">{item.step}</div>
            <h3 className="font-semibold text-xl">{item.title}</h3>
            <p className="text-gray-600 mt-2">{item.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
