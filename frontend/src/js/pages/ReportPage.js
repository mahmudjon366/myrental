/**
 * REPORT PAGE - Vanilla JavaScript Implementation
 * Protected analytics and reporting dashboard
 */

class ReportPage {
  constructor() {
    this.rentals = [];
    this.products = [];
    this.loading = true;
    this.stats = {
      totalRevenue: 0,
      monthlyRevenue: 0,
      totalRentals: 0,
      activeRentals: 0,
      totalProducts: 0,
      averageRentalDuration: 0
    };
  }
  
  async render() {
    // Check authentication
    if (!window.auth.isAuthenticated()) {
      window.router.navigateTo('/login');
      return '<div>Tizimga kirish talab qilinadi...</div>';
    }
    
    await this.loadData();
    
    return `
      <div class="page-header slide-down">
        <div class="page-header-content">
          <h1 class="page-title">
            <span class="page-icon">📊</span>
            Hisobotlar
          </h1>
          <p class="page-description">Biznes statistikangiz va daromadlaringiz haqida ma'lumot</p>
        </div>
        
        <div class="page-actions">
          <button class="btn secondary" id="refresh-btn">
            <span class="btn-icon">🔄</span>
            Yangilash
          </button>
          <button class="btn danger" id="logout-btn">
            <span class="btn-icon">🚪</span>
            Chiqish
          </button>
        </div>
      </div>
      
      <div id="reports-container">
        ${this.loading ? this.createLoadingState() : this.renderReportsContent()}
      </div>
    `;
  }
  
  async afterRender() {
    this.bindEvents();
    window.utils.addEntranceAnimation('.page-header', 200);
    window.utils.addEntranceAnimation('.stats-grid', 400);
    window.utils.addEntranceAnimation('.content-card', 600);
  }
  
