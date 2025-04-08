import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const TaskProgressBar = ({ status, percentage, taskStatus }) => {
  const getStatusColorClass = () => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-600';
      case 'FAILED':
        return 'bg-red-600';
      case 'IN_PROGRESS':
        return 'bg-blue-600';
      default:
        return 'bg-yellow-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'IN_PROGRESS':
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  // Calculate how many tasks of each status
  const pendingTasks = taskStatus?.PENDING || 0;
  const inProgressTasks = taskStatus?.IN_PROGRESS || 0;
  const completedTasks = taskStatus?.COMPLETED || 0;
  const failedTasks = taskStatus?.FAILED || 0;
  const totalTasks = pendingTasks + inProgressTasks + completedTasks + failedTasks;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          {getStatusIcon()}
          <span className="ml-2 font-medium text-sm text-gray-700 dark:text-gray-300">
            {status}
          </span>
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {Math.round(percentage)}%
        </span>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-3">
        <div
          className={`${getStatusColorClass()} h-2.5 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex space-x-2">
          {completedTasks > 0 && (
            <span className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
              Completed: {completedTasks}
            </span>
          )}
          {inProgressTasks > 0 && (
            <span className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-blue-500 mr-1"></span>
              In Progress: {inProgressTasks}
            </span>
          )}
          {pendingTasks > 0 && (
            <span className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-yellow-500 mr-1"></span>
              Pending: {pendingTasks}
            </span>
          )}
          {failedTasks > 0 && (
            <span className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-red-500 mr-1"></span>
              Failed: {failedTasks}
            </span>
          )}
        </div>
        <div>Total: {totalTasks}</div>
      </div>
    </div>
  );
};

export default TaskProgressBar;
