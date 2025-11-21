import React, { useEffect, lazy, Suspense, memo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './styles.css';
import './premium-styles.css';
import { FaPhone } from 'react-icons/fa';
import Navbar from './components/Navbar.jsx';
import { I18nProvider } from './lib/i18n.jsx';
import { initAllScrollEffects } from './lib/scrollEffects.js';
import { useRenderPerformance } from './hooks/usePerformance.js';
import PerformanceMonitor from './components/PerformanceMonitor.jsx';

// Lazy load pages for better performance
const ProductsPage = lazy(() => import('./pages/ProductsPage.jsx'));
const RentalsPage = lazy(() => import('./pages/RentalsPage.jsx'));
const HistoryPage = lazy(() => import('./pages/HistoryPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const ReportPage = lazy(() => import('./pages/ReportPage.jsx'));
const ProtectedReportPage = lazy(() => import('./pages/ProtectedReportPage.jsx'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.jsx'));
const StartRentalPage = lazy(() => import('./pages/StartRentalPage.jsx'));
const AddProductPage = lazy(() => import('./pages/AddProductPage.jsx'));

// Loading component
const PageLoader = memo(() => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    fontSize: '1.1rem',
    color: '#666'
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    }}>
      <div style={{
        width: '24px',
        height: '24px',
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #5b8cff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      Sahifa yuklanmoqda...
    </div>
  </div>
));


const AppLayout = memo(({ children }) => {
  // Only use performance monitoring in production
  if (import.meta.env.PROD) {
    useRenderPerformance('AppLayout');
  }
  
  return (
    <div className="app-container animate-fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main className="main-content" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <div className="premium-scroll-reveal">
          <Suspense fallback={<PageLoader />}>
            {children}
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
});

const Footer = memo(() => {
  return (
    <footer style={{ 
      marginTop: 'auto',
      background: '#f8fafc',
      borderTop: '1px solid #e2e8f0',
      padding: '2rem 0'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          color: '#64748b',
          fontSize: '0.875rem'
        }}>
          <span style={{ fontWeight: '600', color: '#1e293b' }}>
            © 2025 Rentacloud
          </span>
          <span>•</span>
          <span>Barcha huquqlar himoyalangan</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          fontSize: '0.875rem'
        }}>
          <a 
            href="tel:+998919752757" 
            style={{ 
              color: '#64748b',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FaPhone /> +998 91 975 27 57
          </a>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <span style={{ color: '#64748b' }}>
            ProX tomonidan ishlab chiqilgan
          </span>
        </div>
      </div>
    </footer>
  );
});

// Add window controls for Electron
if (window.electron) {
  window.electron.onWindowControls((action) => {
    switch (action) {
      case 'minimize':
        window.electron.minimizeWindow();
        break;
      case 'maximize':
        window.electron.maximizeWindow();
        break;
      case 'close':
        window.electron.closeWindow();
        break;
    }
  });
}

export default function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isPrivacyPage = location.pathname === '/privacy';
  
  // Only use performance monitoring in production
  if (import.meta.env.PROD) {
    useRenderPerformance('App');
  }

  // Initialize scroll effects on mount
  useEffect(() => {
    initAllScrollEffects();
  }, []);

  // Preload critical pages
  useEffect(() => {
    if (!isLoginPage && !isPrivacyPage) {
      // Preload ProductsPage since it's the main page
      import('./pages/ProductsPage.jsx');
    }
  }, [isLoginPage, isPrivacyPage]);

  return (
    <I18nProvider>
      <div className="app">
        <PerformanceMonitor />
        
        {isLoginPage || isPrivacyPage ? (
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
            </Routes>
          </Suspense>
        ) : (
          <AppLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/products" replace />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/add-product" element={<AddProductPage />} />
              <Route path="/rentals" element={<RentalsPage />} />
              <Route path="/start-rental" element={<StartRentalPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/report-login" element={<ProtectedReportPage />} />
              <Route path="/report" element={<ReportPage />} />
            </Routes>
          </AppLayout>
        )}
      </div>
    </I18nProvider>
  );
}