/**
 * RENTACLOUD - MAIN APPLICATION
 * Modern SPA initialization and routing
 */

class RentacloudApp {
  constructor() {
    console.log('🎆 RentacloudApp constructor');
    this.pages = {
      '/': () => new HomePage().render(),
      '/products': () => new ProductsPage().render(),
      '/rentals': () => new RentalsPage().render(),
      '/history': () => new HistoryPage().render(),
      '/login': () => new LoginPage().render(),
      '/report': () => new ReportPage().render()
    };
    
    this.currentScript = 'latin';
    this.init();
  }
  
  init() {
    console.log('🎆 App initializing...');
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }
  
  setup() {
    console.log('🎆 App setup starting...');
    
    // Check if all required globals are available
    if (!window.router) {
      console.error('❌ Router not available');
      return;
    }
    if (!window.notifications) {
      console.error('❌ Notifications not available');
      return;
    }
    if (!window.modal) {
      console.error('❌ Modal not available');
      return;
    }
    
    console.log('✅ All dependencies available');
    
    this.setupRoutes();
    this.setupNavigation();
    this.setupGlobalEvents();
    this.hideLoadingScreen();
    
    // Initial route load
    console.log('🎆 Loading initial route...');
    window.router.handleRouteChange();
    
    console.log('✅ App setup complete!');
  }
  
  setupRoutes() {
    console.log('🗺️ Setting up routes...');
    // Add all routes to router
    Object.entries(this.pages).forEach(([path, handler]) => {
      const requiresAuth = path === '/report';
      console.log(`✨ Adding route: ${path} (auth: ${requiresAuth})`);
      window.router.addRoute(path, handler, { requiresAuth });
    });
    console.log('✅ Routes setup complete');
  }
  
  getPageNameFromPath(path) {
    const pathMap = {
      '/': 'HomePage',
      '/products': 'ProductsPage',
      '/rentals': 'RentalsPage',
      '/history': 'HistoryPage',
      '/login': 'LoginPage',
      '/report': 'ReportPage'
    };
    return pathMap[path] || null;
  }
  
  setupNavigation() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const navigation = document.getElementById('navigation');
    
    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('show');
        navigation.classList.toggle('mobile-menu-open');
      });
      
      // Close mobile menu when clicking on a link
      navLinks.addEventListener('click', (e) => {
        if (e.target.classList.contains('nav-link')) {
          navLinks.classList.remove('show');
          navigation.classList.remove('mobile-menu-open');
        }
      });
      
      // Close mobile menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!navigation.contains(e.target)) {
          navLinks.classList.remove('show');
          navigation.classList.remove('mobile-menu-open');
        }
      });
    }
    
    // Script toggle (Latin/Cyrillic)
    const scriptToggle = document.getElementById('script-toggle');
    if (scriptToggle) {
      scriptToggle.addEventListener('click', () => this.toggleScript());
    }
    
    // Scroll effects for navigation
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      const navigation = document.getElementById('navigation');
      
      if (navigation) {
        if (currentScrollY > 50) {
          navigation.classList.add('scrolled');
        } else {
          navigation.classList.remove('scrolled');
        }
        
        // Hide/show navigation on scroll (mobile)
        if (window.innerWidth <= 768) {
          if (currentScrollY > lastScrollY && currentScrollY > 100) {
            navigation.style.transform = 'translateY(-100%)';
          } else {
            navigation.style.transform = 'translateY(0)';
          }
        }
      }
      
      lastScrollY = currentScrollY;
    });
  }
  
  setupGlobalEvents() {
    // Handle errors globally
    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error);
      window.notifications.error('Kutilmagan xatolik yuz berdi');
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason);
      e.preventDefault();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K for search (if implemented)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Implement global search if needed
      }
      
      // ESC to close modals
      if (e.key === 'Escape') {
        const modal = document.getElementById('modal-overlay');
        if (modal && modal.classList.contains('show')) {
          window.modal.hide();
        }
      }
    });
    
    // Add smooth scrolling to all internal links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (link) {
        e.preventDefault();
        const href = link.getAttribute('href');
        
        if (href === '#' || href === '#/') {
          window.router.navigateTo('/');
        } else if (href.startsWith('#/')) {
          window.router.navigateTo(href.slice(1));
        }
      }
    });
  }
  
  toggleScript() {
    this.currentScript = this.currentScript === 'latin' ? 'cyrillic' : 'latin';
    const scriptText = document.getElementById('script-text');
    
    if (scriptText) {
      scriptText.textContent = this.currentScript === 'latin' ? 'Кирилл' : 'Lotin';
    }
    
    // Store preference
    window.utils.storage.set('preferred_script', this.currentScript);
    
    // Apply script changes (if implemented)
    this.applyScriptChanges();
  }
  
  applyScriptChanges() {
    // This would implement transliteration between Latin and Cyrillic
    // For now, just show a notification
    window.notifications.info(
      `Yozuv tizimi ${this.currentScript === 'latin' ? 'Lotinga' : 'Kirillga'} o'zgartirildi`
    );
  }
  
  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
        // Remove from DOM after animation
        setTimeout(() => {
          loadingScreen.remove();
        }, 500);
      }, 1000);
    }
  }
  
  // Add page transition effects
  addPageTransition() {
    const container = document.getElementById('page-container');
    if (container) {
      container.style.opacity = '0';
      container.style.transform = 'translateY(20px)';
      
      requestAnimationFrame(() => {
        container.style.transition = 'all 0.3s ease';
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
      });
    }
  }
  
  // Utility method to show offline status
  handleOfflineStatus() {
    window.addEventListener('online', () => {
      window.notifications.success('Internet aloqasi tiklandi');
    });
    
    window.addEventListener('offline', () => {
      window.notifications.warning('Internet aloqasi yo\'q');
    });
  }
}

// Initialize app when DOM is ready
const app = new RentacloudApp();

// Make app globally available for debugging
window.app = app;

// Service Worker registration (if available)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RentacloudApp;
}

console.log('🚀 Rentacloud initialized successfully!');
console.log('💡 Tip: All app components are available in window object for debugging');