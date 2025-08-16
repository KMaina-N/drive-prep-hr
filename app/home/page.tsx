'use client'
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { categories } from '@/data/mockQuestions';
import { Users, BookOpen, Award, MessageCircle } from 'lucide-react';

import { useRouter } from 'next/navigation';
import { CategoryCard } from '@/components/CategoryCard';

const Index = () => {
  const router = useRouter();
  const [progress, setProgress] = useState<Record<string, any>>({});

  useEffect(() => {
    const savedProgress = JSON.parse(localStorage.getItem('quizProgress') || '{}');
    setProgress(savedProgress);
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    router.push(`/quiz/${categoryId}`);
  };

  const totalCompleted = Object.values(progress).reduce((acc: number, p: any) => acc + (p.completed || 0), 0);
  const totalCorrect = Object.values(progress).reduce((acc: number, p: any) => acc + (p.correct || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${"./assets/bmw.jpg"})` }}
        />
        <div className="relative container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            DriveTest <span className="text-primary">Pro</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Master your driving test with our comprehensive quiz platform. 
            Practice traffic rules, road signs, and driving scenarios with AI-powered explanations.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-4 py-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span>70+ Practice Questions</span>
            </div>
            <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-4 py-2">
              <Award className="w-4 h-4 text-accent" />
              <span>Detailed Explanations</span>
            </div>
            <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-4 py-2">
              <Users className="w-4 h-4 text-success" />
              <span>AI-Powered Help</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {totalCompleted > 0 && (
        <div className="container mx-auto px-4 -mt-8 relative z-10">
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary">{totalCompleted}</div>
                  <div className="text-muted-foreground">Questions Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-success">{totalCorrect}</div>
                  <div className="text-muted-foreground">Correct Answers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent">
                    {totalCompleted > 0 ? Math.round((totalCorrect / totalCompleted) * 100) : 0}%
                  </div>
                  <div className="text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Categories Section */}
      <div className="container mx-auto px-4 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Choose Your Category</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Each category contains questions tailored to specific driving topics. 
            Start with the one that interests you most!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
          {categories.map(category => (
            <CategoryCard
              key={category.id}
              category={category}
              onSelect={handleCategorySelect}
              progress={progress[category.id] ? {
                completed: progress[category.id].completed || 0,
                total: category.questionCount
              } : undefined}
            />
          ))}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="text-center p-6">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Connect with Instructors</h3>
            <p className="text-muted-foreground mb-4">
              Need personalized help? Connect with certified driving instructors for one-on-one guidance.
            </p>
            <Button variant="outline" className="w-full">
              Find an Instructor
            </Button>
          </Card>

          <Card className="text-center p-6">
            <div className="mx-auto w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Study Community</h3>
            <p className="text-muted-foreground mb-4">
              Join other driving students, share tips, and learn together in our supportive community.
            </p>
            <Button variant="outline" className="w-full">
              Join Community
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;