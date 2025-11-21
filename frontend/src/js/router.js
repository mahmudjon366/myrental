/**
 * RENTACLOUD - VANILLA JS ROUTER
 * Modern SPA routing without dependencies
 */

class Router {
  constructor() {
    this.routes = new Map();
    this.middlewares = [];
    this.currentRoute = null;
    this.history = [];
    
    // Initialize router
    this.init();
  }
  
  init() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => this.handleRouteChange());
    window.addEventListener('load', () => this.handleRouteChange());
    
    // Handle back/forward buttons
    window.addEventListener('popstate', (e) => {
      if (e.state) {
        this.navigateTo(e.state.path, false);
      }
    });
  }
  
  // Add a route
  addRoute(path, handler, options = {}) {
    this.routes.set(path, {
      handler,
      name: options.name,
      requiresAuth: options.requiresAuth || false,
      meta: options.meta || {}
    });
    return this;
  }
  
  // Add middleware
  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }
  
  // Get current path from hash
  getCurrentPath() {
    const hash = window.location.hash;
    return hash ? hash.slice(1) : '/';
  }
  
  // Navigate to a route
  navigateTo(path, pushState = true) {
    if (pushState) {
      window.location.hash = path === '/' ? '' : path;
      history.pushState({ path }, '', window.location.href);
    }
    
    this.handleRouteChange();
  }
  
  // Handle route changes
  async handleRouteChange() {
    const path = this.getCurrentPath();
    console.log('🗺️ Route change to:', path);
    const route = this.findRoute(path);
    
    if (!route) {
      console.log('❌ Route not found for:', path);
      this.handle404(path);
      return;
    }
    
    console.log('✅ Route found:', route);
    
    // Update navigation active states
    this.updateNavigation(path);
    
    try {
      // Run middlewares
      for (const middleware of this.middlewares) {
        const shouldContinue = await middleware(path, route);
        if (shouldContinue === false) {
          return; // Middleware blocked the navigation
        }
      }
      
      // Check authentication if required
      if (route.requiresAuth && !this.isAuthenticated()) {
        this.navigateTo('/login');
        return;
      }
      
      // Show loading state
      this.showLoading();
      
      // Execute route handler
      console.log('🚀 Executing route handler...');
      const content = await route.handler(this.extractParams(path));
      
      // Render content
      const container = document.getElementById('page-container');
      if (container && content) {
        container.innerHTML = content;
        
        // Call afterRender if the page has it
        const pageName = this.getPageNameFromPath(path);
        if (window[pageName] && typeof window[pageName].prototype.afterRender === 'function') {
          // Create temporary instance to call afterRender
          const tempInstance = new window[pageName]();
          if (tempInstance.afterRender) {
            tempInstance.afterRender();
          }
        }
      }
      
      // Update current route
      this.currentRoute = { path, route };
      
      // Add to history
      this.history.push({ path, timestamp: Date.now() });
      
      // Hide loading state
      this.hideLoading();
      
    } catch (error) {
      console.error('Route handling error:', error);
      this.handleError(error);
    }
  }
  
  // Find matching route
  findRoute(path) {
    // Direct match
    if (this.routes.has(path)) {
      return this.routes.get(path);
    }
    
    // Pattern matching for dynamic routes
    for (const [routePath, route] of this.routes) {
      if (this.matchRoute(routePath, path)) {
        return route;
      }
    }
    
    return null;
  }
  
  // Match route with parameters
  matchRoute(routePath, actualPath) {
    const routeParts = routePath.split('/');
    const actualParts = actualPath.split('/');
    
    if (routeParts.length !== actualParts.length) {
      return false;
    }
    
    return routeParts.every((part, index) => {
      return part.startsWith(':') || part === actualParts[index];
    });
  }
  
  // Extract parameters from path
  extractParams(path) {
    const params = {};
    
    for (const [routePath] of this.routes) {
      if (this.matchRoute(routePath, path)) {
        const routeParts = routePath.split('/');
        const actualParts = path.split('/');
        
        routeParts.forEach((part, index) => {
          if (part.startsWith(':')) {
            const paramName = part.slice(1);
            params[paramName] = actualParts[index];
          }
        });
        
        break;
      }
    }
    
    return params;
  }
  
  // Get page class name from path
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
  
  // Update navigation active states
  updateNavigation(currentPath) {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      const route = link.getAttribute('data-route');
      if (route === currentPath || (currentPath === '/' && route === '/')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  
  // Check if user is authenticated
  isAuthenticated() {
    return !!window.utils.storage.get('authToken');
  }
  
  // Show loading state
  showLoading() {
    const container = document.getElementById('page-container');
    if (container) {
      container.innerHTML = `
        <div class=\"loading-state\" style=\"display: flex; align-items: center; justify-content: center; min-height: 400px;\">
          <div class=\"loading-spinner\">
            <div class=\"spinner\"></div>
            <p>Sahifa yuklanmoqda...</p>
          </div>
        </div>
      `;
    }
  }
  
  // Hide loading state
  hideLoading() {
    // Loading state will be replaced by route content
  }
  
  // Handle 404 errors
  handle404(path) {
    const container = document.getElementById('page-container');
    if (container) {
      container.innerHTML = `
        <div class=\"error-page text-center\" style=\"padding: var(--space-12) var(--space-6);\">
          <div style=\"font-size: 4rem; margin-bottom: var(--space-4); opacity: 0.5;\">🔍</div>
          <h1 class=\"text-3xl font-bold mb-4\">Sahifa topilmadi</h1>
          <p class=\"text-lg text-muted mb-6\">Siz qidirayotgan sahifa mavjud emas yoki ko'chirilgan.</p>
          <p class=\"mb-6\"><strong>So'ralgan yo'l:</strong> <code>${path}</code></p>
          <a href=\"#/\" class=\"btn\">Bosh sahifaga qaytish</a>
        </div>
      `;
    }
  }
  
  // Handle errors
  handleError(error) {
    const container = document.getElementById('page-container');
    if (container) {
      container.innerHTML = `
        <div class=\"error-page text-center\" style=\"padding: var(--space-12) var(--space-6);\">
          <div style=\"font-size: 4rem; margin-bottom: var(--space-4); opacity: 0.5;\">⚠️</div>
          <h1 class=\"text-3xl font-bold mb-4\">Xatolik yuz berdi</h1>
          <p class=\"text-lg text-muted mb-6\">Sahifani yuklashda muammo bo'ldi. Iltimos, qayta urinib ko'ring.</p>
          <div class=\"mb-6\" style=\"background: var(--bg-elevated); padding: var(--space-4); border-radius: var(--radius-lg); text-align: left; max-width: 600px; margin: 0 auto;\">
            <strong>Xatolik tafsilotlari:</strong><br>
            <code style=\"color: var(--accent-red);\">${error.message}</code>
          </div>
          <div style=\"display: flex; gap: var(--space-4); justify-content: center; flex-wrap: wrap;\">
            <button onclick=\"location.reload()\" class=\"btn\">Sahifani yangilash</button>
            <a href=\"#/\" class=\"btn secondary\">Bosh sahifa</a>
          </div>
        </div>
      `;
    }
    
    // Show error notification
    window.notifications.error('Sahifani yuklashda xatolik yuz berdi');
  }
  
  // Go back in history
  back() {
    if (this.history.length > 1) {
      this.history.pop(); // Remove current
      const previous = this.history[this.history.length - 1];
      this.navigateTo(previous.path);
    } else {
      this.navigateTo('/');
    }
  }
  
  // Get route by name
  getRouteByName(name) {
    for (const [path, route] of this.routes) {
      if (route.name === name) {
        return { path, ...route };
      }
    }
    return null;
  }
  
  // Generate URL for named route
  generateUrl(name, params = {}) {
    const route = this.getRouteByName(name);
    if (!route) {
      throw new Error(`Route '${name}' not found`);
    }
    
    let url = route.path;
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value);
    });
    
    return url;
  }
}

// Initialize router
const router = new Router();

// Add authentication middleware
router.use(async (path, route) => {
  // Add any global middleware logic here
  return true; // Continue navigation
});

// Export router
window.router = router;