import React from 'react';
import { CheckCircleIcon, CircleIcon, ClockIcon, XCircleIcon } from 'lucide-react';

const WorkflowStepProgress = ({ steps, currentStep }) => {
  // Map status to icon and color
  const getStepStatus = (index) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'active':
        return <ClockIcon className="h-6 w-6 text-blue-500 animate-pulse" />;
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      default:
        return <CircleIcon className="h-6 w-6 text-gray-400" />;
    }
  };

  return (
    <div className="py-4">
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const status = step.status || getStepStatus(index);
          const isActive = status === 'active';
          const isCompleted = status === 'completed';
          const isError = status === 'error';
          
          return (
            <li 
              key={index} 
              className={`flex w-full items-center ${
                index !== steps.length - 1 ? 'after:content-[""] after:w-full after:h-1 after:border-b after:border-gray-300 dark:after:border-gray-700 after:mx-4' : ''
              } transition-opacity duration-300 ${isActive ? 'animate-pulse-slow' : ''}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col items-center">
                <div className={`flex items-center justify-center transition-all duration-300 p-0.5 rounded-full ${
                  isActive ? 'bg-blue-100 dark:bg-blue-800/30 scale-110' : 
                  isCompleted ? 'bg-green-100 dark:bg-green-800/30' : 
                  isError ? 'bg-red-100 dark:bg-red-800/30' : ''
                }`}>
                  {getStatusIcon(status)}
                </div>
                <span className={`text-xs mt-2 font-medium transition-colors ${
                  isActive ? 'text-blue-700 dark:text-blue-300' :
                  isCompleted ? 'text-green-600 dark:text-green-400' :
                  isError ? 'text-red-600 dark:text-red-400' :
                  'text-gray-700 dark:text-gray-300'
                }`}>
                  {step.name}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default WorkflowStepProgress;
