/**
 * RENTACLOUD - UTILITY FUNCTIONS
 * Modern JavaScript utilities for enhanced user experience
 */

// DOM manipulation utilities
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Create element with attributes and children
const createElement = (tag, attributes = {}, ...children) => {
  const element = document.createElement(tag);
  
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'innerHTML') {
      element.innerHTML = value;
    } else if (key.startsWith('on') && typeof value === 'function') {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      element.setAttribute(key, value);
    }
  });
  
  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      element.appendChild(child);
    }
  });
  
  return element;
};

// Animation utilities
const fadeIn = (element, duration = 300) => {
  element.style.opacity = '0';
  element.style.display = 'block';
  
  let start = null;
  const animate = (timestamp) => {
    if (!start) start = timestamp;
    const progress = (timestamp - start) / duration;
    
    if (progress < 1) {
      element.style.opacity = progress;
      requestAnimationFrame(animate);
    } else {
      element.style.opacity = '1';
    }
  };
  
  requestAnimationFrame(animate);
};

const fadeOut = (element, duration = 300) => {
  let start = null;
  const animate = (timestamp) => {
    if (!start) start = timestamp;
    const progress = (timestamp - start) / duration;
    
    if (progress < 1) {
      element.style.opacity = 1 - progress;
      requestAnimationFrame(animate);
    } else {
      element.style.opacity = '0';
      element.style.display = 'none';
    }
  };
  
  requestAnimationFrame(animate);
};

// Slide animations
const slideDown = (element, duration = 300) => {
  element.style.height = '0';
  element.style.overflow = 'hidden';
  element.style.display = 'block';
  
  const targetHeight = element.scrollHeight;
  let start = null;
  
  const animate = (timestamp) => {
    if (!start) start = timestamp;
    const progress = (timestamp - start) / duration;
    
    if (progress < 1) {
      element.style.height = (targetHeight * progress) + 'px';
      requestAnimationFrame(animate);
    } else {
      element.style.height = 'auto';
      element.style.overflow = 'visible';
    }
  };
  
  requestAnimationFrame(animate);
};

const slideUp = (element, duration = 300) => {
  const startHeight = element.scrollHeight;
  element.style.height = startHeight + 'px';
  element.style.overflow = 'hidden';
  
  let start = null;
  const animate = (timestamp) => {
    if (!start) start = timestamp;
    const progress = (timestamp - start) / duration;
    
    if (progress < 1) {
      element.style.height = (startHeight * (1 - progress)) + 'px';
      requestAnimationFrame(animate);
    } else {
      element.style.height = '0';
      element.style.display = 'none';
      element.style.overflow = 'visible';
    }
  };
  
  requestAnimationFrame(animate);
};

// Notification system
class NotificationManager {
  constructor() {
    this.container = $('#notifications');
    this.notifications = new Set();
  }
  
  show(message, type = 'info', duration = 5000) {
    const notification = createElement('div', {
      className: `notification ${type}`,
      innerHTML: `
        <div style=\"display: flex; align-items: center; justify-content: space-between;\">
          <span>${message}</span>
          <button class=\"notification-close\" style=\"background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.2rem; margin-left: 1rem;\">&times;</button>
        </div>
      `
    });
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => this.remove(notification));
    
    this.container.appendChild(notification);
    this.notifications.add(notification);
    
    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        if (this.notifications.has(notification)) {
          this.remove(notification);
        }
      }, duration);
    }
    
    return notification;
  }
  
  remove(notification) {
    if (this.notifications.has(notification)) {
      notification.style.transform = 'translateX(100%)';
      notification.style.opacity = '0';
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
        this.notifications.delete(notification);
      }, 300);
    }
  }
  
  success(message, duration) {
    return this.show(message, 'success', duration);
  }
  
  error(message, duration) {
    return this.show(message, 'error', duration);
  }
  
  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }
  
  info(message, duration) {
    return this.show(message, 'info', duration);
  }
  
  clear() {
    this.notifications.forEach(notification => this.remove(notification));
  }
}

