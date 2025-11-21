/**
 * PRODUCTS PAGE - Vanilla JavaScript Implementation
 * Modern product management with CRUD operations
 */

class ProductsPage {
  constructor() {
    this.products = [];
    this.showCreateForm = false;
    this.editingProduct = null;
    this.loading = true;
  }
  
  async render() {
    await this.loadProducts();
    
    return `
      <div class="page-header slide-down">
        <div class="page-header-content">
          <h1 class="page-title">
            <span class="page-icon">📦</span>
            Mahsulotlar
          </h1>
          <p class="page-description">Ijaraga beriladigan asbob-uskunalarni boshqaring</p>
        </div>
        <div class="page-actions">
          <button class="btn" id="add-product-btn">
            <span class="btn-icon">➕</span>
            Mahsulot qo'shish
          </button>
        </div>
      </div>
      
      <div id="create-form-container" class="form-container hidden"></div>
      
      <div class="content-card">
        <div id="products-container">
          ${this.loading ? this.createLoadingState() : this.renderProductsContent()}
        </div>
      </div>
    `;
  }
  
  async afterRender() {
    // Bind events after DOM is ready
    this.bindEvents();
    
    // Add entrance animations
    window.utils.addEntranceAnimation('.page-header', 200);
    window.utils.addEntranceAnimation('.content-card', 400);
  }
  
  bindEvents() {
    const addBtn = document.getElementById('add-product-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.toggleCreateForm());
    }
    
    this.bindProductEvents();
  }
  
  async loadProducts() {
    try {
      this.loading = true;
      this.updateProductsContainer();
      
      this.products = await window.api.listProducts();
      this.loading = false;
      this.updateProductsContainer();
    } catch (error) {
      this.loading = false;
      console.error('Failed to load products:', error);
      this.updateProductsContainer(error.message);
    }
  }
  
  updateProductsContainer(errorMessage = null) {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    if (errorMessage) {
      container.innerHTML = this.createErrorState(errorMessage);
    } else if (this.loading) {
      container.innerHTML = this.createLoadingState();
    } else {
      container.innerHTML = this.renderProductsContent();
      // Ensure DOM is updated before binding events
      requestAnimationFrame(() => {
        this.bindProductEvents();
      });
    }
  }
  
  renderProductsContent() {
    if (this.products.length === 0) {
      return this.createEmptyState();
    }
    
    return this.renderProductsTable();
  }
  
