import { useState, useEffect } from 'react';
import { CheckCircleIcon, ClockIcon, AlertCircleIcon, RefreshCwIcon } from 'lucide-react';
import { getActivities } from '../services/api';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getActivities();
      // Ensure we're working with an array and each item has a status
      const formattedActivities = (Array.isArray(data) ? data : (data?.activities || []))
        .map(activity => ({
          ...activity,
          // Ensure status exists with a default value if missing
          status: activity.status || 'unknown'
        }));
      setActivities(formattedActivities);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      setError('Failed to load activities. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'failed':
        return <AlertCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">System Activities</h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Recent activities and events in the system</p>
        </div>
        <button 
          onClick={fetchActivities} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          disabled={loading}
        >
          <RefreshCwIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Activity Log</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            A record of recent agent executions, workflow runs, and system events
          </p>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="px-4 py-10 sm:p-6 flex justify-center">
              <RefreshCwIcon className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
          ) : activities.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {activities.map((activity) => (
                <li key={activity.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-750">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getStatusIcon(activity.status)}
                      <p className="ml-2 text-sm font-medium text-gray-900 dark:text-white">{activity.name}</p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${activity.status === 'completed' && 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'} 
                        ${activity.status === 'in_progress' && 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'} 
                        ${activity.status === 'failed' && 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}
                      >
                        {/* Add null check before trying to replace */}
                        {typeof activity.status === 'string' ? activity.status.replace('_', ' ') : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        {activity.details}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                      <p>
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-12 sm:px-6">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">No activities yet</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Activities will appear here when you run workflows or use agents.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activities;
