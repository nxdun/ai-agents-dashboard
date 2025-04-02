import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for fetching API data with support for pagination and real-time updates
 * @param {Function} fetchFunction - API function to call
 * @param {Object} options - Hook configuration options
 * @returns {Object} State and control functions
 */
export const useApiData = (fetchFunction, options = {}) => {
  const {
    initialData = null,
    autoFetch = true,
    pagination = false,
    page = 1,
    limit = 20,
    enableRealtime = false,
    realtimeConfig = {}
  } = options;

  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paginationData, setPaginationData] = useState(null);

  const fetchData = useCallback(async (pageNum = page, pageLimit = limit) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = pagination
        ? await fetchFunction(pageNum, pageLimit)
        : await fetchFunction();

      // Handle paginated response structure
      if (pagination && result.pagination) {
        setData(result.data || result[Object.keys(result)[0]]);
        setPaginationData(result.pagination);
      } else {
        setData(result);
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred while fetching data';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction, pagination, page, limit]);

  // Handle real-time updates via WebSocket if enabled
  useEffect(() => {
    if (enableRealtime && realtimeConfig.subscription) {
      const { subscription, handlers } = realtimeConfig;
      
      // Setup real-time update handlers
      const cleanup = subscription(handlers);

      return () => {
        if (cleanup && typeof cleanup === 'function') {
          cleanup();
        }
      };
    }
  }, [enableRealtime, realtimeConfig]);

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  const goToPage = useCallback((newPage) => {
    if (pagination) {
      fetchData(newPage, limit);
    }
  }, [pagination, limit, fetchData]);

  const refresh = useCallback(() => {
    return fetchData(pagination ? page : undefined);
  }, [fetchData, pagination, page]);

  return {
    data,
    isLoading,
    error,
    refresh,
    pagination: paginationData,
    goToPage
  };
};

export default useApiData;
