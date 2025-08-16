"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { QuizCategory, QuizQuestion } from "@/types/quiz";
import QuestionList from "@/components/QuestionList";

export default function CategoryQuizPage() {
  const { categoryId } = useParams();
  const [category, setCategory] = useState<QuizCategory | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryAndQuestions = async () => {
      if (!categoryId) return;

      // 1. Get the category
      const { data: cat, error: catError } = await supabase
        .from("quiz_categories")
        .select("*")
        .eq("id", categoryId)
        .single();

      if (catError) {
        console.error("Error fetching category:", catError);
        setLoading(false);
        return;
      }
      setCategory(cat);

      // 2. Get the questions
      const { data: qs, error: qError } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("category_id", categoryId);

      if (qError) {
        console.error("Error fetching questions:", qError);
        setLoading(false);
        return;
      }

      // Safely handle options
      const formatted = (qs || []).map((q) => ({
        ...q,
        options: Array.isArray(q.options)
          ? q.options
          : typeof q.options === "string"
          ? q.options.split(",") // split by comma for plain text
          : [],
        correct_answer: q.correct_answer || null, // avoid undefined
      }));

      

      setQuestions(formatted);
      setLoading(false);
    };

    fetchCategoryAndQuestions();
  }, [categoryId]);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!category) {
    return (
      <div className="p-8 text-center">
        <p>Category not found.</p>
        <Link href="/">
          <Button className="mt-4">Go back</Button>
        </Link>
      </div>
    );
  }

  console.log("Category:", category);
  console.log("Questions:", questions);
  return (
    <main className="container mx-auto py-10 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-4"
      >
        <Link href="/home" passHref>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{category.name}</h1>
      </motion.div>

      <QuestionList questions={questions} />
    </main>
  );
}
