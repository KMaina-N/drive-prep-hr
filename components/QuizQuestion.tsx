import { useState } from 'react';
import { QuizQuestion as QuizQuestionType } from '@/types/quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AIExplainer } from '@/components/AIExplainer';
import { CheckCircle, XCircle, AlertCircle, Bot } from 'lucide-react';

interface QuizQuestionProps {
  question: QuizQuestionType;
  onAnswer: (questionId: string, answer: string | number, isCorrect: boolean) => void;
  questionNumber: number;
  totalQuestions: number;
}

export const QuizQuestion = ({ 
  question, 
  onAnswer, 
  questionNumber, 
  totalQuestions 
}: QuizQuestionProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [inputAnswer, setInputAnswer] = useState<string>('');
  const [answered, setAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showAIExplainer, setShowAIExplainer] = useState(false);

  const handleSubmit = () => {
    const answer = question.type === 'multiple-choice' ? selectedAnswer : inputAnswer;
    const isCorrect = question.type === 'multiple-choice' 
      ? answer === question.correct_answer
      : Number(answer) === question.correct_answer;
    
    setAnswered(true);
    setShowExplanation(true);
    onAnswer(question.id, answer, isCorrect);
  };

  const canSubmit = question.type === 'multiple-choice' 
    ? selectedAnswer !== ''
    : inputAnswer.trim() !== '';

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            Question {questionNumber} of {totalQuestions}
          </span>
          <div className="w-32 bg-secondary rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
        <CardTitle className="text-xl leading-relaxed">
          {question.question}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {question.image && (
          <div className="flex justify-center">
            <img 
              src={question.image} 
              alt="Question image" 
              className="max-w-sm rounded-lg border shadow-sm"
            />
          </div>
        )}
        
        {question.type === 'multiple-choice' ? (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <Button
                key={index}
                variant={selectedAnswer === option ? "default" : "outline"}
                className={`w-full justify-start text-left h-auto p-4 ${
                  answered
                    ? option === question.correct_answer
                      ? 'bg-success hover:bg-success text-success-foreground border-success'
                      : selectedAnswer === option && option !== question.correct_answer
                      ? 'bg-destructive hover:bg-destructive text-destructive-foreground border-destructive'
                      : ''
                    : selectedAnswer === option
                    ? 'bg-primary text-primary-foreground'
                    : ''
                }`}
                onClick={() => !answered && setSelectedAnswer(option)}
                disabled={answered}
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-semibold">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {answered && option === question.correct_answer && (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  {answered && selectedAnswer === option && option !== question.correct_answer && (
                    <XCircle className="w-5 h-5" />
                  )}
                </div>
              </Button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              type="number"
              placeholder="Enter your answer..."
              value={inputAnswer}
              onChange={(e) => setInputAnswer(e.target.value)}
              disabled={answered}
              className={`text-lg p-6 ${
                answered
                  ? Number(inputAnswer) === question.correct_answer
                    ? 'border-success bg-success/10'
                    : 'border-destructive bg-destructive/10'
                  : ''
              }`}
            />
            {answered && (
              <div className="flex items-center space-x-2 text-sm">
                {Number(inputAnswer) === question.correct_answer ? (
                  <CheckCircle className="w-4 h-4 text-success" />
                ) : (
                  <XCircle className="w-4 h-4 text-destructive" />
                )}
                <span>
                  Correct answer: {question.correct_answer}
                </span>
              </div>
            )}
          </div>
        )}
        
        {showExplanation && question.explanation && (
          <div className="mt-6 p-4 bg-accent/20 rounded-lg border border-accent/30">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-accent-foreground mb-1">Explanation:</h4>
                <p className="text-sm text-accent-foreground/80 mb-3">{question.explanation}</p>
                
                {/* Show AI button only for wrong answers */}
                {answered && (
                  (question.type === 'multiple-choice' ? selectedAnswer !== question.correct_answer : Number(inputAnswer) !== question.correct_answer)
                ) && (
                  <Button
                    onClick={() => setShowAIExplainer(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 border-primary/30"
                  >
                    <Bot className="w-4 h-4" />
                    Ask AI for more help
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {!answered && (
          <Button 
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground"
            size="lg"
          >
            Submit Answer
          </Button>
        )}
      </CardContent>
      
      <AIExplainer
        question={question.question}
        userAnswer={question.type === 'multiple-choice' ? selectedAnswer : inputAnswer}
        correctAnswer={question.correct_answer}
        explanation={question.explanation || ''}
        isOpen={showAIExplainer}
        onClose={() => setShowAIExplainer(false)}
      />
    </Card>
  );
};