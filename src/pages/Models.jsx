import { useState, useEffect, useRef } from 'react';
import { getAvailableModels } from '../services/api';
import { Check, Copy, RefreshCw, Server, ExternalLink } from 'lucide-react';

const Models = () => {
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAvailableModels();
      
      // Format the data for UI display
      const formattedModels = [];
      
      // Add active models if any
      if (data.active_models && data.active_models.length > 0) {
        formattedModels.push({
          category: 'Active Models',
          models: data.active_models.map(model => ({
            id: model,
            name: model,
            provider: 'active'
          }))
        });
      }
      
      // Add available models by provider
      if (data.available_models) {
        Object.entries(data.available_models).forEach(([provider, modelList]) => {
          if (modelList.length > 0) {
            formattedModels.push({
              category: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Models`,
              provider: provider,
              models: modelList.map(model => ({
                id: model,
                name: model,
                provider: provider
              }))
            });
          }
        });
      }
      
      console.log('Formatted models for UI:', formattedModels);
      setModels(formattedModels);
    } catch (err) {
      setError(err.message || 'Failed to fetch models');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopySuccess(text);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setCopySuccess(null);
        }, 2000);
      },
      () => {
        setCopySuccess(null);
      }
    );
  };

  const getProviderColor = (provider) => {
    switch (provider.toLowerCase()) {
      case 'openai':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'ollama':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="px-6 py-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">AI Models</h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Available models for task execution
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={fetchModels}
            className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400">
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading models...</p>
          </div>
        </div>
      ) : models.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <Server className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No Models Available</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            No models are currently configured on this server.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {models.map((category) => (
            <div key={category.category} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {category.category} ({category.models.length})
                </h3>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {category.models.map((model) => (
                  <div key={model.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900 dark:text-white">{model.name}</span>
                        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getProviderColor(model.provider)}`}>
                          {model.provider}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {model.id}
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => copyToClipboard(model.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {copySuccess === model.id ? (
                          <>
                            <Check className="h-4 w-4 mr-1 text-green-500" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copy ID
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExternalLink className="h-5 w-5" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium">Add More Models</h3>
            <div className="mt-2 text-sm">
              <p>
                You can add more models by configuring external providers like OpenAI and Ollama, or by using local models.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Models;
