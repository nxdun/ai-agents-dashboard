import { useState, useEffect, useRef } from 'react';
import { PlayIcon, PlusIcon, InfoIcon, AlertTriangleIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { getWorkflows, triggerWorkflow, getWorkflowStatus, getWorkflowLogs, createWorkflow } from '../services/api';
import WorkflowStepProgress from '../components/WorkflowStepProgress';
import CreateWorkflowModal from '../components/CreateWorkflowModal';

const Workflows = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [runningWorkflows, setRunningWorkflows] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const intervalRefs = useRef({});

  useEffect(() => {
    // Fetch workflows from API
    const fetchWorkflows = async () => {
      try {
        setIsLoading(true);
        const response = await getWorkflows();
        setWorkflows(response?.workflows || []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching workflows:", error);
        setIsLoading(false);
      }
    };

    fetchWorkflows();

    // Cleanup intervals on unmount
    return () => {
      Object.values(intervalRefs.current).forEach(interval => clearInterval(interval));
    };
  }, []);

  const executeWorkflow = async (workflow) => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      // Prepare workflow data for API
      const workflowData = {
        workflow_id: workflow.id,
        config: {
          max_steps: workflow.steps ? workflow.steps.length : 5,
          timeout: 300,
        }
      };
      
      // Call API to trigger workflow execution
      const response = await triggerWorkflow(workflowData);
      
      // Update UI with success message
      setMessage({
        type: "success",
        text: `Workflow "${workflow.name}" started successfully!`
      });
      
      // Start polling for status updates
      startPolling(workflow.id);
      
    } catch (error) {
      setMessage({
        type: "error",
        text: `Error: ${error.message || "Failed to start workflow"}`
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const startPolling = (workflowId) => {
    // Clear existing interval if any
    if (intervalRefs.current[workflowId]) {
      clearInterval(intervalRefs.current[workflowId]);
    }
    
    // Set workflow as running with initial state
    setRunningWorkflows(prev => ({
      ...prev,
      [workflowId]: { 
        status: 'running',
        progress: 0,
        currentStep: 0,
        startTime: new Date(),
        lastUpdate: new Date(),
        logs: []
      }
    }));
    
    // Start polling interval
    intervalRefs.current[workflowId] = setInterval(async () => {
      try {
        // Get workflow status
        const status = await getWorkflowStatus(workflowId);
        
        // Get workflow logs
        const logsResponse = await getWorkflowLogs(workflowId);
        const logs = logsResponse?.logs || [];
        
        setRunningWorkflows(prev => {
          // Update workflow status
          const updated = {
            ...prev,
            [workflowId]: { 
              ...prev[workflowId],
              status: status.status,
              progress: status.progress || prev[workflowId].progress,
              currentStep: status.currentStep || prev[workflowId].currentStep,
              lastUpdate: new Date(),
              logs: logs,
              error: status.error
            }
          };
          
          // If workflow is complete or failed, stop polling
          if (status.status === 'completed' || status.status === 'failed') {
            clearInterval(intervalRefs.current[workflowId]);
            delete intervalRefs.current[workflowId];
            
            // Update workflow in list with new status
            setWorkflows(prevWorkflows => 
              prevWorkflows.map(wf => 
                wf.id === workflowId ? { ...wf, status: status.status, lastRun: new Date() } : wf
              )
            );
          }
          
          return updated;
        });
        
      } catch (error) {
        console.error(`Error polling workflow ${workflowId}:`, error);
      }
    }, 2000); // Poll every 2 seconds
  };
  
  const handleCreateWorkflow = async (workflowData) => {
    try {
      setIsLoading(true);
      const response = await createWorkflow(workflowData);
      
      // Add the new workflow to the list
      if (response?.workflow) {
        setWorkflows(prev => [...prev, response.workflow]);
        setMessage({
          type: "success",
          text: `Workflow "${response.workflow.name}" created successfully!`
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: `Error: ${error.message || "Failed to create workflow"}`
      });
    } finally {
      setIsLoading(false);
      setShowCreateModal(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'running':
        return <PlayIcon className="h-5 w-5 text-blue-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <InfoIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
    }
  };
  
  const getStatusClass = (status) => {
    switch(status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="transition-colors duration-200">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">AI Workflows</h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Manage and execute multi-agent AI workflows</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create New Workflow
        </button>
      </div>
      
      {message && (
        <div className={`mb-6 p-4 rounded-md ${message.type === 'error' ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {message.type === 'error' ? 
                <AlertTriangleIcon className="h-5 w-5 text-red-400" /> : 
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
              }
            </div>
            <div className="ml-3">
              <p className={`text-sm ${message.type === 'error' ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>{message.text}</p>
            </div>
          </div>
        </div>
      )}
      
      {isLoading && workflows.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-12 sm:px-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Loading workflows...</h3>
          </div>
        </div>
      ) : workflows.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-12 sm:px-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No workflows</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new workflow.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Workflow
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg border border-gray-200 dark:border-gray-700">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {workflows.map((workflow) => {
              const isRunning = runningWorkflows[workflow.id];
              const effectiveStatus = isRunning ? isRunning.status : workflow.status;
              
              return (
                <li 
                  key={workflow.id} 
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer"
                  onClick={() => setSelectedWorkflow(workflow)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{workflow.name}</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{workflow.description || 'No description provided'}</p>
                    </div>
                    <div>
                      {getStatusBadge(workflow.status)}
                    </div>
                  </div>
                  
                  {/* Show workflow steps if they exist */}
                  {workflow.steps && workflow.steps.length > 0 && (
                    <div className="mt-4">
                      <WorkflowStepProgress 
                        steps={workflow.steps} 
                        currentStep={workflow.currentStep || (workflow.status === 'completed' ? workflow.steps.length : 0)} 
                      />
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Last run: {formatDate(workflow.lastRun)}
                    </div>
                    <div className="flex space-x-3">
                      <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors">
                        Edit
                      </button>
                      <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors">
                        Run Now
                      </button>
                      <button className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      
      {/* Workflow details modal */}
      {selectedWorkflow && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full border border-gray-200 dark:border-gray-700">
            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Workflow Details: {selectedWorkflow.name}
                  </h3>
                  <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ID</p>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedWorkflow.id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                        <p className={`mt-1 text-sm inline-flex items-center ${
                          selectedWorkflow.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                          selectedWorkflow.status === 'running' ? 'text-blue-600 dark:text-blue-400' :
                          selectedWorkflow.status === 'failed' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {getStatusIcon(selectedWorkflow.status)}
                          <span className="ml-1">{selectedWorkflow.status}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Steps</p>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedWorkflow.steps?.length || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Run</p>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                          {formatDate(selectedWorkflow.lastRun)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedWorkflow.description || 'No description provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-750 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => executeWorkflow(selectedWorkflow)}
                disabled={selectedWorkflow.status === 'running'}
              >
                Run Workflow
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => setSelectedWorkflow(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create workflow modal */}
      {showCreateModal && (
        <CreateWorkflowModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateWorkflow}
        />
      )}
    </div>
  );
};

export default Workflows;