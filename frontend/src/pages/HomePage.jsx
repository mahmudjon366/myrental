import React from 'react';
import { useI18n } from '../lib/i18n.jsx';

export default function HomePage() {
  const { t, transliterate } = useI18n();

  return (
    <div className="container fade-in">
      <section className="hero-section">
        <div className="hero-grid">
          <div className="hero-content">
            <div className="hero-badge">
              <span>🎉</span>
              <span>{t('welcome_badge')}</span>
            </div>
            <h1 className="hero-title">{t('welcome_title')}</h1>
            <p className="hero-description">
              {t('welcome_description')}
            </p>
            <div className="hero-buttons">
              <a href="/products" className="btn">
                <span>💻</span>
                <span>{t('view_products')}</span>
              </a>
              <a href="/rentals" className="btn secondary">
                <span>📋</span>
                <span>{t('manage_rentals')}</span>
              </a>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-value">150+</span>
                <span className="hero-stat-label">{t('products_managed')}</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-value">98%</span>
                <span className="hero-stat-label">{t('customer_satisfaction')}</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚀</div>
                <h3 style={{ marginBottom: '1rem' }}>{t('get_started')}</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  {t('get_started_description')}
                </p>
                <a href="/products" className="btn">
                  <span>👉</span>
                  <span>{t('start_now')}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="text-center mb-8" style={{ fontSize: '2rem', fontWeight: '700' }}>
          {t('why_choose_us')}
        </h2>
        <div className="feature-grid grid">
          <div className="feature-item">
            <div className="feature-icon">📊</div>
            <div className="feature-content">
              <h3 className="feature-title">{t('real_time_analytics')}</h3>
              <p className="feature-description">
                {t('real_time_analytics_desc')}
              </p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔒</div>
            <div className="feature-content">
              <h3 className="feature-title">{t('secure_data')}</h3>
              <p className="feature-description">
                {t('secure_data_desc')}
              </p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📱</div>
            <div className="feature-content">
              <h3 className="feature-title">{t('mobile_friendly')}</h3>
              <p className="feature-description">
                {t('mobile_friendly_desc')}
              </p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <div className="feature-content">
              <h3 className="feature-title">{t('fast_performance')}</h3>
              <p className="feature-description">
                {t('fast_performance_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="workflow-section">
        <h2 className="text-center mb-8" style={{ fontSize: '2rem', fontWeight: '700' }}>
          {t('how_it_works')}
        </h2>
        <div className="workflow-grid grid">
          <div className="workflow-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>{t('step_add_products')}</h4>
              <p>{t('step_add_products_desc')}</p>
            </div>
          </div>
          <div className="workflow-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>{t('step_manage_rentals')}</h4>
              <p>{t('step_manage_rentals_desc')}</p>
            </div>
          </div>
          <div className="workflow-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>{t('step_track_income')}</h4>
              <p>{t('step_track_income_desc')}</p>
            </div>
          </div>
          <div className="workflow-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>{t('step_generate_reports')}</h4>
              <p>{t('step_generate_reports_desc')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}