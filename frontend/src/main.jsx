import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './modern-styles.css';
import { I18nProvider } from './lib/i18n.jsx';
import { initAllScrollEffects } from './lib/scrollEffects.js';

// Guard: silence legacy global notification/toast system if it exists (from old /src/js/* app)
try {
  if (typeof window !== 'undefined' && window.notifications) {
    const noop = (msg) => console.warn('[silenced-notification]', msg);
    window.notifications.error = noop;
    window.notifications.warning = noop;
    window.notifications.info = noop;
  }
  // Also neutralize legacy window.api that points to port 3001
  if (typeof window !== 'undefined' && window.api && window.api.baseURL && String(window.api.baseURL).includes('3001')) {
    console.warn('Disabling legacy window.api client bound to :3001');
    try { delete window.api; } catch { window.api = undefined; }
  }
} catch {}

// Network guard disabled - using direct API calls

// In dev, proactively unregister any existing Service Workers and clear caches.
// This fixes issues where an older PWA SW serves stale HTML/JS (legacy app) that points to :3001
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  (async () => {
    try {
      if (import.meta.env.DEV) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          try { await reg.unregister(); } catch {}
        }
        if (window.caches) {
          const keys = await caches.keys();
          for (const k of keys) {
            try { await caches.delete(k); } catch {}
          }
        }
        console.info('[SW] Unregistered all service workers and cleared caches in DEV');

        // If this page was previously controlled by a SW, force a one-time reload to flush stale assets
        try {
          if (navigator.serviceWorker.controller && !sessionStorage.getItem('reloadedAfterSWCleanup')) {
            sessionStorage.setItem('reloadedAfterSWCleanup', '1');
            window.location.reload();
          }
        } catch {}
      }
    } catch (e) {
      console.warn('[SW] cleanup failed:', e);
    }
  })();
}

// Initialize scroll effects
initAllScrollEffects();

const root = createRoot(document.getElementById('root'));
root.render(
  <I18nProvider>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </I18nProvider>
);



