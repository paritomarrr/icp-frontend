
import { useState, useEffect } from 'react';
import { Sparkles, Loader, Brain, Target, Users, TrendingUp, CheckCircle, Zap, Globe, Building2, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingPageProps {
  onComplete?: () => void;
}

const LoadingPage = ({ onComplete }: LoadingPageProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentFact, setCurrentFact] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const steps = [
    {
      title: "Analyzing Company Profile",
      description: "Processing company website and market positioning",
      icon: Globe,
      duration: 3000,
      details: "Extracting company information, industry analysis, and competitive landscape"
    },
    {
      title: "Identifying Market Segments",
      description: "Mapping target customer segments and demographics",
      icon: Target,
      duration: 4000,
      details: "Analyzing customer data, firmographics, and market opportunities"
    },
    {
      title: "Creating Buyer Personas",
      description: "Building detailed decision-maker profiles",
      icon: Users,
      duration: 3500,
      details: "Defining roles, responsibilities, pain points, and buying criteria"
    },
    {
      title: "Analyzing Product Fit",
      description: "Evaluating product-market fit and use cases",
      icon: Building2,
      duration: 3000,
      details: "Mapping solutions to customer needs and value propositions"
    },
    {
      title: "Generating Strategic Insights",
      description: "Creating actionable recommendations and strategies",
      icon: BarChart3,
      duration: 2500,
      details: "Developing go-to-market strategies and qualification criteria"
    },
    {
      title: "Finalizing ICP Report",
      description: "Compiling comprehensive analysis and documentation",
      icon: Sparkles,
      duration: 2000,
      details: "Preparing detailed ICP report with actionable insights"
    }
  ];

  const facts = [
    "Companies with documented ICPs see 68% higher win rates than those without",
    "Account-based marketing increases deal size by 171% on average",
    "Targeted outbound campaigns have 5x better response rates than generic outreach",
    "B2B buyers research 70% of their buying journey independently before contacting sales",
    "Persona-driven campaigns have 3x higher conversion rates than generic messaging",
    "Data-driven segmentation improves marketing ROI by 200%",
    "Clear value propositions reduce sales objections by 40%",
    "Companies with clear ICPs see 2x faster sales cycles",
    "Personalized content generates 6x higher engagement rates",
    "Account-based marketing teams see 208% higher revenue from marketing"
  ];

  useEffect(() => {
    let currentStepIndex = 0;
    let stepStartTime = Date.now();

    const progressInterval = setInterval(() => {
      if (currentStepIndex < steps.length) {
        const step = steps[currentStepIndex];
        const stepProgress = (Date.now() - stepStartTime) / step.duration;
        
        if (stepProgress >= 1) {
          currentStepIndex++;
          setCurrentStep(currentStepIndex);
          if (currentStepIndex < steps.length) {
            stepStartTime = Date.now();
          }
        }
        
        const overallProgress = ((currentStepIndex + stepProgress) / steps.length) * 100;
        setProgress(Math.min(overallProgress, 100));
      } else {
        // All steps complete
        setIsComplete(true);
        setTimeout(() => {
          onComplete?.();
        }, 1000); // Brief pause to show completion
      }
    }, 100);

    // Rotate facts every 4 seconds
    const factInterval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % facts.length);
    }, 4000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(factInterval);
    };
  }, [onComplete]);

  const CurrentStepIcon = steps[currentStep]?.icon || Globe;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <Card className="w-full max-w-4xl shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
        <CardContent className="p-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-primary via-primary/80 to-primary/60 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                  <Sparkles className="w-12 h-12 text-primary-foreground" />
                </div>
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl font-bold text-foreground mb-4">
              {isComplete ? "ICP Analysis Complete!" : "Generating Your ICP Analysis"}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {isComplete 
                ? "Your comprehensive Ideal Customer Profile is ready for review"
                : "Creating a data-driven Ideal Customer Profile with AI-powered insights and strategic recommendations"
              }
            </p>
          </div>



          {/* Current Step */}
          {currentStep < steps.length && (
            <div className="bg-accent rounded-2xl p-8 mb-8 border border-border shadow-lg">
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                  <CurrentStepIcon className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {steps[currentStep].title}
                  </h3>
                  <p className="text-lg text-muted-foreground mb-3">{steps[currentStep].description}</p>
                  <p className="text-sm text-muted-foreground bg-background/50 rounded-lg p-3">
                    {steps[currentStep].details}
                  </p>
                </div>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Loader className="w-5 h-5 text-primary-foreground animate-spin" />
                </div>
              </div>
            </div>
          )}

          {/* Completed Steps */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-foreground mb-4">Completed Steps</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {steps.slice(0, currentStep).map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl border border-green-200 shadow-sm">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Industry Insights */}
          <div className="bg-gradient-to-r from-accent via-accent/80 to-accent/60 rounded-2xl p-8 border border-border shadow-lg">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-foreground mb-3">Industry Insight</h4>
                <p className="text-muted-foreground text-base leading-relaxed transition-all duration-700 ease-in-out">
                  {facts[currentFact]}
                </p>
              </div>
            </div>
            
            {/* Fact indicators */}
            <div className="flex justify-center mt-6 space-x-3">
              {facts.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-500 ${
                    index === currentFact 
                      ? 'bg-primary scale-150 shadow-lg' 
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Completion Message */}
          {isComplete && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-6 py-3 rounded-full">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Your ICP analysis is ready!</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingPage;
