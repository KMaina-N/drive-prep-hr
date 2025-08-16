import { QuizCategory } from '@/types/quiz';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, BookOpen } from 'lucide-react';

interface CategoryCardProps {
  category: QuizCategory;
  onSelect: (categoryId: string) => void;
  progress?: { completed: number; total: number };
}

export const CategoryCard = ({ category, onSelect, progress }: CategoryCardProps) => {
  const progressPercentage = progress ? (progress.completed / progress.total) * 100 : 0;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {category.name}
              </CardTitle>
              <CardDescription className="text-sm">
                {category.questionCount} questions
              </CardDescription>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-muted-foreground text-sm mb-4">
          {category.description}
        </p>
        
        {progress && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
        
        <Button 
          onClick={() => onSelect(category.id)}
          className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground"
        >
          Start Quiz
        </Button>
      </CardContent>
    </Card>
  );
};