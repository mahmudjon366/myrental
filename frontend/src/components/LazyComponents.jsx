import { lazy, Suspense } from 'react';

// Loading component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
    fontSize: '1.1rem',
    color: '#666'
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
      <div style={{
        width: '20px',
        height: '20px',
        border: '2px solid #f3f3f3',
        borderTop: '2px solid #5b8cff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      Yuklanmoqda...
    </div>
  </div>
);

// Lazy loaded components
export const LazyProductsPage = lazy(() => import('../pages/ProductsPage_clean.jsx'));
export const LazyAddProductPage = lazy(() => import('../pages/AddProductPage.jsx'));
export const LazyHistoryPage = lazy(() => import('../pages/HistoryPage.jsx'));
export const LazyReportPage = lazy(() => import('../pages/ReportPage.jsx'));
export const LazyReportLoginPage = lazy(() => import('../pages/ReportLoginPage.jsx'));
export const LazyProtectedReportPage = lazy(() => import('../pages/ProtectedReportPage.jsx'));

// HOC for wrapping lazy components with Suspense
export const withSuspense = (Component, fallback = <LoadingSpinner />) => {
  return (props) => (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
};

// Pre-wrapped components ready to use
export const ProductsPage = withSuspense(LazyProductsPage);
export const AddProductPage = withSuspense(LazyAddProductPage);
export const HistoryPage = withSuspense(LazyHistoryPage);
export const ReportPage = withSuspense(LazyReportPage);
export const ReportLoginPage = withSuspense(LazyReportLoginPage);
export const ProtectedReportPage = withSuspense(LazyProtectedReportPage);