// Modern Scroll Effects for Rentacloud

// Scroll to top functionality
export function initScrollToTop() {
  // Create scroll to top button
  const scrollBtn = document.createElement('button');
  scrollBtn.className = 'scroll-to-top';
  scrollBtn.innerHTML = '↑';
  scrollBtn.setAttribute('aria-label', 'Yuqoriga chiqish');
  document.body.appendChild(scrollBtn);

  // Show/hide button based on scroll position
  function toggleScrollButton() {
    if (window.pageYOffset > 300) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  }

  // Smooth scroll to top
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // Event listeners
  window.addEventListener('scroll', toggleScrollButton);
  scrollBtn.addEventListener('click', scrollToTop);

  // Initial check
  toggleScrollButton();
}

// Scroll progress bar
export function initScrollProgress() {
  // Create progress bar
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);

  // Update progress on scroll
  function updateScrollProgress() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    progressBar.style.width = scrollPercent + '%';
  }

  window.addEventListener('scroll', updateScrollProgress);
  updateScrollProgress();
}

// Scroll animations for elements
export function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  // Observe all elements with scroll animation classes
  const animatedElements = document.querySelectorAll(
    '.scroll-fade-in, .scroll-scale-in, .scroll-slide-left, .scroll-slide-right'
  );
  
  animatedElements.forEach(el => observer.observe(el));
}

// Smooth scroll for anchor links
export function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Enhanced table scrolling for mobile
export function initTableScroll() {
  const tables = document.querySelectorAll('.table-container');
  
  tables.forEach(container => {
    let isScrolling = false;
    
    container.addEventListener('scroll', () => {
      if (!isScrolling) {
        container.style.boxShadow = '0 0 20px rgba(103, 126, 234, 0.3)';
        isScrolling = true;
      }
      
      clearTimeout(container.scrollTimeout);
      container.scrollTimeout = setTimeout(() => {
        container.style.boxShadow = '';
        isScrolling = false;
      }, 150);
    });
  });
}

// Parallax effect for background
export function initParallax() {
  const parallaxElements = document.querySelectorAll('.parallax-bg');
  
  function updateParallax() {
    const scrolled = window.pageYOffset;
    
    parallaxElements.forEach(element => {
      const rate = scrolled * -0.5;
      element.style.transform = `translateY(${rate}px)`;
    });
  }
  
  if (parallaxElements.length > 0) {
    window.addEventListener('scroll', updateParallax);
  }
}

// Initialize all scroll effects
export function initAllScrollEffects() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initScrollToTop();
      initScrollProgress();
      initScrollAnimations();
      initSmoothScroll();
      initTableScroll();
      initParallax();
    });
  } else {
    initScrollToTop();
    initScrollProgress();
    initScrollAnimations();
    initSmoothScroll();
    initTableScroll();
    initParallax();
  }
}

// Utility function to add scroll animation classes to elements
export function addScrollAnimation(element, animationType = 'fade-in') {
  if (element) {
    element.classList.add(`scroll-${animationType}`);
  }
}

// Utility function to scroll to element
export function scrollToElement(selector, offset = 0) {
  const element = document.querySelector(selector);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({
      top: elementPosition - offset,
      behavior: 'smooth'
    });
  }
}

// Export default initialization
export default initAllScrollEffects;