import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for handling API requests with loading, error, and data states
 * @param {Function} apiFunction - The async function that makes the API call
 * @param {*} initialData - Initial data state (default: null)
 * @param {boolean} immediate - Whether to call the API immediately (default: false)
 * @returns {Object} Object containing data, loading, error, and execute function
 */
export const useFetch = (apiFunction, initialData = null, immediate = false) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(...args);
      setData(result.data || result);
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
  }, [initialData]);

  // Execute immediately if immediate is true and apiFunction is provided
  useEffect(() => {
    if (immediate && apiFunction) {
      execute();
    }
  }, [immediate, apiFunction, execute]);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
};

export default useFetch;
