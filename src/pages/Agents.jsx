import { useState, useEffect } from 'react';
import { getAgents, switchAgentModel } from '../services/api';
import { PlusIcon, RefreshCwIcon, PlayIcon, PauseIcon } from 'lucide-react';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getAgents();
      
      // Properly extract agents array from the response
      const agentsData = Array.isArray(response) ? response : (response?.agents || []);
      
      // Ensure each agent has required fields with defaults
      const formattedAgents = agentsData.map(agent => ({
        id: agent.id || `agent-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: agent.name || "Unnamed Agent",
        description: agent.description || "No description provided",
        status: agent.status || "offline",
        model: agent.model || "default-model",
        tasks_completed: agent.tasks_completed || 0,
        avg_response_time: agent.avg_response_time || "N/A",
        ...agent
      }));
      
      console.log('Formatted agents for UI:', formattedAgents);
      setAgents(formattedAgents);
    } catch (err) {
      setError(err.message || 'Failed to fetch agents');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch available models for the dropdown
  const fetchModels = async () => {
    try {
      // This would be replaced with your actual API call
      // const response = await getModels();
      // setAvailableModels(response.models || []);
      
      // Initialize with empty array
      setAvailableModels([]);
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  };

  useEffect(() => {
    fetchAgents();
    fetchModels();
  }, []);

  const toggleAgentStatus = async (agentId) => {
    try {
      // In a real implementation, call your API to change agent status
      // Update local state to reflect status change
      setAgents(prevAgents => prevAgents.map(agent => {
        if (agent.id === agentId) {
          return {
            ...agent,
            status: agent.status === 'online' ? 'offline' : 'online'
          };
        }
        return agent;
      }));
    } catch (error) {
      setError(`Failed to update agent status: ${error.message}`);
    }
  };

  const handleModelChange = async (agentId, modelId) => {
    try {
      await switchAgentModel(agentId, modelId);
      
      // Update local state to reflect model change
      setAgents(prevAgents => prevAgents.map(agent => {
        if (agent.id === agentId) {
          return {
            ...agent,
            model: modelId
          };
        }
        return agent;
      }));
      
      setSelectedAgent(null);
    } catch (error) {
      setError(`Failed to change model: ${error.message}`);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Agents</h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Manage your intelligent agents</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button
            onClick={fetchAgents}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <RefreshCwIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Agent
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Agents grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array(4).fill(0).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden animate-pulse border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))
        ) : agents.length > 0 ? (
          agents.map((agent) => (
            <div key={agent.id} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{agent.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    agent.status === 'online' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  }`}>
                    {agent.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{agent.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Model: <span className="font-medium">{agent.model}</span>
                  </div>
                  <button
                    onClick={() => setSelectedAgent(agent)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                  >
                    Change Model
                  </button>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tasks Completed</p>
                    <p className="font-semibold">{agent.tasks_completed || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Avg Response</p>
                    <p className="font-semibold">{agent.avg_response_time || 'N/A'}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                  <button 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    onClick={() => setSelectedAgent({...agent, action: 'configure'})}
                  >
                    Configure
                  </button>
                  <button 
                    className="text-sm flex items-center"
                    onClick={() => toggleAgentStatus(agent.id)}
                  >
                    {agent.status === 'online' ? (
                      <>
                        <PauseIcon className="h-4 w-4 mr-1 text-amber-500" />
                        <span className="text-amber-600 dark:text-amber-400">Pause</span>
                      </>
                    ) : (
                      <>
                        <PlayIcon className="h-4 w-4 mr-1 text-green-500" />
                        <span className="text-green-600 dark:text-green-400">Activate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 bg-white dark:bg-gray-800 shadow rounded-lg p-5 text-center border border-gray-200 dark:border-gray-700">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No agents found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new agent.</p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                New Agent
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Model selection modal */}
      {selectedAgent && selectedAgent.action !== 'configure' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full border border-gray-200 dark:border-gray-700">
            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Select Model for {selectedAgent.name}
                  </h3>
                  <div className="mt-4">
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Model
                    </label>
                    {availableModels.length > 0 ? (
                      <select
                        id="model"
                        name="model"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                        defaultValue={selectedAgent.model}
                      >
                        {availableModels.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        No models available. Please add models first.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-750 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => {
                  const select = document.getElementById('model');
                  select && handleModelChange(selectedAgent.id, select.value);
                }}
                disabled={availableModels.length === 0}
              >
                Apply
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => setSelectedAgent(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configuration modal */}
      {selectedAgent && selectedAgent.action === 'configure' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full border border-gray-200 dark:border-gray-700">
            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Configure {selectedAgent.name}
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="agent-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Name
                      </label>
                      <input
                        type="text"
                        id="agent-name"
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        defaultValue={selectedAgent.name}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="agent-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description
                      </label>
                      <textarea
                        id="agent-description"
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        defaultValue={selectedAgent.description}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="agent-params" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Parameters (JSON)
                      </label>
                      <textarea
                        id="agent-params"
                        rows={5}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        defaultValue={JSON.stringify({
                          temperature: 0.7,
                          max_tokens: 1000,
                          top_p: 1,
                          frequency_penalty: 0,
                          presence_penalty: 0
                        }, null, 2)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-750 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Save Changes
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => setSelectedAgent(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agents;