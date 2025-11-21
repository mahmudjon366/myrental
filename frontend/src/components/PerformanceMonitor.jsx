import { useEffect, useState } from 'react';
import { useMemoryMonitor } from '../hooks/usePerformance.js';

/**
 * Performance monitoring component (only shows in development)
 */
export default function PerformanceMonitor() {
  const [isVisible, setIsVisible] = useState(false);
  const [performanceData, setPerformanceData] = useState({});
  const memoryInfo = useMemoryMonitor();

  // Only show in development
  useEffect(() => {
    setIsVisible(import.meta.env.DEV && import.meta.env.VITE_DEBUG === 'true');
  }, []);

  // Collect performance data
  useEffect(() => {
    if (!isVisible) return;

    const collectData = () => {
      const navigation = window.performance.getEntriesByType('navigation')[0];
      const paint = window.performance.getEntriesByType('paint');
      
      setPerformanceData({
        // Navigation timing
        domContentLoaded: Math.round(navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart) || 0,
        loadComplete: Math.round(navigation?.loadEventEnd - navigation?.loadEventStart) || 0,
        
        // Paint timing
        firstPaint: Math.round(paint.find(p => p.name === 'first-paint')?.startTime) || 0,
        firstContentfulPaint: Math.round(paint.find(p => p.name === 'first-contentful-paint')?.startTime) || 0,
        
        // Connection info
        connectionType: navigator.connection?.effectiveType || 'unknown',
        
        // Current timestamp
        timestamp: new Date().toLocaleTimeString()
      });
    };

    collectData();
    const interval = setInterval(collectData, 5000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      minWidth: '200px',
      maxHeight: '300px',
      overflow: 'auto'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
        🔍 Performance Monitor
      </div>
      
      {/* Memory Usage */}
      {memoryInfo && (
        <div style={{ marginBottom: '5px' }}>
          <div>💾 Memory:</div>
          <div>Used: {memoryInfo.used}MB</div>
          <div>Total: {memoryInfo.total}MB</div>
          <div>Limit: {memoryInfo.limit}MB</div>
        </div>
      )}
      
      {/* Performance Metrics */}
      <div style={{ marginBottom: '5px' }}>
        <div>⚡ Performance:</div>
        <div>DOM: {performanceData.domContentLoaded}ms</div>
        <div>Load: {performanceData.loadComplete}ms</div>
        <div>FP: {performanceData.firstPaint}ms</div>
        <div>FCP: {performanceData.firstContentfulPaint}ms</div>
      </div>
      
      {/* Connection Info */}
      <div style={{ marginBottom: '5px' }}>
        <div>🌐 Connection: {performanceData.connectionType}</div>
      </div>
      
      {/* Last Update */}
      <div style={{ fontSize: '10px', opacity: 0.7 }}>
        Updated: {performanceData.timestamp}
      </div>
      
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(false)}
        style={{
          position: 'absolute',
          top: '2px',
          right: '5px',
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        ×
      </button>
    </div>
  );
}