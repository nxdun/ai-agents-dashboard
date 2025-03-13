import { useState, useEffect } from 'react';
import { RefreshCwIcon, CheckCircleIcon, AlertTriangleIcon, XCircleIcon } from 'lucide-react';
import { getHealthStatus } from '../services/api';

const Health = () => {
  const [systemHealth, setSystemHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    try {
      setIsLoading(true);
      setRefreshing(true);
      const healthData = await getHealthStatus();
      setSystemHealth(healthData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch health data:', err);
      setError('Could not retrieve system health information');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'warning':
        return <AlertTriangleIcon className="h-6 w-6 text-amber-500" />;
      case 'critical':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      default:
        return <AlertTriangleIcon className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'warning':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20';
      case 'critical':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  // Sample metrics for UI display
  const metrics = [
    { name: 'API Response Time', value: systemHealth?.apiLatency || '?', unit: 'ms', threshold: 200 },
    { name: 'Active Agents', value: systemHealth?.activeAgents || 0, unit: '', threshold: null },
    { name: 'Failed Tasks', value: systemHealth?.failedTasks || 0, unit: '', threshold: 5 },
    { name: 'Uptime', value: systemHealth?.uptime || 0, unit: '%', threshold: 99 }
  ];

  // Sample system components for health display
  const components = [
    { name: 'API Server', status: 'healthy', lastChecked: '2 minutes ago' },
    { name: 'Database', status: 'healthy', lastChecked: '5 minutes ago' },
    { name: 'Model Service', status: 'healthy', lastChecked: '1 minute ago' },
    { name: 'Agent Manager', status: 'healthy', lastChecked: '3 minutes ago' },
    { name: 'Workflow Engine', status: systemHealth?.status === 'warning' ? 'warning' : 'healthy', lastChecked: '30 seconds ago' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">System Health</h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Monitor system performance and health indicators</p>
        </div>
        <button
          onClick={fetchHealthData}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md flex items-center text-sm font-medium transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow hover:shadow-lg"
          disabled={isLoading || refreshing}
        >
          <RefreshCwIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Status'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-md bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* System Status Overview */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 shadow-soft-xl rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Status</h3>
            
            {isLoading ? (
              <div className="animate-pulse flex flex-col items-center py-8">
                <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-16 w-16 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            ) : systemHealth ? (
              <div className="flex flex-col items-center">
                <div className={`rounded-full p-4 ${getStatusClass(systemHealth.status)} mb-4`}>
                  {getStatusIcon(systemHealth.status)}
                </div>
                <p className="text-lg font-semibold mb-1">
                  {systemHealth.status === 'healthy' ? 'All Systems Operational' :
                   systemHealth.status === 'warning' ? 'Performance Degradation Detected' : 
                   'Critical System Issues'}
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400">Last updated: Just now</div>
                
                <div className="w-full mt-6">
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block text-primary-600 dark:text-primary-400">
                          System Uptime
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-primary-600 dark:text-primary-400">
                          {systemHealth.uptime}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                      <div style={{ width: `${systemHealth.uptime}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all duration-500 ease-out"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No health data available</p>
              </div>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow-soft-xl rounded-lg p-6 border border-gray-200 dark:border-gray-700 mt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Key Metrics</h3>
            
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse flex justify-between">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {metrics.map((metric, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">{metric.name}</span>
                    <span className={`font-semibold ${
                      metric.threshold && metric.value > metric.threshold ? 'text-red-500' :
                      metric.threshold && metric.value < metric.threshold ? 'text-amber-500' :
                      'text-green-500'
                    }`}>
                      {metric.value}{metric.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Component Status */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 shadow-soft-xl rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Component Status</h3>
            
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                    <div className="flex justify-between mb-2">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {components.map((component, index) => (
                  <div 
                    key={index} 
                    className={`border rounded-md p-4 ${
                      component.status === 'critical' ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10' :
                      component.status === 'warning' ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10' :
                      'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {getStatusIcon(component.status)}
                        <h4 className="ml-2 font-medium text-gray-900 dark:text-white">{component.name}</h4>
                      </div>
                      <span className={`text-sm ${getStatusClass(component.status)} px-2 py-1 rounded-full`}>
                        {component.status === 'healthy' ? 'Operational' :
                         component.status === 'warning' ? 'Degraded' : 'Down'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Last checked {component.lastChecked}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow-soft-xl rounded-lg p-6 border border-gray-200 dark:border-gray-700 mt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Events</h3>
            
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="py-2">
                    <div className="flex justify-between mb-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : systemHealth ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                <li className="py-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">System restart</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">2 days ago</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Scheduled maintenance completed successfully</p>
                </li>
                <li className="py-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Database optimization</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">3 days ago</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Performance improvements applied</p>
                </li>
                <li className="py-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Model service update</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">5 days ago</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Updated to latest version with improved response times</p>
                </li>
              </ul>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 dark:text-gray-400">No recent events to display</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Health;
