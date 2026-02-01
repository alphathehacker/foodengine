import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value with a specified delay
 * @param {*} value - The value to debounce
 * @param {number} delay - The delay in milliseconds (default: 300ms)
 * @returns {*} The debounced value
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value changes or component unmounts
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
