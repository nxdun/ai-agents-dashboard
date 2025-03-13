import React from 'react';

/**
 * A versatile loading spinner with various size and appearance options
 * @param {Object} props - Component props
 * @param {string} props.size - Size of spinner (sm, md, lg, xl)
 * @param {string} props.color - Color of spinner (primary, secondary, gray, white)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.label - Accessibility label
 * @returns {React.ReactElement} A loading spinner
 */
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  className = '',
  label = 'Loading...',
  showText = false,
  fullScreen = false
}) => {
  // Size maps
  const sizeClasses = {
    xs: 'h-3 w-3 border-[1.5px]',
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-[3px]',
    xl: 'h-16 w-16 border-4'
  };
  
  // Color maps
  const borderColors = {
    primary: 'border-primary-500',
    secondary: 'border-secondary-500',
    blue: 'border-blue-500',
    green: 'border-green-500',
    amber: 'border-amber-500',
    red: 'border-red-500',
    purple: 'border-purple-500',
    gray: 'border-gray-500',
    white: 'border-white',
  };
  
  const borderTopColors = {
    primary: 'border-t-transparent',
    secondary: 'border-t-transparent',
    blue: 'border-t-transparent',
    green: 'border-t-transparent',
    amber: 'border-t-transparent',
    red: 'border-t-transparent',
    purple: 'border-t-transparent',
    gray: 'border-t-transparent',
    white: 'border-t-transparent',
  };
  
  // Determine classes
  const spinnerSize = sizeClasses[size] || sizeClasses.md;
  const spinnerBorderColor = borderColors[color] || borderColors.primary;
  const spinnerBorderTopColor = borderTopColors[color] || borderTopColors.primary;
  
  // Full screen overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <div 
            className={`rounded-full border-2 ${spinnerBorderColor} ${spinnerBorderTopColor} animate-spin ${spinnerSize} ${className}`}
            role="status"
            aria-label={label}
          ></div>
          {showText && (
            <p className="mt-4 text-white font-medium">{label}</p>
          )}
        </div>
      </div>
    );
  }
  
  // Regular spinner
  return (
    <div className={`flex ${showText ? 'flex-col items-center' : ''}`}>
      <div 
        className={`rounded-full ${spinnerBorderColor} ${spinnerBorderTopColor} animate-spin ${spinnerSize} ${className}`}
        role="status"
        aria-label={label}
      ></div>
      {showText && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{label}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
