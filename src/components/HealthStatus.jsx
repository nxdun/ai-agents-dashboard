import { useState, useEffect } from 'react';
import { getHealthStatus } from '../services/api';
import { CheckCircleIcon, XCircleIcon, AlertTriangleIcon } from 'lucide-react';

const HealthStatus = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHealthStatus = async () => {
      try {
        setLoading(true);
        const data = await getHealthStatus();
        setHealthData(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch health status');
      } finally {
        setLoading(false);
      }
    };

    fetchHealthStatus();
    
    // Refresh health status every 30 seconds
    const intervalId = setInterval(fetchHealthStatus, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const getStatusIcon = (status) => {
    if (status === 'healthy') {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    } else if (status === 'degraded') {
      return <AlertTriangleIcon className="h-5 w-5 text-yellow-500" />;
    } else {
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status) => {
    let colorClass = '';
    
    switch (status) {
      case 'healthy':
        colorClass = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        break;
      case 'degraded':
        colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        break;
      default:
        colorClass = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-soft-xl rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Health</h3>
        </div>
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-soft-xl rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Health</h3>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md">
          <div className="flex items-start">
            <XCircleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-red-700 dark:text-red-400">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!healthData) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-soft-xl rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Health</h3>
        </div>
        <div className="text-gray-500 dark:text-gray-400">No health data available.</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-soft-xl rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Health</h3>
        <div className="flex items-center space-x-2">
          {getStatusBadge(healthData.status)}
          {healthData.version && (
            <span className="text-xs text-gray-500 dark:text-gray-400">v{healthData.version}</span>
          )}
        </div>
      </div>

      {healthData.component_status && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Components</h4>
          <div className="space-y-2">
            {Object.entries(healthData.component_status).map(([component, status]) => {
              // Check if the status contains error message
              const isFullMessage = typeof status === 'string' && status.includes(':');
              let statusText = status;
              let statusValue = 'unhealthy';
              
              if (isFullMessage) {
                statusValue = status.split(':')[0].trim();
                statusText = status.split(':')[1].trim();
              } else {
                statusValue = status;
                statusText = status;
              }
              
              return (
                <div key={component} className="flex items-start justify-between p-2 border border-gray-100 dark:border-gray-700 rounded-md">
                  <div className="flex items-center">
                    <span className="w-6 h-6 flex items-center justify-center mr-2">
                      {getStatusIcon(statusValue)}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {component.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div>
                    {isFullMessage ? (
                      <div className="text-sm text-right">
                        <div className="text-gray-500 dark:text-gray-400">
                          {getStatusBadge(statusValue)}
                        </div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate" title={statusText}>
                          {statusText}
                        </div>
                      </div>
                    ) : (
                      getStatusBadge(statusValue)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthStatus;
