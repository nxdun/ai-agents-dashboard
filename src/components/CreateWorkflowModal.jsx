import { useState, useRef, useEffect } from 'react';
import { XIcon, PlusIcon, TrashIcon, HelpCircleIcon, ChevronDownIcon } from 'lucide-react';

const CreateWorkflowModal = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState([
    { name: 'Initialize', description: '' },
    { name: 'Process Data', description: '' }
  ]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef(null);
  const nameInputRef = useRef(null);
  
  // Focus name input when modal opens
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
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

  const addStep = () => {
    const newStep = { name: '', description: '' };
    setSteps(prev => [...prev, newStep]);
    
    // Scroll to the bottom after adding new step (with a slight delay to allow render)
    setTimeout(() => {
      const stepsContainer = document.getElementById('steps-container');
      if (stepsContainer) {
        stepsContainer.scrollTop = stepsContainer.scrollHeight;
      }
    }, 100);
  };

  const removeStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
    
    // Clear any errors for the removed step
    const newErrors = { ...errors };
    delete newErrors[`step-${index}-name`];
    delete newErrors[`step-${index}-description`];
    setErrors(newErrors);
  };

  const updateStep = (index, field, value) => {
    const updatedSteps = [...steps];
    updatedSteps[index][field] = value;
    setSteps(updatedSteps);
    
    // Clear errors
    if (errors[`step-${index}-${field}`]) {
      setErrors(prev => ({...prev, [`step-${index}-${field}`]: null}));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Workflow name is required';
    }
    
    steps.forEach((step, index) => {
      if (!step.name.trim()) {
        newErrors[`step-${index}-name`] = 'Step name is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      // Create workflow object
      const workflow = {
        id: `workflow-${Date.now()}`,
        name,
        description,
        steps: steps.map((step, index) => ({
          ...step,
          id: `step-${Date.now()}-${index}`,
          order: index
        })),
        status: 'idle',
        lastRun: null
      };
      
      onSave(workflow);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 overflow-y-auto z-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Backdrop with blur effect */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
          aria-hidden="true"
          onClick={onClose}
        ></div>
        
        {/* Modal */}
        <div 
          ref={modalRef}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-soft-xl max-w-2xl w-full max-h-[90vh] relative z-10 animate-scale transform overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-750">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Create New Workflow</span>
              <span className="ml-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
                Beta
              </span>
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full p-1"
              aria-label="Close"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
          
          {/* Form */}
          <div className="flex-1 overflow-y-auto p-4 max-h-[calc(90vh-8rem)]" id="steps-container">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic info */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Workflow Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={nameInputRef}
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors({...errors, name: null});
                    }}
                    className={`mt-1 block w-full rounded-md shadow-sm text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200
                      ${errors.name 
                        ? 'border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                      }`}
                    placeholder="Enter workflow name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500 mr-2"></span>
                      {errors.name}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
                    placeholder="Describe what this workflow does"
                  />
                </div>
              </div>
              
              {/* Steps */}
              <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-md border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
                  </svg>
                  Workflow Steps
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    (Define the sequence of steps)
                  </span>
                </h4>
                
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div 
                      key={index} 
                      className={`p-4 border rounded-md transition-all duration-200 transform hover:shadow-md
                        ${errors[`step-${index}-name`] 
                          ? 'border-red-300 bg-red-50 dark:bg-red-900/10 dark:border-red-800' 
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                        }
                        ${index === steps.length - 1 ? 'animate-slide-up' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mr-2 text-xs font-bold">
                            {index + 1}
                          </span>
                          Step {index + 1}
                        </h5>
                        {steps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeStep(index)}
                            className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Remove step"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label htmlFor={`step-name-${index}`} className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id={`step-name-${index}`}
                            value={step.name}
                            onChange={(e) => updateStep(index, 'name', e.target.value)}
                            className={`mt-1 block w-full rounded-md shadow-sm text-sm
                              ${errors[`step-${index}-name`]
                                ? 'border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500'
                              }`}
                            placeholder="Step name"
                          />
                          {errors[`step-${index}-name`] && (
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                              {errors[`step-${index}-name`]}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor={`step-desc-${index}`} className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                            Description
                          </label>
                          <input
                            type="text"
                            id={`step-desc-${index}`}
                            value={step.description}
                            onChange={(e) => updateStep(index, 'description', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                            placeholder="What happens in this step?"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={addStep}
                  className="mt-4 w-full inline-flex items-center justify-center px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-750 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2 text-primary-500" />
                  Add Step
                </button>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <HelpCircleIcon className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Tips for creating effective workflows</h4>
                    <ul className="mt-1 text-xs text-blue-700 dark:text-blue-400 list-disc list-inside space-y-1">
                      <li>Break down your task into clear, sequential steps</li>
                      <li>Give each step a descriptive name</li>
                      <li>Consider adding validation between critical steps</li>
                    </ul>
                  </div>
                </div>
              </div>
            </form>
          </div>
          
          {/* Actions */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                ${isSubmitting 
                  ? 'bg-primary-400 cursor-not-allowed' 
                  : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                } transition-colors`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Workflow'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkflowModal;
