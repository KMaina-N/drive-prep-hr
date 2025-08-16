import Image from "next/image";
import Link from "next/link";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import HowItWorks from "./components/HowItWorks";
import CTA from "./components/CTA";
import Testimonials from "./components/Testimonials";

export default function LandingPage() {
  return (
    <main className="overflow-x-hidden">
      <Hero />
      <Categories />
      <HowItWorks />
      <Testimonials />
      <CTA />
    </main>
  );
}
