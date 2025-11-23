import React from 'react';
import { Check } from 'lucide-react';

interface StepsProps {
  steps: string[];
  currentStep: number;
}

export const Steps: React.FC<StepsProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-primary-500 -z-10 transition-all duration-500 ease-in-out" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}></div>
        
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={index} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 bg-white
                  ${isCompleted ? 'bg-primary-500 border-primary-500 text-white' : ''}
                  ${isCurrent ? 'border-primary-500 text-primary-500' : 'border-gray-300 text-gray-400'}
                `}
              >
                {isCompleted ? <Check size={16} /> : <span className="text-sm font-bold">{index + 1}</span>}
              </div>
              <span className={`absolute mt-10 text-xs font-medium hidden md:block whitespace-nowrap ${isCurrent ? 'text-primary-600' : 'text-gray-500'}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
      <div className="md:hidden text-center mt-4 text-sm font-bold text-primary-700">
        {steps[currentStep]} ({currentStep + 1}/{steps.length})
      </div>
    </div>
  );
};