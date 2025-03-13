import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UsersIcon, CpuIcon, GitBranchIcon, ActivityIcon, RefreshCwIcon, ChevronRightIcon, AlertTriangleIcon, CheckIcon } from 'lucide-react';
import StatusCard from '../components/StatusCard';
import { getDashboardStats } from '../services/api';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    agents: 0,
    models: 0,
    workflows: 0,
    activities: 0
  });
  const [recentWorkflows, setRecentWorkflows] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching dashboard data...');
        const response = await getDashboardStats(true);
        console.log('Dashboard API response:', response);
        
        if (response?.stats) {
          setStats({
            agents: parseInt(response.stats.agents) || 0,
            models: parseInt(response.stats.models) || 0,
            workflows: parseInt(response.stats.workflows) || 0,
            activities: parseInt(response.stats.activities) || 0
          });
        }
        
        setRecentWorkflows(response?.recentWorkflows || []);
        setSystemHealth(response?.systemHealth || null);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    };
    
    fetchDashboardData();
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshing(true);
    setRefreshKey(prev => prev + 1);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
            <CheckIcon className="h-3 w-3 mr-1" />
            Completed
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
            <span className="h-2 w-2 rounded-full bg-blue-500 mr-1 animate-pulse"></span>
            Running
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
            <AlertTriangleIcon className="h-3 w-3 mr-1" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
            {status}
          </span>
        );
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString(undefined, { 
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard Overview</h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Monitor and manage your multi-agent system</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md flex items-center text-sm font-medium transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow hover:shadow-lg"
          disabled={isLoading || refreshing}
        >
          <RefreshCwIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
          <StatusCard 
            title="Agents"
            value={stats.agents}
            icon={<UsersIcon className="h-6 w-6 text-white" />}
            loading={isLoading}
            href="/agents"
            color="bg-blue-500"
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <StatusCard 
            title="Models"
            value={stats.models}
            icon={<CpuIcon className="h-6 w-6 text-white" />}
            loading={isLoading}
            href="/models"
            color="bg-green-500"
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <StatusCard 
            title="Workflows"
            value={stats.workflows}
            icon={<GitBranchIcon className="h-6 w-6 text-white" />}
            loading={isLoading}
            href="/workflows"
            color="bg-purple-500"
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <StatusCard 
            title="Activities"
            value={stats.activities}
            icon={<ActivityIcon className="h-6 w-6 text-white" />}
            loading={isLoading}
            href="/activities"
            color="bg-amber-500"
          />
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Workflows */}
        <div className="bg-white dark:bg-gray-800 shadow-soft-xl rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-soft-2xl animate-slide-in-left">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex justify-between items-center">
            Recent Workflows
            <Link 
              to="/workflows" 
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-all duration-300 hover:translate-x-1 flex items-center"
            >
              View all <ChevronRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </h3>
          
          {isLoading ? (
            <div className="animate-pulse space-y-3 mt-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          ) : recentWorkflows.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {recentWorkflows.map((workflow, index) => (
                <li 
                  key={workflow.id}
                  className="group bg-gray-50 dark:bg-gray-750 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 border-l-4 border-transparent hover:border-primary-500 cursor-pointer transform hover:-translate-y-1"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {workflow.name}
                    </span>
                    {getStatusBadge(workflow.status)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                    {workflow.details}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 flex items-center">
                    <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {formatDate(workflow.timestamp)}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-12 text-center">
              <svg className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <p className="mt-4 text-md font-medium text-gray-900 dark:text-gray-200">No recent workflows</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Start by creating a workflow to see recent activity</p>
              <Link 
                to="/workflows" 
                className="mt-4 inline-block px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 transition-colors shadow hover:shadow-md"
              >
                Create a workflow →
              </Link>
            </div>
          )}
        </div>
        
        {/* System Health */}
        <div className="bg-white dark:bg-gray-800 shadow-soft-xl rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-soft-2xl animate-slide-in-right">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex justify-between items-center">
            System Health
            <Link 
              to="/health" 
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-all duration-300 hover:translate-x-1 flex items-center"
            >
              Full report <ChevronRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </h3>
          
          {isLoading ? (
            <div className="animate-pulse space-y-4 mt-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ) : systemHealth ? (
            <div className="mt-6">
              <div className="mb-6 flex items-center justify-center">
                <div className="relative">
                  <svg className="w-24 h-24">
                    <circle 
                      className="text-gray-200 dark:text-gray-700" 
                      strokeWidth="5" 
                      stroke="currentColor" 
                      fill="transparent" 
                      r="40" 
                      cx="45" 
                      cy="45" 
                    />
                    <circle 
                      className="text-primary-500 dark:text-primary-400" 
                      strokeWidth="5" 
                      strokeDasharray={251.2} 
                      strokeDashoffset={251.2 - (251.2 * systemHealth.uptime) / 100} 
                      strokeLinecap="round" 
                      stroke="currentColor" 
                      fill="transparent" 
                      r="40" 
                      cx="45" 
                      cy="45"
                      style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-gray-800 dark:text-white">{systemHealth.uptime}%</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-4 flex items-center">
                <div className={`h-4 w-4 rounded-full ${
                  systemHealth.status === 'healthy' ? 'bg-green-500' : 
                  systemHealth.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                } mr-2 ${systemHealth.status === 'healthy' ? 'animate-pulse-slow' : 'animate-ping-slow'}`}></div>
                <span className={`font-medium ${
                  systemHealth.status === 'healthy' ? 'text-green-600 dark:text-green-400' : 
                  systemHealth.status === 'warning' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {systemHealth.status === 'healthy' ? 'All systems operational' : 
                   systemHealth.status === 'warning' ? 'Performance degradation detected' : 'System issues detected'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-750 p-4 rounded-md">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm hover:shadow transition-shadow">
                  <p className="text-sm text-gray-500 dark:text-gray-400">API Response Time</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{systemHealth.apiLatency}ms</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm hover:shadow transition-shadow">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Failed Tasks</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{systemHealth.failedTasks || 0}</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm hover:shadow transition-shadow">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Agents</p>
                  <div className="flex items-end">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{systemHealth.activeAgents || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 ml-1 mb-1">/{stats.agents || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <svg className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
              </svg>
              <p className="mt-4 text-md font-medium text-gray-900 dark:text-gray-200">No health data available</p>
              <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">System health monitoring is not configured</p>
              <Link 
                to="/health" 
                className="mt-4 inline-block px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 transition-colors shadow hover:shadow-md"
              >
                Check system health →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
