import { useState, useRef, useEffect } from 'react';
import { convertGoalToTasks, executeTaskWorkflow, getWorkflowStatus, getWorkflowTasks } from '../services/api';
import { CheckCircle, XCircle, Play, Clock, Copy, Check, Network, RefreshCw, Activity, List } from 'lucide-react';
import TaskProgressBar from '../components/TaskProgressBar';

const GoalToTask = () => {
  const [goal, setGoal] = useState('');
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [executionStatus, setExecutionStatus] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [workflowTasks, setWorkflowTasks] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const [tasksError, setTasksError] = useState(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [statusPolling, setStatusPolling] = useState(false);
  const timeoutRef = useRef(null);
  const graphContainerRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await convertGoalToTasks({
        goal,
        context,
      });
      setResult(response);
    } catch (err) {
      setError(err.message || 'Failed to convert goal to tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkflowStatus = async (workflowId) => {
    if (!workflowId) return;

    setLoadingStatus(true);
    setStatusError(null);

    try {
      const data = await getWorkflowStatus(workflowId);
      setWorkflowStatus(data);
    } catch (err) {
      setStatusError(err.message || 'Failed to fetch workflow status');
    } finally {
      setLoadingStatus(false);
    }
  };

  const fetchWorkflowTasks = async (workflowId) => {
    if (!workflowId) return;

    setLoadingTasks(true);
    setTasksError(null);

    try {
      const data = await getWorkflowTasks(workflowId);
      setWorkflowTasks(data);
    } catch (err) {
      setTasksError(err.message || 'Failed to fetch workflow tasks');
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleViewStatus = async () => {
    if (!result?.workflow_id) return;

    await fetchWorkflowStatus(result.workflow_id);
    await fetchWorkflowTasks(result.workflow_id);
    setShowTaskDetails(!showTaskDetails);
  };

  const startStatusPolling = (workflowId) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    setStatusPolling(true);

    // Immediate first fetch
    fetchWorkflowStatus(workflowId);
    fetchWorkflowTasks(workflowId);

    // Set up polling every 3 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchWorkflowStatus(workflowId);
      fetchWorkflowTasks(workflowId);

      // Check if we should stop polling (when workflow is completed or failed)
      if (
        workflowStatus &&
        (workflowStatus.status === 'COMPLETED' || workflowStatus.status === 'FAILED')
      ) {
        stopStatusPolling();
      }
    }, 3000);
  };

  const stopStatusPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setStatusPolling(false);
  };

  // Clean up polling on component unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const handleExecute = async () => {
    if (!result?.workflow_id) return;

    setExecuting(true);
    setExecutionStatus('starting');

    try {
      await executeTaskWorkflow(result.workflow_id);
      setExecutionStatus('success');

      // Start polling for status updates when execution begins
      startStatusPolling(result.workflow_id);
    } catch (err) {
      setExecutionStatus('error');
    } finally {
      setExecuting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopySuccess(true);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
      },
      () => {
        setCopySuccess(false);
      }
    );
  };

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusBadge = (status) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTaskStatusColor(
          status
        )}`}
      >
        {status}
      </span>
    );
  };

  // Render the task dependency graph visualization when tasks are available
  useEffect(() => {
    if (showGraph && result?.tasks && result.tasks.length > 0 && graphContainerRef.current) {
      try {
        const renderGraph = async () => {
          // Check if mermaid is available in window, if not, dynamically import it
          if (!window.mermaid) {
            const mermaid = await import('mermaid');
            window.mermaid = mermaid.default;
            window.mermaid.initialize({
              startOnLoad: true,
              theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
              flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis',
              },
              securityLevel: 'loose',
            });
          }

          // Create mermaid diagram definition
          const tasks = result.tasks;
          let graphDefinition = 'graph TD;\n';

          // Add nodes
          tasks.forEach((task, index) => {
            const nodeId = `Task${index + 1}`;
            const label = `${index + 1}. ${task.description}`;

            // Style based on task type/dependencies
            let nodeStyle = '';
            if (task.dependencies.length === 0) {
              nodeStyle = 'style Task' + (index + 1) + ' fill:#d1fae5,stroke:#10b981';
            } else {
              nodeStyle = 'style Task' + (index + 1) + ' fill:#fef3c7,stroke:#f59e0b';
            }

            graphDefinition += `${nodeId}["${label}"];\n`;
            graphDefinition += `${nodeStyle};\n`;
          });

          // Add edges (connections)
          tasks.forEach((task, index) => {
            if (task.dependencies && task.dependencies.length > 0) {
              task.dependencies.forEach((dep) => {
                // Find the index of the dependency
                const depIndex = tasks.findIndex((t) => t.description === dep);
                if (depIndex !== -1) {
                  graphDefinition += `Task${depIndex + 1} --> Task${index + 1};\n`;
                }
              });
            }
          });

          // Clear and render
          graphContainerRef.current.innerHTML = graphDefinition;
          window.mermaid.init(undefined, graphContainerRef.current);
        };

        renderGraph();
      } catch (err) {
        console.error('Error rendering graph:', err);
      }
    }
  }, [showGraph, result]);

  return (
    <div className="px-6 py-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Goal to Task</h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Convert high-level goals into executable tasks
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Define Your Goal</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Goal
              </label>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                rows="3"
                placeholder="Enter your goal here (e.g., Calculate my monthly budget)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Context (optional)
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                rows="6"
                placeholder="Provide additional context (e.g., My income is $5000/month, I need to save $1000)"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || !goal}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isLoading || !goal
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Convert Goal to Tasks'
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400">
              <div className="flex">
                <XCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-blue-700 dark:text-blue-400">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="ml-3 text-sm">
                There is <strong>no time limit</strong> - complex goals may take longer to process.
              </p>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Generated Tasks</h3>

            {result && (
              <div className="flex items-center space-x-3">
                <div className="relative group">
                  <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-md">
                    <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">
                      {result.workflow_id?.slice(0, 12)}...
                    </span>
                    <button
                      onClick={() => copyToClipboard(result.workflow_id)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                      title="Copy workflow ID"
                    >
                      {copySuccess ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                      {copySuccess ? 'Copied!' : 'Copy workflow ID'}
                    </div>
                  </div>
                </div>

                {!workflowStatus || workflowStatus.status !== 'COMPLETED' ? (
                  <button
                    onClick={handleExecute}
                    disabled={executing || !result || statusPolling}
                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md ${
                      executing || statusPolling
                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'text-white bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {statusPolling ? (
                      <Activity className="h-4 w-4 mr-1 animate-pulse" />
                    ) : executing ? (
                      <Clock className="h-4 w-4 mr-1 animate-pulse" />
                    ) : (
                      <Play className="h-4 w-4 mr-1" />
                    )}
                    {statusPolling ? 'Running...' : executing ? 'Starting...' : 'Execute Tasks'}
                  </button>
                ) : null}

                <button
                  onClick={handleViewStatus}
                  className={`inline-flex items-center px-3 py-1.5 border text-sm font-medium rounded-md ${
                    showTaskDetails
                      ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {loadingStatus ? (
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <List className="h-4 w-4 mr-1" />
                  )}
                  {showTaskDetails ? 'Hide Details' : 'View Status'}
                </button>
              </div>
            )}
          </div>

          {/* Loading, Empty State and Error Handling */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="animate-spin h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Generating tasks from your goal...
              </p>
            </div>
          ) : !result ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <svg
                className="h-16 w-16 mb-4 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                ></path>
              </svg>
              <p>Enter your goal to generate tasks</p>
            </div>
          ) : (
            <div>
              {/* Result Status */}
              <div
                className={`mb-6 p-4 rounded-lg border ${
                  result.success
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-center">
                  {result.success ? (
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500 mr-3" />
                  )}
                  <div>
                    <h4
                      className={`text-sm font-medium ${
                        result.success
                          ? 'text-green-800 dark:text-green-400'
                          : 'text-red-800 dark:text-red-400'
                      }`}
                    >
                      {result.success
                        ? 'Successfully generated tasks'
                        : 'Failed to generate tasks'}
                    </h4>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      Workflow ID: <span className="font-mono">{result.workflow_id}</span>
                    </p>
                  </div>
                  <div className="ml-auto">
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {result.tasks?.length || 0} Tasks
                    </span>
                  </div>
                </div>
              </div>

              {/* Workflow Progress Section */}
              {workflowStatus && (
                <div className="mb-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Workflow Progress
                    </h4>
                    <button
                      onClick={() => fetchWorkflowStatus(result.workflow_id)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      disabled={loadingStatus}
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${loadingStatus ? 'animate-spin' : ''}`}
                      />
                    </button>
                  </div>

                  <TaskProgressBar
                    status={workflowStatus.status}
                    percentage={workflowStatus.completion_percentage || 0}
                    taskStatus={workflowStatus.task_status}
                  />
                </div>
              )}

              {/* Task Details Section */}
              {showTaskDetails && workflowTasks && (
                <div className="mb-6 overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="bg-gray-50 dark:bg-gray-750 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Task Details
                      </h4>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {workflowTasks.task_count} Tasks
                      </div>
                    </div>
                  </div>

                  <div className="overflow-y-auto max-h-[400px]">
                    {workflowTasks.tasks &&
                      workflowTasks.tasks.map((task, index) => (
                        <div
                          key={task.task_id}
                          className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
                            index % 2 === 0
                              ? 'bg-white dark:bg-gray-800'
                              : 'bg-gray-50 dark:bg-gray-750'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start space-x-3">
                              <div
                                className={`flex flex-shrink-0 items-center justify-center h-6 w-6 mt-0.5 rounded-full text-white text-xs font-medium ${
                                  task.dependencies.length === 0
                                    ? 'bg-green-500'
                                    : 'bg-yellow-500'
                                }`}
                              >
                                {index + 1}
                              </div>
                              <div>
                                <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                                  {task.description}
                                </h5>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                    Type: {task.type}
                                  </span>
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                    Priority: {task.priority}
                                  </span>
                                  {getStatusBadge(task.status)}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 ml-9 space-y-3">
                            {task.result && (
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  Result:
                                </p>
                                <div className="bg-green-50 dark:bg-green-900/20 rounded p-2 text-sm text-green-800 dark:text-green-400">
                                  {JSON.stringify(task.result)}
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <p className="text-gray-500 dark:text-gray-400 mb-1">Created:</p>
                                <p className="text-gray-900 dark:text-gray-100">
                                  {new Date(task.created_at).toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400 mb-1">Updated:</p>
                                <p className="text-gray-900 dark:text-gray-100">
                                  {new Date(task.updated_at).toLocaleString()}
                                </p>
                              </div>
                            </div>

                            {task.assigned_agent && (
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  Agent:
                                </p>
                                <p className="text-sm text-gray-900 dark:text-white">
                                  {task.assigned_agent}
                                </p>
                              </div>
                            )}

                            <div className="collapse">
                              <input type="checkbox" className="peer" />
                              <div className="collapse-title text-xs text-gray-500 dark:text-gray-400 p-0">
                                View Parameters ↓
                              </div>
                              <div className="collapse-content p-0 mt-2">
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2.5 font-mono text-xs overflow-x-auto border border-gray-100 dark:border-gray-700">
                                  <pre className="text-gray-800 dark:text-gray-200">
                                    {JSON.stringify(task.parameters, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {executionStatus && !workflowStatus && (
                <div
                  className={`mb-6 p-3 rounded flex items-center ${
                    executionStatus === 'success'
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                      : executionStatus === 'error'
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                      : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                  }`}
                >
                  {executionStatus === 'success' ? (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span>Tasks executed successfully!</span>
                    </>
                  ) : executionStatus === 'error' ? (
                    <>
                      <XCircle className="h-5 w-5 mr-2" />
                      <span>Failed to execute tasks. Please try again.</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-5 w-5 mr-2 animate-spin" />
                      <span>Starting workflow execution...</span>
                    </>
                  )}
                </div>
              )}

              {/* Tab Navigation for Task List and Graph */}
              {!showTaskDetails && result.tasks && (
                <div className="space-y-6">
                  <div className="border-b border-gray-200 dark:border-gray-700 -mx-6 px-6 pb-2">
                    <div className="flex space-x-8">
                      <button
                        className={`pb-3 border-b-2 text-sm font-medium ${
                          !showGraph
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                        onClick={() => setShowGraph(false)}
                      >
                        Task List
                      </button>
                      <button
                        className={`pb-3 border-b-2 text-sm font-medium ${
                          showGraph
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                        onClick={() => setShowGraph(true)}
                      >
                        Dependency Graph
                      </button>
                    </div>
                  </div>

                  {!showGraph && (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Task Sequence
                        </h4>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <span className="h-3 w-3 rounded-full bg-green-500 mr-1"></span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Root</span>
                          </div>
                          <div className="flex items-center">
                            <span className="h-3 w-3 rounded-full bg-yellow-500 mr-1"></span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Dependent
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
                        {result.tasks.map((task, index) => (
                          <div
                            key={index}
                            className={`p-4 ${
                              index % 2 === 0
                                ? 'bg-white dark:bg-gray-800'
                                : 'bg-gray-50 dark:bg-gray-750'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`flex items-center justify-center h-6 w-6 rounded-full text-white text-xs font-medium ${
                                    task.dependencies.length === 0
                                      ? 'bg-green-500'
                                      : 'bg-yellow-500'
                                  }`}
                                >
                                  {index + 1}
                                </div>
                                <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                                  {task.description}
                                </h5>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                  {task.type}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                  Priority: {task.priority}
                                </span>
                              </div>
                            </div>

                            <div className="mt-3 ml-9 space-y-3">
                              {task.dependencies.length > 0 && (
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    Dependencies:
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {task.dependencies.map((dep, i) => (
                                      <span
                                        key={i}
                                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md"
                                      >
                                        {dep}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  Parameters:
                                </p>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2.5 font-mono text-xs overflow-x-auto border border-gray-100 dark:border-gray-700">
                                  <pre className="text-gray-800 dark:text-gray-200">
                                    {JSON.stringify(task.parameters, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {showGraph && (
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                        Task Dependencies
                      </h4>

                      <div className="overflow-x-auto">
                        <div className="min-w-[500px] h-[400px] bg-white dark:bg-gray-800 p-2">
                          <pre className="mermaid" ref={graphContainerRef}></pre>
                        </div>
                      </div>

                      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                        Green nodes represent root tasks, yellow nodes represent dependent tasks.
                      </p>
                    </div>
                  )}

                  <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Workflow ID (for reference)
                      </p>
                      <button
                        onClick={() => copyToClipboard(result.workflow_id)}
                        className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs"
                      >
                        {copySuccess ? (
                          <>
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 mr-1" />
                            Copy ID
                          </>
                        )}
                      </button>
                    </div>
                    <div className="mt-1 bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
                      <code className="text-xs font-mono text-gray-800 dark:text-gray-200 break-all">
                        {result.workflow_id}
                      </code>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalToTask;
