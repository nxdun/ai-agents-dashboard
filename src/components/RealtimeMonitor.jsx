import { useEffect, useState, useRef } from 'react';
import { ClockIcon } from 'lucide-react';

const RealtimeMonitor = ({ workflowId, runData, logs = [] }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const logsEndRef = useRef(null);
  
  // Auto-scroll to bottom of logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);
  
  // Update elapsed time
  useEffect(() => {
    if (!runData || !runData.startTime) return;
    
    const timer = setInterval(() => {
      const elapsed = Math.floor((new Date() - new Date(runData.startTime)) / 1000);
      setElapsedTime(elapsed);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [runData]);
  
  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Format timestamp for logs
  const formatTimestamp = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  
  // Get color for log type
  const getLogTypeColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-500 dark:text-green-400';
      case 'error': return 'text-red-500 dark:text-red-400';
      case 'warning': return 'text-yellow-500 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-300';
    }
  };

  if (!runData) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-3 border-b border-blue-100 dark:border-blue-800 flex items-center justify-between">
        <div className="flex items-center">
          <ClockIcon className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Real-time Monitoring
          </h3>
        </div>
        <div className="text-sm text-blue-600 dark:text-blue-400">
          Elapsed: {formatTime(elapsedTime)}
        </div>
      </div>
      
      <div className="p-4">
        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{Math.round((runData.currentStep / (runData.maxSteps || 1)) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(runData.currentStep / (runData.maxSteps || 1)) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Logs */}
        <div className="mt-4">
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Activity Log</h4>
          <div className="bg-gray-50 dark:bg-gray-750 rounded border border-gray-200 dark:border-gray-700 h-48 overflow-y-auto p-2 text-sm">
            {logs.length > 0 ? (
              <div className="space-y-1">
                {logs.map((log, idx) => (
                  <div key={idx} className="flex">
                    <span className="text-gray-400 dark:text-gray-500 text-xs flex-shrink-0 w-16">
                      {formatTimestamp(log.time)}
                    </span>
                    <span className={`${getLogTypeColor(log.type)}`}>
                      {log.message}
                    </span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                No activity logged yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeMonitor;
