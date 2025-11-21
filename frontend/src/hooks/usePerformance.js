import { useEffect, useCallback, useRef, useState } from 'react';

/**
 * Hook for measuring component render performance
 */
export function useRenderPerformance(componentName) {
  const renderStartTime = useRef(Date.now());
  const [isFirstRender, setIsFirstRender] = useState(true);
  
  // Mark render start on first render
  useEffect(() => {
    if (isFirstRender && window.performance && window.performance.mark) {
      try {
        window.performance.mark(`${componentName}-render-start`);
        setIsFirstRender(false);
      } catch (error) {
        console.warn(`Performance mark failed for ${componentName}:`, error);
      }
    }
    renderStartTime.current = Date.now();
  }, [componentName, isFirstRender]);
  
  // Measure render time after component mounts
  useEffect(() => {
    const renderTime = Date.now() - renderStartTime.current;
    
    if (renderTime > 100) { // Log slow renders (>100ms)
      console.warn(`Slow render detected: ${componentName} took ${renderTime}ms`);
    }
    
    // Performance API measurement
    if (window.performance && window.performance.mark && !isFirstRender) {
      try {
        window.performance.mark(`${componentName}-render-end`);
        window.performance.measure(
          `${componentName}-render`,
          `${componentName}-render-start`,
          `${componentName}-render-end`
        );
      } catch (error) {
        // Silently ignore performance measurement errors in development
        if (process.env.NODE_ENV === 'development') {
          console.debug(`Performance measurement skipped for ${componentName}`);
        }
      }
    }
  });
}

/**
 * Hook for debouncing values (performance optimization for search, etc.)
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for throttling function calls
 */
export function useThrottle(callback, delay) {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
}

/**
 * Hook for intersection observer (lazy loading, infinite scroll)
 */
export function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState(null);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      setEntry(entry);
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options]);

  return [elementRef, isIntersecting, entry];
}

/**
 * Hook for measuring API call performance
 */
export function useApiPerformance() {
  const measureApiCall = useCallback(async (apiCall, operationName) => {
    const startTime = Date.now();
    
    try {
      const result = await apiCall();
      const duration = Date.now() - startTime;
      
      // Log slow API calls
      if (duration > 2000) {
        console.warn(`Slow API call: ${operationName} took ${duration}ms`);
      }
      
      // Performance measurement
      if (window.performance && window.performance.mark) {
        window.performance.mark(`api-${operationName}-end`);
        window.performance.measure(
          `api-${operationName}`,
          `api-${operationName}-start`,
          `api-${operationName}-end`
        );
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`API call failed: ${operationName} (${duration}ms)`, error);
      throw error;
    }
  }, []);

  return { measureApiCall };
}

/**
 * Hook for memory usage monitoring
 */
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState(null);

  useEffect(() => {
    const checkMemory = () => {
      if (window.performance && window.performance.memory) {
        const memory = window.performance.memory;
        setMemoryInfo({
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) // MB
        });
      }
    };

    checkMemory();
    const interval = setInterval(checkMemory, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}

/**
 * Hook for image lazy loading
 */
export function useLazyImage(src, placeholder = '') {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [ref, isIntersecting] = useIntersectionObserver();

  useEffect(() => {
    if (isIntersecting && src) {
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      
      img.onerror = () => {
        setIsError(true);
      };
      
      img.src = src;
    }
  }, [isIntersecting, src]);

  return { ref, imageSrc, isLoaded, isError };
}