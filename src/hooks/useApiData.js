import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for fetching API data with loading, error, and data states
 * @param {Function} fetchFunction - API function to call
 * @param {Array} dependencies - Dependencies array for useEffect
 * @param {Object} options - Additional options
 * @returns {Object} { data, isLoading, error, refetch }
 */
export const useApiData = (fetchFunction, dependencies = [], options = {}) => {
  const { initialData = null, autoFetch = true } = options;
  
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchFunction();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction]);
  
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [...dependencies, fetchFunction]);
  
  return { data, isLoading, error, refetch: fetchData };
};

export default useApiData;