// Modal system
class ModalManager {
  constructor() {
    this.overlay = $('#modal-overlay');
    this.modal = $('#modal');
    this.title = $('#modal-title');
    this.body = $('#modal-body');
    this.footer = $('#modal-footer');
    this.closeBtn = $('#modal-close');
    
    this.closeBtn.addEventListener('click', () => this.hide());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.hide();
      }
    });
    
    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible()) {
        this.hide();
      }
    });
  }
  
  show(title, content, actions = []) {
    this.title.textContent = title;
    
    if (typeof content === 'string') {
      this.body.innerHTML = content;
    } else if (content instanceof Node) {
      this.body.innerHTML = '';
      this.body.appendChild(content);
    }
    
    // Clear and add footer actions
    this.footer.innerHTML = '';
    actions.forEach(action => {
      const btn = createElement('button', {
        className: `btn ${action.class || ''}`,
        onclick: action.handler
      }, action.text);
      this.footer.appendChild(btn);
    });
    
    this.overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    return this;
  }
  
  hide() {
    this.overlay.classList.remove('show');
    document.body.style.overflow = '';
    return this;
  }
  
  isVisible() {
    return this.overlay.classList.contains('show');
  }
  
  confirm(title, message, onConfirm, onCancel) {
    return this.show(title, message, [
      {
        text: 'Cancel',
        class: 'secondary',
        handler: () => {
          this.hide();
          if (onCancel) onCancel();
        }
      },
      {
        text: 'Confirm',
        class: 'danger',
        handler: () => {
          this.hide();
          if (onConfirm) onConfirm();
        }
      }
    ]);
  }
}

// Loading manager
class LoadingManager {
  constructor() {
    this.activeLoaders = new Set();
  }
  
  show(target = document.body, text = 'Loading...') {
    const loader = createElement('div', {
      className: 'loading-overlay',
      style: 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 9999;',
      innerHTML: `
        <div class=\"loading-spinner\">
          <div class=\"spinner\"></div>
          <p>${text}</p>
        </div>
      `
    });
    
    target.style.position = 'relative';
    target.appendChild(loader);
    this.activeLoaders.add(loader);
    
    return {
      hide: () => {
        if (loader.parentNode) {
          loader.parentNode.removeChild(loader);
        }
        this.activeLoaders.delete(loader);
      }
    };
  }
  
  hideAll() {
    this.activeLoaders.forEach(loader => {
      if (loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
    });
    this.activeLoaders.clear();
  }
}

// Form validation utilities
const validateForm = (form) => {
  const errors = [];
  const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
  
  inputs.forEach(input => {
    if (!input.value.trim()) {
      errors.push(`${input.name || input.id} is required`);
      input.classList.add('error');
    } else {
      input.classList.remove('error');
    }
    
    // Email validation
    if (input.type === 'email' && input.value) {
      const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      if (!emailRegex.test(input.value)) {
        errors.push('Please enter a valid email address');
        input.classList.add('error');
      }
    }
    
    // Number validation
    if (input.type === 'number' && input.value) {
      const num = parseFloat(input.value);
      if (isNaN(num)) {
        errors.push(`${input.name || input.id} must be a valid number`);
        input.classList.add('error');
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Debounce utility
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle utility
const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Format currency
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Format date
const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(new Date(date));
};

// Local storage utilities
const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error getting from localStorage:', error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error setting to localStorage:', error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

// Global instances
window.notifications = new NotificationManager();
window.modal = new ModalManager();
window.loading = new LoadingManager();

// Export utilities
// Global instances
const notificationManager = new NotificationManager();
const modalManager = new ModalManager();
const loadingManager = new LoadingManager();

// Animation helpers
const addEntranceAnimation = (selector, delay = 0) => {
  const elements = typeof selector === 'string' ? $$(selector) : [selector];
  elements.forEach((el, index) => {
    if (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      setTimeout(() => {
        el.style.transition = 'all 0.6s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, delay + (index * 100));
    }
  });
};

// Export everything to global scope
window.utils = {
  $,
  $$,
  createElement,
  fadeIn,
  fadeOut,
  slideDown,
  slideUp,
  validateForm,
  debounce,
  throttle,
  formatCurrency,
  formatDate,
  storage,
  addEntranceAnimation,
  NotificationManager,
  ModalManager,
  LoadingManager
};

// Global instances for easy access
window.notifications = notificationManager;
window.modal = modalManager;
window.loading = loadingManager;