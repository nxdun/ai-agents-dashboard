import { useState, useEffect } from 'react';
import { getHealthStatus } from '../services/api';
import { CheckCircleIcon, XCircleIcon, AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';

const Health = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const data = await getHealthStatus();
      setHealthData(data);
      setError(null);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err.message || 'Failed to fetch health status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    
    // Refresh health data every minute
    const interval = setInterval(fetchHealthData, 60000);
    
    return () => clearInterval(interval);
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

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="px-6 py-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">System Health</h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Monitor the health and status of all system components</p>
        </div>
        <button
          onClick={fetchHealthData}
          disabled={loading}
          className={`mt-4 md:mt-0 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
            loading
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          <div className="flex items-center">
            <RefreshCwIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </div>
        </button>
      </div>

      {/* System Health Status Card */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div className="flex items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Status</h3>
            {healthData && (
              <div className="ml-3">
                {getStatusBadge(healthData.status)}
              </div>
            )}
          </div>
          
          <div className="mt-2 md:mt-0 text-sm text-gray-500 dark:text-gray-400">
            Last refreshed: {formatTime(lastRefreshed)}
            {healthData?.version && (
              <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                v{healthData.version}
              </span>
            )}
          </div>
        </div>

        {loading && !healthData ? (
          <div className="animate-pulse flex flex-col space-y-4 py-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md">
            <div className="flex">
              <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700 dark:text-red-400">{error}</span>
            </div>
          </div>
        ) : healthData ? (
          <div className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Component Status */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Component Status</h4>
                <div className="space-y-3">
                  {healthData.component_status && Object.entries(healthData.component_status).map(([component, status]) => {
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
                      <div key={component} className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700">
                              {getStatusIcon(statusValue)}
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-white capitalize">
                                {component.replace(/_/g, ' ')}
                              </h5>
                              <div className="mt-1">
                                {getStatusBadge(statusValue)}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {isFullMessage && (
                          <div className="mt-3 ml-11 text-sm text-gray-500 dark:text-gray-400 break-words">
                            {statusText}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* System Details */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">System Details</h4>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <p className="mt-1 font-medium text-gray-900 dark:text-white flex items-center">
                        {getStatusIcon(healthData.status)}
                        <span className="ml-2">{healthData.status}</span>
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Version</p>
                      <p className="mt-1 font-medium text-gray-900 dark:text-white">
                        {healthData.version || 'Unknown'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">API Endpoint</p>
                      <p className="mt-1 font-mono text-xs bg-gray-100 dark:bg-gray-600 p-2 rounded overflow-auto">
                        {import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1/'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 dark:text-gray-400 py-4">No health data available.</div>
        )}
      </div>
    </div>
  );
};

export default Health;
