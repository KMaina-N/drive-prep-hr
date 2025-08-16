"use client"

import QuestionCard from "./QuestionCard"
import { QuizQuestion } from "@/types/quiz"

export default function QuestionList({ questions }: { questions: QuizQuestion[] }) {
  if (!questions.length) {
    return (
      <p className="text-center text-muted-foreground mt-6">
        No questions found.
      </p>
    )
  }

  return (
    <div className="grid gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-3">
      {questions.map((q, index) => (
        <QuestionCard key={q.id} question={q} index={index} />
      ))}
    </div>
  )
}