  bindEvents() {
    const refreshBtn = document.getElementById('refresh-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadData());
    }
    
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }
  }
  
  async loadData() {
    try {
      this.loading = true;
      this.updateReportsContainer();
      
      const [products, rentals] = await Promise.all([
        window.api.listProducts(),
        window.api.listRentals()
      ]);
      
      this.products = products;
      this.rentals = rentals;
      this.calculateStats();
      this.loading = false;
      this.updateReportsContainer();
    } catch (error) {
      this.loading = false;
      console.error('Failed to load reports:', error);
      
      if (error.status === 401 || error.status === 403) {
        window.notifications.error('Sizda bu sahifaga kirish huquqi yo\'q');
        window.router.navigateTo('/login');
      } else {
        window.notifications.error('Hisobotlarni yuklashda xatolik yuz berdi');
      }
    }
  }
  
  updateReportsContainer() {
    const container = document.getElementById('reports-container');
    if (!container) return;
    
    container.innerHTML = this.loading ? this.createLoadingState() : this.renderReportsContent();
  }
  
  calculateStats() {
    // Total revenue
    this.stats.totalRevenue = this.rentals
      .filter(r => r.totalPrice)
      .reduce((sum, r) => sum + r.totalPrice, 0);
    
    // Monthly revenue (current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    this.stats.monthlyRevenue = this.rentals
      .filter(r => {
        if (!r.returnDate || !r.totalPrice) return false;
        const returnDate = new Date(r.returnDate);
        return returnDate.getMonth() === currentMonth && returnDate.getFullYear() === currentYear;
      })
      .reduce((sum, r) => sum + r.totalPrice, 0);
    
    // Other stats
    this.stats.totalRentals = this.rentals.length;
    this.stats.activeRentals = this.rentals.filter(r => !r.returnDate).length;
    this.stats.totalProducts = this.products.length;
    
    // Average rental duration
    const completedRentals = this.rentals.filter(r => r.totalDays);
    this.stats.averageRentalDuration = completedRentals.length > 0
      ? Math.round(completedRentals.reduce((sum, r) => sum + r.totalDays, 0) / completedRentals.length)
      : 0;
  }
  
  renderReportsContent() {
    return `
      <!-- Key Metrics -->
      <div class="stats-grid">
        <div class="stat-card primary fade-in">
          <div class="stat-header">
            <div class="stat-icon">💰</div>
            <div class="stat-trend positive">+12%</div>
          </div>
          <div class="stat-number">${window.utils.formatCurrency(this.stats.totalRevenue)}</div>
          <div class="stat-label">Jami daromad</div>
        </div>
        
        <div class="stat-card success fade-in" style="animation-delay: 100ms;">
          <div class="stat-header">
            <div class="stat-icon">📅</div>
            <div class="stat-trend positive">+8%</div>
          </div>
          <div class="stat-number">${window.utils.formatCurrency(this.stats.monthlyRevenue)}</div>
          <div class="stat-label">Joriy oy daromadi</div>
        </div>
        
        <div class="stat-card info fade-in" style="animation-delay: 200ms;">
          <div class="stat-header">
            <div class="stat-icon">📋</div>
            <div class="stat-trend">${this.stats.activeRentals} faol</div>
          </div>
          <div class="stat-number">${this.stats.totalRentals}</div>
          <div class="stat-label">Jami ijaralar</div>
        </div>
        
        <div class="stat-card warning fade-in" style="animation-delay: 300ms;">
          <div class="stat-header">
            <div class="stat-icon">⏱️</div>
            <div class="stat-trend">o'rtacha</div>
          </div>
          <div class="stat-number">${this.stats.averageRentalDuration}</div>
          <div class="stat-label">Kun (davomiyligi)</div>
        </div>
      </div>
      
      <!-- Detailed Analytics -->
      <div class="reports-content">
        <div class="content-card fade-in" style="animation-delay: 400ms;">
          <h3 class="card-title">
            <span class="card-icon">📊</span>
            Top mahsulotlar
          </h3>
          ${this.renderTopProducts()}
        </div>
        
        <div class="content-card fade-in" style="animation-delay: 500ms;">
          <h3 class="card-title">
            <span class="card-icon">👥</span>
            Faol mijozlar
          </h3>
          ${this.renderActiveClients()}
        </div>
        
        <div class="content-card fade-in" style="animation-delay: 600ms;">
          <h3 class="card-title">
            <span class="card-icon">💡</span>
            Tavsiyalar
          </h3>
          ${this.renderRecommendations()}
        </div>
      </div>
    `;
  }
  
  renderTopProducts() {
    const productStats = this.products.map(product => {
      const productRentals = this.rentals.filter(r => r.productId === product._id);
      const revenue = productRentals
        .filter(r => r.totalPrice)
        .reduce((sum, r) => sum + r.totalPrice, 0);
      
      return {
        ...product,
        rentalCount: productRentals.length,
        revenue: revenue
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
    
    if (productStats.length === 0) {
      return '<div class="empty-message">Mahsulotlar mavjud emas</div>';
    }
    
    return `
      <div class="top-products">
        ${productStats.map((product, index) => `
          <div class="product-stat-item">
            <div class="product-rank">#${index + 1}</div>
            <div class="product-details">
              <div class="product-name">${product.name}</div>
              <div class="product-metrics">
                ${product.rentalCount} ijara • ${window.utils.formatCurrency(product.revenue)} daromad
              </div>
            </div>
            <div class="product-revenue">${window.utils.formatCurrency(product.dailyPrice)}/kun</div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  renderActiveClients() {
    const activeClients = this.rentals
      .filter(r => !r.returnDate)
      .map(rental => {
        const product = this.products.find(p => p._id === rental.productId);
        return {
          ...rental,
          productName: product?.name || 'Noma\'lum'
        };
      })
      .slice(0, 5);
    
    if (activeClients.length === 0) {
      return '<div class="empty-message">Faol mijozlar yo\'q</div>';
    }
    
    return `
      <div class="active-clients">
        ${activeClients.map(client => `
          <div class="client-item">
            <div class="client-avatar">👤</div>
            <div class="client-details">
              <div class="client-name">${client.clientName}</div>
              <div class="client-rental">${client.productName}</div>
            </div>
            <div class="client-duration">
              ${this.calculateActiveDuration(client.startDate)} kun
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  renderRecommendations() {
    const recommendations = [];
    
    // Low stock recommendation
    if (this.stats.activeRentals > this.stats.totalProducts * 0.8) {
      recommendations.push({
        type: 'warning',
        title: 'Mahsulot qo\'shing',
        description: 'Faol ijaralar soni yuqori. Yangi mahsulotlar qo\'shishni o\'ylab ko\'ring.'
      });
    }
    
    // Revenue opportunity
    if (this.stats.monthlyRevenue < this.stats.totalRevenue * 0.2) {
      recommendations.push({
        type: 'info',
        title: 'Marketing kampaniyasi',
        description: 'Bu oyning daromadi past. Marketing faoliyatini kuchaytiring.'
      });
    }
    
    // Default recommendation
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        title: 'Ajoyib natija!',
        description: 'Biznesingiz yaxshi rivojlanmoqda. Davom eting!'
      });
    }
    
    return `
      <div class="recommendations">
        ${recommendations.map(rec => `
          <div class="recommendation-item ${rec.type}">
            <div class="recommendation-icon">
              ${rec.type === 'warning' ? '⚠️' : rec.type === 'info' ? '💡' : '🎉'}
            </div>
            <div class="recommendation-content">
              <div class="recommendation-title">${rec.title}</div>
              <div class="recommendation-description">${rec.description}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  calculateActiveDuration(startDate) {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  handleLogout() {
    window.modal.confirm(
      'Tizimdan chiqish',
      'Haqiqatan ham tizimdan chiqmoqchimisiz?',
      () => {
        window.auth.logout();
        window.notifications.success('Tizimdan muvaffaqiyatli chiqdingiz');
        window.router.navigateTo('/');
      }
    );
  }
  
  createLoadingState() {
    return `
      <div class="stats-grid">
        ${Array(4).fill().map(() => `
          <div class="stat-card skeleton">
            <div class="stat-header">
              <div class="skeleton skeleton-icon"></div>
              <div class="skeleton skeleton-text"></div>
            </div>
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text"></div>
          </div>
        `).join('')}
      </div>
      
      <div class="reports-content">
        ${Array(3).fill().map(() => `
          <div class="content-card skeleton">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-content"></div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

// Export for global usage
window.ReportPage = ReportPage;