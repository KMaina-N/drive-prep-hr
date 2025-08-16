"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/types/quiz";
import { AIExplainer } from "@/components/AIExplainer";

export default function QuestionCard({ question, index }: { question: QuizQuestion; index: number }) {
  const { type, options, correct_answer, image } = question;

  const [selected, setSelected] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showAI, setShowAI] = useState(false);

  const userAnswer = useMemo(() => {
    if (type === "input") return inputValue.trim();
    return selected.join(", ");
  }, [type, inputValue, selected]);

  const toggleOption = (opt: string) => {
    if (submitted) return;
    setSelected((prev) => (prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]));
  };

  const handleSubmit = () => {
    let correct = false;
    if (type === "multiple-choice") {
      correct = selected.length === 1 && selected[0] === String(correct_answer);
    } else {
      correct = String(inputValue).trim().toLowerCase() === String(correct_answer).toLowerCase();
    }
    setIsCorrect(correct);
    setSubmitted(true);
    if (correct) confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
  };

  const canSubmit =
    type === "multiple-choice" ? selected.length > 0 : inputValue.trim().length > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Card
        className={cn(
          "relative p-2 rounded-xl transition-all duration-300 border bg-card",
          submitted && isCorrect && "border-green-500 shadow-green-300/30",
          submitted && isCorrect === false && "border-red-500 animate-shake"
        )}
      >
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {index}. {question.question}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {image && (
            <div className="w-full overflow-hidden rounded-md border">
              <img src={image} alt="" className="w-full h-44 object-cover" />
            </div>
          )}

          {type === "multiple-choice" && (
            <div className="space-y-2">
              {options?.map((opt) => {
                const checked = selected.includes(opt);
                const isCorrectOpt = submitted && opt === String(correct_answer);
                const isWrongSelected = submitted && checked && opt !== String(correct_answer);

                return (
                  <motion.div
                    key={opt}
                    whileHover={!submitted ? { scale: 1.01 } : {}}
                    onClick={() => toggleOption(opt)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer select-none transition-all",
                      checked && "border-primary bg-muted/40",
                      isCorrectOpt && "bg-green-100 border-green-500",
                      isWrongSelected && "bg-red-100 border-red-500"
                    )}
                  >
                    <Checkbox checked={checked} onCheckedChange={() => toggleOption(opt)} disabled={submitted} />
                    <span className="text-sm">{opt}</span>
                  </motion.div>
                );
              })}
            </div>
          )}

          {type === "input" && (
            <Input
              placeholder="Type your answer..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={submitted}
            />
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            {!submitted && (
              <Button onClick={handleSubmit} disabled={!canSubmit} className="sm:w-auto w-full">
                Confirm Answer
              </Button>
            )}

            {submitted && (
              <>
                <Button variant="outline" className="sm:w-auto w-full" onClick={() => setShowAI(true)}>
                  Ask AI to explain
                </Button>
                <Button
                  variant="ghost"
                  className="sm:w-auto w-full"
                  onClick={() => {
                    setSelected([]);
                    setInputValue("");
                    setSubmitted(false);
                    setIsCorrect(null);
                  }}
                >
                  Try again
                </Button>
              </>
            )}
          </div>

          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "mt-2 text-sm font-medium",
                  isCorrect ? "text-green-600" : "text-red-600"
                )}
              >
                {isCorrect ? "🎉 Correct!" : `❌ Incorrect. Correct: ${String(correct_answer)}`}
                {question.explanation && (
                  <p className="mt-2 text-muted-foreground">{question.explanation}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <AIExplainer
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        question={question.question}
        userAnswer={userAnswer || "(no answer)"}
        correctAnswer={String(correct_answer)}
        explanation={question.explanation ?? "No extra explanation provided."}
        gotItRight={!!isCorrect}
      />
    </motion.div>
  );
}
