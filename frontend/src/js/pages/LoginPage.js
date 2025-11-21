/**
 * LOGIN PAGE - Vanilla JavaScript Implementation
 * Modern authentication with beautiful design
 */

class LoginPage {
  constructor() {
    this.loading = false;
  }
  
  render() {
    return `
      <div class="login-container">
        <div class="login-card slide-down">
          <div class="login-header">
            <div class="brand-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3l9 7h-3v9h-5v-6H11v6H6v-9H3z"/>
              </svg>
            </div>
            <h1 class="login-title">Rentacloud</h1>
            <p class="login-subtitle">Hisobotlarga kirish uchun tizimga kiring</p>
          </div>
          
          <form id="login-form" class="login-form">
            <div class="form-group">
              <label class="form-label">Foydalanuvchi nomi</label>
              <input type="text" name="username" class="form-input" placeholder="admin" required>
            </div>
            
            <div class="form-group">
              <label class="form-label">Parol</label>
              <input type="password" name="password" class="form-input" placeholder="••••••••" required>
            </div>
            
            <div id="error-message" class="error-message hidden"></div>
            
            <button type="submit" class="btn btn-primary" id="login-btn">
              <span class="btn-text">Kirish</span>
              <span class="btn-loading hidden">
                <div class="spinner-small"></div>
                Tekshirilmoqda...
              </span>
            </button>
          </form>
          
          <div class="login-footer">
            <p class="text-muted">
              Demo: admin / admin
            </p>
          </div>
        </div>
      </div>
    `;
  }
  
  afterRender() {
    this.bindEvents();
    window.utils.addEntranceAnimation('.login-card', 300);
    
    // Focus on username input
    setTimeout(() => {
      const usernameInput = document.querySelector('input[name="username"]');
      if (usernameInput) {
        usernameInput.focus();
      }
    }, 400);
  }
  
  bindEvents() {
    const form = document.getElementById('login-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }
  
  async handleSubmit(e) {
    e.preventDefault();
    
    if (this.loading) return;
    
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');
    
    this.setLoading(true);
    this.hideError();
    
    try {
      const response = await window.api.login(username, password);
      
      if (response.token) {
        window.auth.setToken(response.token);
        window.notifications.success('Muvaffaqiyatli kirildi!');
        
        // Navigate to reports page
        setTimeout(() => {
          window.router.navigateTo('/report');
        }, 500);
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showError(error.message || 'Kirish ma\'lumotlari noto\'g\'ri');
    } finally {
      this.setLoading(false);
    }
  }
  
  setLoading(loading) {
    this.loading = loading;
    const btn = document.getElementById('login-btn');
    const btnText = btn?.querySelector('.btn-text');
    const btnLoading = btn?.querySelector('.btn-loading');
    
    if (btn) {
      btn.disabled = loading;
      btn.classList.toggle('loading', loading);
    }
    
    if (btnText && btnLoading) {
      if (loading) {
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
      } else {
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');
      }
    }
  }
  
  showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.remove('hidden');
    }
  }
  
  hideError() {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
      errorElement.classList.add('hidden');
    }
  }
}

// Export for global usage
window.LoginPage = LoginPage;