  renderProductsTable() {
    return `
      <div class="table-container">
        <div class="scrollable-table">
          <table class="table">
            <thead>
              <tr>
                <th>Nomi</th>
                <th>Kunlik narx</th>
                <th>Rasm</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${this.products.map(product => `
                <tr key="${product._id}">
                  <td>${product.name}</td>
                  <td>${window.utils.formatCurrency(product.dailyPrice)} so'm / kun</td>
                  <td>
                    ${product.imageUrl ? 
                      `<img src="${product.imageUrl}" alt="${product.name}" class="table-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                       <div style="display: none; align-items: center; justify-content: center; height: 100%; color: var(--text-muted);">📷 Yo'q</div>` :
                      '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-muted);">📷 Yo\'q</div>'
                    }
                  </td>
                  <td>
                    <div class="table-actions" style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                      <button class="btn secondary edit-btn" data-product-id="${product._id}" aria-label="Tahrirlash">
                        <i class="fas fa-edit"></i> Tahrirlash
                      </button>
                      <button class="btn danger delete-btn" data-product-id="${product._id}" aria-label="O'chirish">
                        <i class="fas fa-trash"></i> O'chirish
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
  
  renderProductCard(product) {
    return `
      <div class="product-card fade-in" data-product-id="${product._id}">
        <div class="product-image">
          ${product.imageUrl 
            ? `<img src="${product.imageUrl}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
               <div style="display: none; align-items: center; justify-content: center; height: 100%; color: var(--text-muted);">🖼️ Rasm yo'q</div>`
            : '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-muted);">🖼️ Rasm yo\'q</div>'
          }
        </div>
        <div class="product-info">
          <div class="product-header">
            <h3 class="product-name">${product.name}</h3>
            <div class="product-price">${window.utils.formatCurrency(product.dailyPrice)}/kun</div>
          </div>
          <div class="product-actions">
            <button class="btn secondary edit-btn" data-product-id="${product._id}">
              <i class="fas fa-edit"></i> Tahrirlash
            </button>
            <button class="btn danger delete-btn" data-product-id="${product._id}">
              <i class="fas fa-trash"></i> O'chirish
            </button>
          </div>
        </div>
      </div>
    `;
  }
  
  bindProductEvents() {
    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        console.log('Edit button clicked', e.target, e.target.getAttribute('data-product-id'));
        const productId = e.target.getAttribute('data-product-id');
        this.editProduct(productId);
      });
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.getAttribute('data-product-id');
        this.deleteProduct(productId);
      });
    });
  }
  
  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    const container = document.getElementById('create-form-container');
    
    if (this.showCreateForm) {
      container.classList.remove('hidden');
      container.innerHTML = this.createProductForm();
      this.bindFormEvents();
    } else {
      container.classList.add('hidden');
      container.innerHTML = '';
    }
  }
  
  createProductForm(product = null) {
    const isEdit = !!product;
    return `
      <div class="form-card slide-down">
        <h3>${isEdit ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}</h3>
        <form id="product-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Mahsulot nomi *</label>
              <input type="text" name="name" class="form-input" placeholder="Masalan: Perforator" 
                     value="${product?.name || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Kunlik narx ($) *</label>
              <input type="number" name="dailyPrice" class="form-input" placeholder="50" 
                     value="${product?.dailyPrice || ''}" min="0" step="0.01" required>
            </div>
            <div class="form-group">
              <label class="form-label">Rasm URL</label>
              <input type="url" name="imageUrl" class="form-input" 
                     placeholder="https://example.com/image.jpg" 
                     value="${product?.imageUrl || ''}">
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn secondary" id="cancel-btn">❌ Bekor qilish</button>
            <button type="submit" class="btn">${isEdit ? '💾 Saqlash' : '➕ Qo\'shish'}</button>
          </div>
        </form>
      </div>
    `;
  }
  
  bindFormEvents() {
    const form = document.getElementById('product-form');
    const cancelBtn = document.getElementById('cancel-btn');
    
    form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    cancelBtn.addEventListener('click', () => this.cancelForm());
  }
  
  async handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const productData = {
      name: formData.get('name'),
      dailyPrice: parseFloat(formData.get('dailyPrice')),
      imageUrl: formData.get('imageUrl') || ''
    };
    
    try {
      if (this.editingProduct) {
        await window.api.updateProduct(this.editingProduct._id, productData);
        window.notifications.success('Mahsulot muvaffaqiyatli yangilandi!');
      } else {
        await window.api.createProduct(productData);
        window.notifications.success('Mahsulot muvaffaqiyatli qo\'shildi!');
      }
      
      this.cancelForm();
      await this.loadProducts();
    } catch (error) {
      console.error('Form submission error:', error);
      window.notifications.error(error.message || 'Xatolik yuz berdi');
    }
  }
  
  editProduct(productId) {
    console.log('editProduct called with productId:', productId);
    const product = this.products.find(p => p._id === productId);
    if (!product) {
      console.log('Product not found with id:', productId);
      return;
    }
    
    console.log('Found product:', product);
    this.editingProduct = product;
    this.showCreateForm = true;
    
    const container = document.getElementById('create-form-container');
    if (!container) {
      console.log('Form container not found');
      return;
    }
    
    container.classList.remove('hidden');
    container.innerHTML = this.createProductForm(product);
    console.log('Form created, binding events...');
    this.bindFormEvents();
  }
  
  deleteProduct(productId) {
    const product = this.products.find(p => p._id === productId);
    if (!product) return;
    
    window.modal.confirm(
      'Mahsulotni o\'chirish',
      `"${product.name}" mahsulotini o\'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo\'lmaydi.`,
      async () => {
        try {
          await window.api.deleteProduct(productId);
          window.notifications.success('Mahsulot muvaffaqiyatli o\'chirildi!');
          await this.loadProducts();
        } catch (error) {
          console.error('Delete error:', error);
          window.notifications.error(error.message || 'O\'chirishda xatolik yuz berdi');
        }
      }
    );
  }
  
  cancelForm() {
    this.showCreateForm = false;
    this.editingProduct = null;
    const container = document.getElementById('create-form-container');
    container.classList.add('hidden');
    container.innerHTML = '';
  }
  
  createLoadingState() {
    return `
      <div class="products-grid">
        ${Array(6).fill().map(() => `
          <div class="product-card skeleton">
            <div class="skeleton skeleton-card" style="height: 200px;"></div>
            <div style="padding: var(--space-4);">
              <div class="skeleton skeleton-title"></div>
              <div class="skeleton skeleton-text"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  createEmptyState() {
    return `
      <div class="empty-state text-center" style="padding: var(--space-12);">
        <div style="font-size: 4rem; margin-bottom: var(--space-4); opacity: 0.5;">📦</div>
        <h3 class="text-xl font-semibold mb-4">Mahsulotlar yo'q</h3>
        <p class="text-muted mb-6">Hozircha hech qanday mahsulot qo'shilmagan. Birinchi mahsulotingizni qo'shing!</p>
        <button class="btn" onclick="document.getElementById('add-product-btn').click()">
          ➕ Birinchi mahsulotni qo'shish
        </button>
      </div>
    `;
  }
  
  createErrorState(message) {
    return `
      <div class="error-state text-center" style="padding: var(--space-12);">
        <div style="font-size: 4rem; margin-bottom: var(--space-4); opacity: 0.5;">❌</div>
        <h3 class="text-xl font-semibold mb-4">Xatolik yuz berdi</h3>
        <p class="text-muted mb-6">${message}</p>
        <button class="btn" onclick="window.location.reload()">
          🔄 Qayta yuklash
        </button>
      </div>
    `;
  }
}

// Export for global usage
window.ProductsPage = ProductsPage;