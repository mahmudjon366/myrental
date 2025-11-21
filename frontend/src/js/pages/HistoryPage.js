/**
 * HISTORY PAGE - Vanilla JavaScript Implementation
 * Display rental history with search and filtering
 */

class HistoryPage {
  constructor() {
    this.rentals = [];
    this.products = [];
    this.loading = true;
    this.searchTerm = '';
    this.filter = 'all'; // all, active, completed
  }
  
  async render() {
    await this.loadData();
    
    return `
      <div class="page-header slide-down">
        <div class="page-header-content">
          <h1 class="page-title">
            <span class="page-icon">📚</span>
            Ijara tarixi
          </h1>
          <p class="page-description">Barcha ijaralar va ularning tarixini ko'ring</p>
        </div>
        
        <div class="page-filters">
          <div class="search-box">
            <input type="text" id="search-input" class="search-input" placeholder="Mijoz yoki mahsulot bo'yicha qidiring...">
            <span class="search-icon">🔍</span>
          </div>
          
          <div class="filter-buttons">
            <button class="filter-btn active" data-filter="all">Barchasi</button>
            <button class="filter-btn" data-filter="active">Faol</button>
            <button class="filter-btn" data-filter="completed">Yakunlangan</button>
          </div>
        </div>
      </div>
      
      <div class="content-card">
        <div id="history-container">
          ${this.loading ? this.createLoadingState() : this.renderHistoryContent()}
        </div>
      </div>
    `;
  }
  
  async afterRender() {
    this.bindEvents();
    window.utils.addEntranceAnimation('.page-header', 200);
    window.utils.addEntranceAnimation('.content-card', 400);
  }
  
