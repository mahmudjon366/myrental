import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useI18n } from '../lib/i18n.jsx';
import { FaPlus, FaArrowLeft, FaBox, FaPencilAlt, FaDollarSign, FaImage, FaLightbulb, FaExclamationTriangle } from 'react-icons/fa';

export default function AddProductPage() {
  const { t, transliterate } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', dailyPrice: '', imageUrl: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      // Validate required fields
      if (!form.name?.trim()) {
        throw new Error(t('name_required') || transliterate('Mahsulot nomini kiriting'));
      }

      // Convert dailyPrice to number and validate
      const dailyPrice = Number(form.dailyPrice);
      if (isNaN(dailyPrice) || dailyPrice <= 0) {
        throw new Error(t('daily_price_required') || 'Iltimos, to\'g\'ri narx kiriting');
      }

      // Prepare payload with correct data types
      const payload = {
        name: form.name.trim(),
        dailyPrice: dailyPrice,
        imageUrl: form.imageUrl?.trim() || ''
      };

      console.log('Sending payload to server:', payload);

      // Send request to server
      const response = await api.createProduct(payload);
      console.log('Server response:', response);
      // Navbar'dagi mahsulotlar sonini yangilash uchun event yuborish
      window.dispatchEvent(new CustomEvent('productUpdated'));
      navigate('/products');

    } catch (e) {
      console.error('Error creating product:', e);

      // Show detailed validation errors if available
      let errorMessage = transliterate('Mahsulot yaratishda xatolik yuz berdi');

      if (e.errors && e.errors.length > 0) {
        errorMessage = e.errors.map(err => {
          return `${err.msg || err.message} (${err.param || 'field'})`;
        }).join('\n');
      } else if (e.message) {
        errorMessage = e.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div className="premium-card mb-8 flex justify-between items-center">
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '2rem',
            fontWeight: '700',
            color: '#1e293b'
          }}>
            <FaBox style={{ marginRight: '0.5rem' }} /> {transliterate('Yangi mahsulot')}
          </h1>
          <p style={{
            margin: '0.5rem 0 0 0',
            color: '#94a3b8',
            fontSize: '1.1rem',
            fontWeight: '500'
          }}>
            {transliterate('Yangi mahsulot ma\'lumotlarini kiriting')}
          </p>
        </div>
        <button
          onClick={() => navigate('/products')}
          className="btn secondary small"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '10px 16px',
            fontSize: '0.9rem'
          }}
        >
          <FaArrowLeft />
          <span className="hidden md:inline">{t('back') || 'Ortga'}</span>
        </button>
      </div>

      {error && (
        <div className="premium-notification error mb-8 animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <FaExclamationTriangle style={{ fontSize: '1.5rem', color: '#ef4444' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', color: '#ef4444', marginBottom: '0.25rem' }}>Xatolik yuz berdi</div>
              <div style={{ color: '#fca5a5', fontSize: '0.9rem' }}>{error}</div>
            </div>
            <button
              onClick={() => setError('')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#ef4444',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(220, 38, 38, 0.1)'}
              onMouseOut={(e) => e.target.style.background = 'none'}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="premium-card">
        <form onSubmit={handleSubmit}>
          <div className="premium-form-group">
            <label className="premium-form-label"><FaPencilAlt style={{ marginRight: '0.5rem' }} /> {t('name') || transliterate('Mahsulot nomi')}</label>
            <input
              type="text"
              className="premium-form-input"
              placeholder="Masalan: Kamera, Noutbuk, Mebel..."
              value={form.name}
              onChange={e => setForm(v => ({ ...v, name: e.target.value }))}
              autoComplete="off"
              spellCheck="false"
              list=""
              required
            />
          </div>

          <div className="premium-form-group">
            <label className="premium-form-label"><FaDollarSign style={{ marginRight: '0.5rem' }} /> {t('daily_price') || transliterate('Kunlik narx (so\'m)')}</label>
            <input
              type="number"
              min="0"
              step="1000"
              className="premium-form-input"
              placeholder="Masalan: 50000"
              value={form.dailyPrice}
              onChange={e => setForm(v => ({ ...v, dailyPrice: e.target.value }))}
              autoComplete="off"
              spellCheck="false"
              list=""
              required
            />
          </div>

          <div className="premium-form-group">
            <label className="premium-form-label"><FaImage style={{ marginRight: '0.5rem' }} /> {t('image_url') || 'Rasm manzili (ixtiyoriy)'}</label>
            <input
              type="url"
              className="premium-form-input"
              placeholder="https://example.com/image.jpg"
              value={form.imageUrl}
              onChange={e => setForm(v => ({ ...v, imageUrl: e.target.value }))}
              autoComplete="off"
              spellCheck="false"
              list=""
            />
            <div style={{
              fontSize: '0.8rem',
              color: '#6b7280',
              marginTop: '0.5rem',
              fontStyle: 'italic'
            }}>
              <FaLightbulb style={{ marginRight: '0.5rem' }} /> {transliterate('Maslahat: Rasm URL manzilini kiriting yoki bo\'sh qoldiring')}
            </div>
          </div>

          <div className="flex justify-end gap-4" style={{ paddingTop: '2rem' }}>
            <button
              type="button"
              className="btn secondary"
              onClick={() => navigate('/products')}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <FaArrowLeft />
              {t('cancel') || transliterate('Bekor qilish')}
            </button>
            <button
              type="submit"
              className={`btn success ${loading ? 'loading' : ''}`}
              disabled={loading}
              style={{ 
                minWidth: '150px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'btn-spin 1s linear infinite'
                  }}></div>
                  {t('adding') || 'Qo\'shilmoqda...'}
                </>
              ) : (
                <>
                  <FaPlus />
                  {t('add') || 'Qo\'shish'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}