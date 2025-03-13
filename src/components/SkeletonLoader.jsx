import React from 'react';

/**
 * A reusable skeleton loader component with configurable appearance
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.type - The type of skeleton (text, circle, rect)
 * @param {number} props.width - Width of the skeleton (rem units)
 * @param {number} props.height - Height of the skeleton (rem units)
 * @param {number} props.count - Number of skeleton lines to render
 * @returns {React.ReactElement} A skeleton loader component
 */
const SkeletonLoader = ({ 
  className = '', 
  type = 'rect', 
  width, 
  height, 
  count = 1,
  animated = true,
  rounded = 'md',
  delay = 0
}) => {
  const baseClass = "bg-gray-200 dark:bg-gray-700";
  const animationClass = animated ? "animate-pulse" : "";
  
  // Determine rounded corners
  const roundedClass = {
    'none': '',
    'sm': 'rounded-sm',
    'md': 'rounded-md',
    'lg': 'rounded-lg',
    'full': 'rounded-full',
  }[rounded] || 'rounded-md';
  
  // Inline styles for dimensions
  const style = {
    width: width ? `${width}rem` : '100%',
    height: height ? `${height}rem` : type === 'text' ? '1rem' : '4rem',
    animationDelay: delay ? `${delay}ms` : '0ms'
  };
  
  // Render multiple skeleton items if count > 1
  if (count > 1) {
    return (
      <div className="space-y-2">
        {[...Array(count)].map((_, index) => (
          <div
            key={index}
            className={`${baseClass} ${animationClass} ${roundedClass} ${className}`}
            style={{...style, animationDelay: `${delay + (index * 100)}ms`}}
          />
        ))}
      </div>
    );
  }
  
  // For circle type, force equal width and height and rounded-full
  if (type === 'circle') {
    const size = width || height || 3; // default 3rem diameter
    style.width = `${size}rem`;
    style.height = `${size}rem`;
    return (
      <div
        className={`${baseClass} ${animationClass} rounded-full ${className}`}
        style={style}
      />
    );
  }
  
  // Default rectangle or text skeleton
  return (
    <div
      className={`${baseClass} ${animationClass} ${roundedClass} ${className}`}
      style={style}
    />
  );
};

export default SkeletonLoader;
