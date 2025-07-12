import React from 'react';
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepperProps {
  steps: {
    title: string;
    description?: string;
  }[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className
}) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center">
                <button
                  onClick={() => onStepClick?.(index)}
                  disabled={!onStepClick}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200",
                    isCompleted && "bg-blue-600 border-blue-600 text-white",
                    isCurrent && "bg-white border-blue-600 text-blue-600",
                    isUpcoming && "bg-gray-50 border-gray-300 text-gray-400",
                    onStepClick && "hover:scale-105 cursor-pointer",
                    !onStepClick && "cursor-default"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </button>
                <div className="mt-2 text-center">
                  <p className={cn(
                    "text-sm font-medium",
                    isCompleted && "text-blue-600",
                    isCurrent && "text-blue-600",
                    isUpcoming && "text-gray-500"
                  )}>
                    {step.title}
                  </p>
                  {step.description && (
                    <p className={cn(
                      "text-xs mt-1",
                      isCompleted && "text-blue-500",
                      isCurrent && "text-blue-500",
                      isUpcoming && "text-gray-400"
                    )}>
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-4 transition-all duration-200",
                  isCompleted ? "bg-blue-600" : "bg-gray-200"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}; 