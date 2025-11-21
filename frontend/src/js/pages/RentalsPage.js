/**
 * RENTALS PAGE - Vanilla JavaScript Implementation
 * Modern rental management with real-time updates
 */

class RentalsPage {
  constructor() {
    this.products = [];
    this.rentals = [];
    this.loading = true;
  }
  
  async render() {
    await this.loadData();
    
    return `
      <div class="page-header slide-down">
        <div class="page-header-content">
          <h1 class="page-title">
            <span class="page-icon">📋</span>
            Ijaralar
          </h1>
          <p class="page-description">Mijozlarga bergan ijaralar va qaytarishlarni boshqaring</p>
        </div>
      </div>
      
      <div class="content-card">
        <div class="rental-form-section">
          <h3>Yangi ijara boshlash</h3>
          <form id="rental-form" class="rental-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Mahsulot *</label>
                <select name="productId" class="form-select" required>
                  <option value="">Mahsulotni tanlang</option>
                  ${this.products.map(product => 
                    `<option value="${product._id}">${product.name} (${window.utils.formatCurrency(product.dailyPrice)}/kun)</option>`
                  ).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Mijoz ismi *</label>
                <input type="text" name="clientName" class="form-input" placeholder="Mijoz ismini kiriting" required>
              </div>
              <div class="form-group">
                <label class="form-label">Telefon raqami *</label>
                <input type="tel" name="clientPhone" class="form-input" placeholder="+998 XX XXX XX XX" required>
              </div>
              <div class="form-group">
                <label class="form-label">Boshlash sanasi</label>
                <input type="date" name="startDate" class="form-input">
              </div>
            </div>
            <button type="submit" class="btn">
              <span class="btn-icon">🚀</span>
              Ijarani boshlash
            </button>
          </form>
        </div>
      </div>
      
      <div class="content-card">
        <div class="table-header">
          <h3>Faol ijaralar</h3>
        </div>
        <div id="rentals-container">
          ${this.loading ? this.createLoadingState() : this.renderRentalsTable()}
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
    const form = document.getElementById('rental-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }
    
    this.bindRentalEvents();
  }
  
  async loadData() {
    try {
      this.loading = true;
      this.updateRentalsContainer();
      
      const [products, rentals] = await Promise.all([
        window.api.listProducts(),
        window.api.listRentals()
      ]);
      
      this.products = products;
      this.rentals = rentals;
      this.loading = false;
      this.updateRentalsContainer();
    } catch (error) {
      this.loading = false;
      console.error('Failed to load data:', error);
      window.notifications.error('Ma\'lumotlarni yuklashda xatolik yuz berdi');
    }
  }
  
  updateRentalsContainer() {
    const container = document.getElementById('rentals-container');
    if (!container) return;
    
    container.innerHTML = this.loading ? this.createLoadingState() : this.renderRentalsTable();
    if (!this.loading) {
      this.bindRentalEvents();
    }
  }
  
  renderRentalsTable() {
    if (this.rentals.length === 0) {
      return this.createEmptyState();
    }
    
    return `
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Mahsulot</th>
              <th>Mijoz</th>
              <th>Telefon</th>
              <th>Boshlagan</th>
              <th>Qaytargan</th>
              <th>Kunlar</th>
              <th>Jami</th>
              <th>Harakat</th>
            </tr>
          </thead>
          <tbody>
            ${this.rentals.map(rental => this.renderRentalRow(rental)).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  
  renderRentalRow(rental) {
    const product = this.products.find(p => p._id === rental.productId);
    
    return `
      <tr class="fade-in" data-rental-id="${rental._id}">
        <td>${product?.name || 'Noma\'lum'}</td>
        <td>${rental.clientName}</td>
        <td>${rental.clientPhone}</td>
        <td>${this.formatDate(rental.startDate)}</td>
        <td>${rental.returnDate ? this.formatDate(rental.returnDate) : '-'}</td>
        <td>${rental.totalDays || '-'}</td>
        <td>${rental.totalPrice ? window.utils.formatCurrency(rental.totalPrice) : '-'}</td>
        <td>
          ${!rental.returnDate ? 
            `<button class="btn success return-btn" data-rental-id="${rental._id}">✅ Qaytarish</button>` : 
            '<span class="text-muted">Yakunlandi</span>'
          }
        </td>
      </tr>
    `;
  }
  
  bindRentalEvents() {
    document.querySelectorAll('.return-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const rentalId = e.target.getAttribute('data-rental-id');
        this.returnRental(rentalId);
      });
    });
  }
  
  async handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const rentalData = {
      productId: formData.get('productId'),
      clientName: formData.get('clientName'),
      clientPhone: formData.get('clientPhone')
    };
    
    const startDate = formData.get('startDate');
    if (startDate) {
      rentalData.startDate = startDate;
    }
    
    try {
      await window.api.createRental(rentalData);
      window.notifications.success('Ijara muvaffaqiyatli boshlandi!');
      e.target.reset();
      await this.loadData();
    } catch (error) {
      console.error('Failed to create rental:', error);
      window.notifications.error(error.message || 'Ijara boshlanmadi');
    }
  }
  
  async returnRental(rentalId) {
    const rental = this.rentals.find(r => r._id === rentalId);
    if (!rental) return;
    
    const product = this.products.find(p => p._id === rental.productId);
    const productName = product?.name || 'Noma\'lum mahsulot';
    
    window.modal.confirm(
      'Ijarani yakunlash',
      `"${productName}" mahsulotining ijarasini yakunlashni tasdiqlaysizmi?`,
      async () => {
        try {
          const returnDate = new Date().toISOString();
          await window.api.returnRental(rentalId, returnDate);
          window.notifications.success('Ijara muvaffaqiyatli yakunlandi!');
          await this.loadData();
        } catch (error) {
          console.error('Failed to return rental:', error);
          window.notifications.error(error.message || 'Ijarani yakunlashda xatolik');
        }
      }
    );
  }
  
  formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('uz-UZ');
  }
  
  createLoadingState() {
    return `
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Mahsulot</th>
              <th>Mijoz</th>
              <th>Telefon</th>
              <th>Boshlangan</th>
              <th>Qaytargan</th>
              <th>Kunlar</th>
              <th>Jami</th>
              <th>Harakat</th>
            </tr>
          </thead>
          <tbody>
            ${Array(5).fill().map(() => `
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
    return `
      <div class="empty-state text-center" style="padding: var(--space-12);">
        <div style="font-size: 4rem; margin-bottom: var(--space-4); opacity: 0.5;">📋</div>
        <h3 class="text-xl font-semibold mb-4">Ijaralar yo'q</h3>
        <p class="text-muted mb-6">Hozircha hech qanday ijara boshlanmagan. Birinchi ijarani boshlang!</p>
      </div>
    `;
  }
}

// Export for global usage
window.RentalsPage = RentalsPage;