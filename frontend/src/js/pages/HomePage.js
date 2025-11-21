/**
 * HOME PAGE - Vanilla JavaScript Implementation
 * Beautiful hero section with modern design
 */

class HomePage {
  constructor() {
    this.features = [
      {
        icon: '📦',
        title: 'Mahsulotlar',
        description: 'Nomi, narxi va rasm bilan katalog yuritish.',
        link: '/products'
      },
      {
        icon: '📋',
        title: 'Ijaralar',
        description: 'Mijoz ma\'lumotlari bilan ijara boshlash.',
        link: '/rentals'
      },
      {
        icon: '✅',
        title: 'Qaytarish',
        description: 'Kun va umumiy summa avtomatik hisoblanadi.',
        link: '/rentals'
      },
      {
        icon: '📊',
        title: 'Hisobot',
        description: 'Jami va oylik daromadni ko\'rish.',
        link: '/report'
      }
    ];
    
    this.workflows = [
      {
        step: 1,
        title: 'Mahsulot qo\'shing',
        description: 'Nomi, kunlik narxi va rasm URL manzili.'
      },
      {
        step: 2,
        title: 'Ijara boshlang',
        description: 'Mijoz ma\'lumotlari va sanani kiriting.'
      },
      {
        step: 3,
        title: 'Qaytarishni belgilang',
        description: 'Kunlar va summa avtomatik hisoblanadi.'
      },
      {
        step: 4,
        title: 'Hisobotni ko\'ring',
        description: 'Jami va oylik daromadlar.'
      }
    ];
  }
  
  render() {
    return `
      <div class="home-container">
        <!-- Hero Section -->
        <div class="hero-section">
          <div class="hero-content">
            <div class="hero-badge fade-in">
              <div class="status-dot"></div>
              Asosiy funksiyalar
            </div>
            
            <h1 class="hero-title slide-up">
              Rentacloud — asbob-uskunalarni ijaraga berish va daromadni hisoblash
            </h1>
            
            <div class="hero-features slide-up" style="animation-delay: 200ms;">
              <div class="feature-item">
                <span class="feature-icon">📦</span>
                Mahsulotlar ro'yxatini yuritish
              </div>
              <div class="feature-item">
                <span class="feature-icon">👥</span>
                Mijozlarga ijarani boshlash va qaytarishni belgilash
              </div>
              <div class="feature-item">
                <span class="feature-icon">💰</span>
                Kunlar va umumiy to'lovni avtomatik hisoblash
              </div>
              <div class="feature-item">
                <span class="feature-icon">📊</span>
                Jami va oylik daromad bo'yicha hisobot ko'rish
              </div>
            </div>
            
            <div class="hero-actions slide-up" style="animation-delay: 400ms;">
              <a href="#/products" class="btn btn-primary">
                <span class="btn-icon">📦</span>
                Mahsulotlar
              </a>
              <a href="#/rentals" class="btn btn-secondary">
                <span class="btn-icon">📋</span>
                Ijaralar
              </a>
              <a href="#/history" class="btn btn-outline">
                <span class="btn-icon">📚</span>
                Tarix
              </a>
              <a href="#/report" class="btn btn-outline">
                <span class="btn-icon">📊</span>
                Hisobot
              </a>
            </div>
            
            <div class="hero-metrics slide-up" style="animation-delay: 600ms;">
              <div class="metric">
                <div class="metric-label">Mahsulotlar</div>
                <div class="metric-description">Boshqaruv</div>
              </div>
              <div class="metric">
                <div class="metric-label">Ijara</div>
                <div class="metric-description">Boshlash/Qaytarish</div>
              </div>
              <div class="metric">
                <div class="metric-label">Hisobot</div>
                <div class="metric-description">Jami va oylik</div>
              </div>
            </div>
          </div>
          
          <div class="hero-visual slide-up" style="animation-delay: 300ms;">
            <div class="features-showcase">
              ${this.features.map(feature => `
                <div class="feature-card">
                  <div class="feature-icon-large">${feature.icon}</div>
                  <h3 class="feature-title">${feature.title}</h3>
                  <p class="feature-description">${feature.description}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        
        <!-- Workflow Section -->
        <div class="workflow-section">
          <div class="section-header">
            <h2 class="section-title fade-in">Ish jarayoni</h2>
            <p class="section-description fade-in">Oddiy 4 bosqichda ijarangizni boshqaring</p>
          </div>
          
          <div class="workflow-steps">
            ${this.workflows.map((workflow, index) => `
              <div class="workflow-step slide-up" style="animation-delay: ${index * 150}ms;">
                <div class="step-number">
                  ${workflow.step}
                </div>
                <div class="step-content">
                  <h3 class="step-title">${workflow.title}</h3>
                  <p class="step-description">${workflow.description}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- CTA Section -->
        <div class="cta-section">
          <div class="cta-content fade-in">
            <h2 class="cta-title">Bugun boshlang!</h2>
            <p class="cta-description">Rentacloud bilan asbob-uskunalar ijarasini professional darajada boshqaring</p>
            <div class="cta-actions">
              <a href="#/products" class="btn btn-primary btn-large">
                <span class="btn-icon">🚀</span>
                Birinchi mahsulotni qo'shing
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  afterRender() {
    this.bindEvents();
    this.initializeAnimations();
  }
  
  bindEvents() {
    // Add click handlers for feature cards
    document.querySelectorAll('.feature-card').forEach((card, index) => {
      card.addEventListener('click', () => {
        const link = this.features[index].link;
        if (link) {
          window.router.navigateTo(link);
        }
      });
      
      // Add hover effect
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px) scale(1.02)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
      });
    });
  }
  
  initializeAnimations() {
    // Initialize intersection observer for animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, observerOptions);
    
    // Observe all animated elements
    document.querySelectorAll('.fade-in, .slide-up, .slide-down').forEach(el => {
      observer.observe(el);
    });
  }
}

// Export for global usage
window.HomePage = HomePage;