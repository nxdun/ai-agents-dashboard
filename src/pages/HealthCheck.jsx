import { useState, useEffect } from 'react';
import { getHealthStatus } from '../services/api';
import { CheckCircleIcon, XCircleIcon, AlertTriangleIcon, RefreshCwIcon, ServerIcon, DatabaseIcon, NetworkIcon } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';

const HealthCheck = () => {
  const [health, setHealth] = useState({
    status: 'loading',
    services: {},
    message: 'Loading health status...'
  });
  const [loading, setLoading] = useState(true);
  const { darkMode } = useDarkMode();

  const fetchHealthStatus = async () => {
    setLoading(true);
    try {
      const data = await getHealthStatus();
      setHealth({
        status: data?.status || 'unknown',
        services: data?.services || {},
        message: data?.message || 'Health check completed'
      });
    } catch (error) {
      setHealth({
        status: 'error',
        services: {},
        message: `Error checking health: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'degraded':
        return <AlertTriangleIcon className="h-6 w-6 text-amber-500" />;
      case 'error':
      case 'unhealthy':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      default:
        return <RefreshCwIcon className={`h-6 w-6 text-gray-500 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />;
    }
  };

  const getServiceIcon = (service) => {
    const iconClass = "h-5 w-5 text-gray-400 dark:text-gray-500";
    
    if (service.toLowerCase().includes('server') || service.toLowerCase().includes('api')) {
      return <ServerIcon className={iconClass} />;
    } else if (service.toLowerCase().includes('database')) {
      return <DatabaseIcon className={iconClass} />;
    } else {
      return <NetworkIcon className={iconClass} />;
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'degraded':
        return 'bg-amber-50 dark:bg-amber-900/20';
      case 'error':
      case 'unhealthy':
        return 'bg-red-50 dark:bg-red-900/20';
      default:
        return 'bg-gray-50 dark:bg-gray-800';
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Unknown';
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">System Health</h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Check the health of all system components</p>
        </div>
        <button
          onClick={fetchHealthStatus}
          disabled={loading}
          className={`mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
        >
          <RefreshCwIcon className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">System Status</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">{health.message}</p>
          </div>
          <div className="flex items-center">
            {health.status === 'healthy' ? (
              <span className="flex items-center text-green-600 dark:text-green-400">
                <CheckCircleIcon className="h-6 w-6 mr-2" />
                Healthy
              </span>
            ) : health.status === 'degraded' ? (
              <span className="flex items-center text-amber-600 dark:text-amber-400">
                <AlertTriangleIcon className="h-6 w-6 mr-2" />
                Degraded
              </span>
            ) : health.status === 'error' || health.status === 'unhealthy' ? (
              <span className="flex items-center text-red-600 dark:text-red-400">
                <XCircleIcon className="h-6 w-6 mr-2" />
                Unhealthy
              </span>
            ) : (
              <span className="flex items-center text-gray-600 dark:text-gray-400">
                <RefreshCwIcon className={`h-6 w-6 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Checking...
              </span>
            )}
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          <dl>
            {Object.entries(health.services).map(([name, serviceHealth], index) => (
              <div key={name} className={`${index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-750' : 'bg-white dark:bg-gray-800'} px-4 py-5 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6`}>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  {getServiceIcon(name)}
                  <span className="ml-2">{name}</span>
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200 sm:col-span-2">
                  <div className={`px-3 py-2 rounded-md ${getStatusBgColor(serviceHealth.status)}`}>
                    {serviceHealth.message}
                  </div>
                  {serviceHealth.latency && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Latency: {serviceHealth.latency}
                    </p>
                  )}
                </dd>
                <dd className="mt-1 text-sm text-right">
                  <div className="flex items-center justify-end">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                      {serviceHealth.lastChecked && `Last checked: ${formatDate(serviceHealth.lastChecked)}`}
                    </span>
                    {getStatusIcon(serviceHealth.status)}
                  </div>
                </dd>
              </div>
            ))}
            {Object.keys(health.services).length === 0 && !loading && (
              <div className="bg-gray-50 dark:bg-gray-750 px-4 py-5 sm:px-6">
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm">No service details available</p>
              </div>
            )}
            {loading && (
              <div className="bg-gray-50 dark:bg-gray-750 px-4 py-5 sm:px-6">
                <div className="flex flex-col items-center">
                  <RefreshCwIcon className="h-8 w-8 text-blue-500 animate-spin mb-2" />
                  <p className="text-center text-gray-500 dark:text-gray-400 text-sm">Loading service status...</p>
                </div>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default HealthCheck;
