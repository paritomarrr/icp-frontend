import React from "react";

interface WizardStepperProps {
  steps: { label: string }[];
  current: number;
}

const WizardStepper: React.FC<WizardStepperProps> = ({ steps, current }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-2">
      {steps.map((step, idx) => (
        <div key={step.label} className="flex-1 flex flex-col items-center">
          <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${idx <= current ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-400'}`}>{idx + 1}</div>
          <span className={`mt-2 text-xs ${idx === current ? 'font-bold text-blue-700' : 'text-gray-400'}`}>{step.label}</span>
        </div>
      ))}
    </div>
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-2 bg-blue-600 rounded-full transition-all"
        style={{ width: `${((current + 1) / steps.length) * 100}%` }}
      />
    </div>
  </div>
);

export default WizardStepper; 