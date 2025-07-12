
import { useState, useEffect } from 'react';
import { Sparkles, Loader } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingPageProps {
  onComplete?: () => void;
}

const LoadingPage = ({ onComplete }: LoadingPageProps) => {
  const [currentFact, setCurrentFact] = useState(0);

  const facts = [
    "70% of GTM teams don't document their ICP",
    "Companies with clear ICPs see 2x faster sales cycles",
    "Account-based marketing increases deal size by 171%",
    "Persona-driven campaigns have 3x higher conversion rates",
    "B2B buyers research 70% of their journey independently",
    "Targeted outbound has 5x better response rates",
    "Data-driven segmentation improves ROI by 200%",
    "Clear value props reduce sales objections by 40%"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % facts.length);
    }, 2000);

    // Simulate processing time
    const timeout = setTimeout(() => {
      onComplete?.();
    }, 12000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onComplete, facts.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-8">
      <Card className="w-full max-w-2xl shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Sparkles className="w-16 h-16 text-blue-600 animate-pulse" />
              <Loader className="w-8 h-8 text-indigo-600 absolute top-2 left-2 animate-spin" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            Generating Your ICP Analysis
          </h2>
          
          {/* <p className="text-slate-600 mb-8">
            Claude AI is analyzing your inputs and creating personalized insights...
          </p> */}
          
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">Did you know?</p>
                <p className="text-blue-700 text-left transition-all duration-500 ease-in-out">
                  {facts[currentFact]}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              {facts.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    index === currentFact ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingPage;
