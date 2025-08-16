import data from "@/data/bank.json"

export type Question = {
  test: string
  category: string
  question: string
  options: string[]
  answer: string
}

export const getQuestions = (): Question[] => {
  return data as Question[]
}