  bindEvents() {
    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value.toLowerCase();
        this.updateHistoryContainer();
      });
    }
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = e.target.getAttribute('data-filter');
        this.setFilter(filter);
      });
    });
  }
  
  setFilter(filter) {
    this.filter = filter;
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`)?.classList.add('active');
    
    this.updateHistoryContainer();
  }
  
  async loadData() {
    try {
      this.loading = true;
      this.updateHistoryContainer();
      
      const [products, rentals] = await Promise.all([
        window.api.listProducts(),
        window.api.listRentals()
      ]);
      
      this.products = products;
      this.rentals = rentals.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      this.loading = false;
      this.updateHistoryContainer();
    } catch (error) {
      this.loading = false;
      console.error('Failed to load history:', error);
      window.notifications.error('Tarixni yuklashda xatolik yuz berdi');
    }
  }
  
  updateHistoryContainer() {
    const container = document.getElementById('history-container');
    if (!container) return;
    
    container.innerHTML = this.loading ? this.createLoadingState() : this.renderHistoryContent();
  }
  
  renderHistoryContent() {
    const filteredRentals = this.getFilteredRentals();
    
    if (filteredRentals.length === 0) {
      return this.createEmptyState();
    }
    
    return `
      <div class="history-stats">
        <div class="stat-card">
          <div class="stat-number">${this.rentals.length}</div>
          <div class="stat-label">Jami ijaralar</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${this.rentals.filter(r => !r.returnDate).length}</div>
          <div class="stat-label">Faol ijaralar</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${this.rentals.filter(r => r.returnDate).length}</div>
          <div class="stat-label">Yakunlangan</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${window.utils.formatCurrency(this.getTotalRevenue())}</div>
          <div class="stat-label">Jami daromad</div>
        </div>
      </div>
      
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Mahsulot</th>
              <th>Mijoz</th>
              <th>Telefon</th>
              <th>Boshlangan</th>
              <th>Yakunlangan</th>
              <th>Davomiyligi</th>
              <th>Jami</th>
              <th>Holat</th>
            </tr>
          </thead>
          <tbody>
            ${filteredRentals.map(rental => this.renderHistoryRow(rental)).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  
  renderHistoryRow(rental) {
    const product = this.products.find(p => p._id === rental.productId);
    const isCompleted = !!rental.returnDate;
    
    return `
      <tr class="fade-in" data-rental-id="${rental._id}">
        <td>
          <div class="product-cell">
            <div class="product-name">${product?.name || 'Noma\'lum'}</div>
            <div class="product-price">${window.utils.formatCurrency(product?.dailyPrice || 0)}/kun</div>
          </div>
        </td>
        <td>${rental.clientName}</td>
        <td>${rental.clientPhone}</td>
        <td>${this.formatDate(rental.startDate)}</td>
        <td>${rental.returnDate ? this.formatDate(rental.returnDate) : '-'}</td>
        <td>
          ${rental.totalDays ? 
            `<span class="duration-badge">${rental.totalDays} kun</span>` : 
            this.calculateDuration(rental.startDate)
          }
        </td>
        <td>
          ${rental.totalPrice ? 
            `<span class="amount-badge">${window.utils.formatCurrency(rental.totalPrice)}</span>` : 
            '<span class="text-muted">-</span>'
          }
        </td>
        <td>
          <span class="status-badge ${isCompleted ? 'completed' : 'active'}">
            ${isCompleted ? '✅ Yakunlangan' : '🔄 Faol'}
          </span>
        </td>
      </tr>
    `;
  }
  
  getFilteredRentals() {
    let filtered = this.rentals;
    
    // Apply search filter
    if (this.searchTerm) {
      filtered = filtered.filter(rental => {
        const product = this.products.find(p => p._id === rental.productId);
        const productName = product?.name?.toLowerCase() || '';
        const clientName = rental.clientName?.toLowerCase() || '';
        const clientPhone = rental.clientPhone?.toLowerCase() || '';
        
        return productName.includes(this.searchTerm) ||
               clientName.includes(this.searchTerm) ||
               clientPhone.includes(this.searchTerm);
      });
    }
    
    // Apply status filter
    if (this.filter === 'active') {
      filtered = filtered.filter(rental => !rental.returnDate);
    } else if (this.filter === 'completed') {
      filtered = filtered.filter(rental => rental.returnDate);
    }
    
    return filtered;
  }
  
  getTotalRevenue() {
    return this.rentals
      .filter(rental => rental.totalPrice)
      .reduce((sum, rental) => sum + rental.totalPrice, 0);
  }
  
  calculateDuration(startDate) {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `<span class="duration-badge active">${diffDays} kun (faol)</span>`;
  }
  
  formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  createLoadingState() {
    return `
      <div class="history-stats">
        ${Array(4).fill().map(() => `
          <div class="stat-card skeleton">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text"></div>
          </div>
        `).join('')}
      </div>
      
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Mahsulot</th>
              <th>Mijoz</th>
              <th>Telefon</th>
              <th>Boshlangan</th>
              <th>Yakunlangan</th>
              <th>Davomiyligi</th>
              <th>Jami</th>
              <th>Holat</th>
            </tr>
          </thead>
          <tbody>
            ${Array(8).fill().map(() => `
              <tr>
                <td><div class="skeleton skeleton-text"></div></td>
                <td><div class="skeleton skeleton-text"></div></td>
                <td><div class="skeleton skeleton-text"></div></td>
                <td><div class="skeleton skeleton-text"></div></td>
                <td><div class="skeleton skeleton-text"></div></td>
                <td><div class="skeleton skeleton-text"></div></td>
                <td><div class="skeleton skeleton-text"></div></td>
                <td><div class="skeleton skeleton-text"></div></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  
  createEmptyState() {
    let message, description;
    
    if (this.searchTerm) {
      message = 'Qidiruv natijalari topilmadi';
      description = `"${this.searchTerm}" so'rovi bo'yicha hech narsa topilmadi. Boshqa kalit so'z bilan qidiring.`;
    } else if (this.filter === 'active') {
      message = 'Faol ijaralar yo\'q';
      description = 'Hozirda faol holda bo\'lgan ijaralar mavjud emas.';
    } else if (this.filter === 'completed') {
      message = 'Yakunlangan ijaralar yo\'q';
      description = 'Hozircha yakunlangan ijaralar mavjud emas.';
    } else {
      message = 'Ijara tarixi bo\'sh';
      description = 'Hozircha hech qanday ijara boshlanmagan. Birinchi ijarani boshlang!';
    }
    
    return `
      <div class="empty-state text-center" style="padding: var(--space-12);">
        <div style="font-size: 4rem; margin-bottom: var(--space-4); opacity: 0.5;">📚</div>
        <h3 class="text-xl font-semibold mb-4">${message}</h3>
        <p class="text-muted mb-6">${description}</p>
        ${!this.searchTerm && this.filter === 'all' ? `
          <a href="#/rentals" class="btn">
            ➕ Birinchi ijarani boshlash
          </a>
        ` : ''}
      </div>
    `;
  }
}

// Export for global usage
window.HistoryPage = HistoryPage;