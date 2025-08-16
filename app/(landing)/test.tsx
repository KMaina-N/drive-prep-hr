import { ReactNode } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ace Your Driving Test | AI-Powered Practice",
  description: "Practice real-world driving test questions, get instant AI feedback, and pass your driving test with confidence.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
