import { useState } from 'react';

/**
 * Reusable form field component with validation
 */
const FormField = ({
  id,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  required = false,
  minLength,
  maxLength,
  pattern,
  validate,
  errorMessage,
  helpText,
}) => {
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState(null);
  
  const validateField = (value) => {
    if (required && !value) {
      return 'This field is required';
    }
    
    if (minLength && value.length < minLength) {
      return `Must be at least ${minLength} characters`;
    }
    
    if (maxLength && value.length > maxLength) {
      return `Cannot exceed ${maxLength} characters`;
    }
    
    if (pattern && !new RegExp(pattern).test(value)) {
      return errorMessage || 'Invalid format';
    }
    
    if (validate && typeof validate === 'function') {
      return validate(value);
    }
    
    return null;
  };
  
  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(e);
    
    if (touched) {
      setError(validateField(newValue));
    }
  };
  
  const handleBlur = (e) => {
    setTouched(true);
    setError(validateField(e.target.value));
  };
  
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={id}
          name={id}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
          }`}
          required={required}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
          }`}
          required={required}
        />
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      
      {helpText && !error && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
      )}
    </div>
  );
};

export default FormField;
