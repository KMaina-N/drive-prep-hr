export interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  type: 'multiple-choice' | 'input';
  options?: string[];
  correct_answer: string | number;
  image?: string;
  explanation?: string;
}

export interface QuizCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  questionCount: number;
}

export interface QuizProgress {
  categoryId: string;
  questionsAnswered: number;
  correctAnswers: number;
  lastAttempted: Date;
}

export interface UserStats {
  totalQuestions: number;
  correctAnswers: number;
  averageScore: number;
  categoriesCompleted: string[];
}