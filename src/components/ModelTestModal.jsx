import { useState, useRef, useEffect } from 'react';
import { XIcon, SendIcon, Terminal, CopyIcon, CheckIcon, AlertCircleIcon } from 'lucide-react';
import { testModel } from '../services/api';

const ModelTestModal = ({ model, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [copied, setCopied] = useState(false);
  const [promptHistory, setPromptHistory] = useState([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  
  const modalRef = useRef(null);
  const promptInputRef = useRef(null);
  const responseRef = useRef(null);
  
  // Auto focus prompt input when modal opens
  useEffect(() => {
    if (promptInputRef.current) {
      promptInputRef.current.focus();
    }
    
    // Add escape key handler
    const handleEscKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [onClose]);
  
  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Handle up/down arrow keys for prompt history
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp' && promptHistory.length > 0 && currentHistoryIndex < promptHistory.length - 1) {
      e.preventDefault();
      const newIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(newIndex);
      setPrompt(promptHistory[promptHistory.length - 1 - newIndex]);
    } else if (e.key === 'ArrowDown' && currentHistoryIndex > 0) {
      e.preventDefault();
      const newIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(newIndex);
      setPrompt(promptHistory[promptHistory.length - 1 - newIndex]);
    } else if (e.key === 'ArrowDown' && currentHistoryIndex === 0) {
      e.preventDefault();
      setCurrentHistoryIndex(-1);
      setPrompt('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim() || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    // Add to history if not duplicate of last prompt
    if (promptHistory.length === 0 || promptHistory[promptHistory.length - 1] !== prompt) {
      setPromptHistory(prev => [...prev, prompt]);
    }
    setCurrentHistoryIndex(-1);
    
    try {
      // Call the API to test the model
      const result = await testModel(model.id, prompt);
      setResponse(result.response || '');
      
      if (result.metrics) {
        setMetrics({
          latency: result.metrics.latency || '?',
          tokens: result.metrics.tokens || '?',
          modelVersion: result.metrics.model_version || 'unknown'
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to get response from model');
    } finally {
      setIsLoading(false);
      
      // Scroll response into view with a small delay to ensure rendering
      setTimeout(() => {
        if (responseRef.current) {
          responseRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  };
  
  const copyToClipboard = () => {
    if (!response) return;
    
    navigator.clipboard.writeText(response)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };
  
  // Sample prompts specific to model type
  const getSamplePrompts = () => {
    // In a real app, customize these based on model capabilities
    return [
      "Explain how transformers work in natural language processing",
      "Generate a short story about a robot learning to paint",
      "Translate 'Hello, how are you?' to French, Spanish, and German",
      "Write a function in Python to calculate the Fibonacci sequence",
    ];
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-soft-xl max-w-3xl w-full max-h-[90vh] flex flex-col animate-scale"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-750">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <Terminal className="h-5 w-5 mr-2 text-primary-500" />
            Test {model.name}
            <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs rounded-md text-gray-600 dark:text-gray-300">
              {model.provider}
            </span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Model info */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-750 rounded-md border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Model ID:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-200 font-mono">{model.id}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                <span className={`ml-2 ${model.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {model.status}
                </span>
              </div>
            </div>
          </div>
          
          {/* Sample prompts */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Try one of these prompts:</h4>
            <div className="flex flex-wrap gap-2">
              {getSamplePrompts().map((samplePrompt, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(samplePrompt)}
                  className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors truncate max-w-[200px]"
                >
                  {samplePrompt}
                </button>
              ))}
            </div>
          </div>
          
          {/* Response area */}
          <div ref={responseRef} className="mb-4 min-h-[200px] border border-gray-200 dark:border-gray-700 rounded-md p-3 bg-gray-50 dark:bg-gray-750">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-2"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Generating response...</p>
              </div>
            ) : response ? (
              <div className="relative">
                <div className="absolute top-0 right-0 p-2">
                  <button
                    onClick={copyToClipboard}
                    className={`p-1 rounded-md ${copied ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'} transition-colors`}
                    title={copied ? "Copied!" : "Copy to clipboard"}
                  >
                    {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                  </button>
                </div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Response:</h4>
                <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono text-sm bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                  {response}
                </div>
                
                {metrics && (
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Metrics:</h4>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
                        <span className="text-gray-500 dark:text-gray-400">Latency:</span>
                        <span className="ml-1 text-gray-900 dark:text-gray-100">{metrics.latency}ms</span>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
                        <span className="text-gray-500 dark:text-gray-400">Tokens:</span>
                        <span className="ml-1 text-gray-900 dark:text-gray-100">{metrics.tokens}</span>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
                        <span className="text-gray-500 dark:text-gray-400">Version:</span>
                        <span className="ml-1 text-gray-900 dark:text-gray-100">{metrics.modelVersion}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : error ? (
              <div className="flex items-start p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
                <AlertCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Error</h4>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                <p className="text-sm">Enter a prompt and click "Send" to test the model</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Input area */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-750">
          <form onSubmit={handleSubmit} className="flex items-start space-x-3">
            <div className="flex-1">
              <textarea
                ref={promptInputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your prompt here..."
                rows={3}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Tip: Press ↑ to recall previous prompts
              </p>
            </div>
            <button
              type="submit"
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isLoading || !prompt.trim() 
                  ? 'bg-primary-400 cursor-not-allowed' 
                  : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
              } transition-colors inline-flex items-center`}
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? (
                'Processing...'
              ) : (
                <>
                  <SendIcon className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModelTestModal;
