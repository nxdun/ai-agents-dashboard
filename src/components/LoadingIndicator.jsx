import React, { useState, useEffect, useRef } from 'react';

/**
 * A loading indicator for the top of the page that shows progress
 * Used for page transitions and other loading states
 */
const LoadingIndicator = ({ isLoading, duration = 3000 }) => {
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const [slowProgress, setSlowProgress] = useState(false);
  const timersRef = useRef([]);
  
  // Clear all timers on unmount or when loading state changes
  const clearAllTimers = () => {
    if (timersRef.current.length > 0) {
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current = [];
    }
  };

  // Add a timer and store its ID
  const addTimer = (callback, delay) => {
    const timerId = setTimeout(callback, delay);
    timersRef.current.push(timerId);
    return timerId;
  };
  
  // Reset the component when loading is complete
  const completeAndReset = () => {
    setWidth(100); // First set to 100% to animate to completion
    
    // Then after completion animation, hide and reset
    addTimer(() => {
      setVisible(false);
      
      // Reset width after the bar is hidden
      addTimer(() => {
        setWidth(0);
        setSlowProgress(false);
      }, 300); // Wait for fade out transition
      
    }, 200); // Wait for completion animation
  };

  useEffect(() => {
    // Clean up timers on unmount
    return () => clearAllTimers();
  }, []);
  
  useEffect(() => {
    // Clear existing timers when loading state changes
    clearAllTimers();

    if (isLoading) {
      // Make indicator visible immediately when loading starts
      setVisible(true);
      setWidth(0);
      
      // Quick initial progress to 70%
      addTimer(() => {
        setWidth(70);
        
        // Then slow progress towards 90%
        setSlowProgress(true);
        
        // The rest of progress happens more slowly
        addTimer(() => {
          setWidth(90);
        }, duration * 0.6); // 60% of the duration to reach 90%
        
      }, 100);
    } else if (visible) {
      // When loading finishes, complete the progress bar and then hide it
      completeAndReset();
    }
  }, [isLoading, duration]);
  
  if (!visible) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 h-1.5 z-50">
      <div 
        className={`h-full bg-primary-500 ${slowProgress ? 'transition-all duration-1000 ease-out' : 'transition-all duration-300 ease-out'}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
};

export default LoadingIndicator;
