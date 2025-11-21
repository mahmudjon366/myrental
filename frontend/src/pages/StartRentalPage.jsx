import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useI18n } from '../lib/i18n.jsx';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function StartRentalPage() {
  const { t, transliterate } = useI18n();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ productId: '', clientName: '', clientPhone: '', startDate: '', quantity: 1 });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function loadProducts() {
    try {
      setError('');
      const products = await api.listProducts();
      setProducts(products);
    } catch (e) {
      setError(t('products_load_error') || 'Mahsulotlarni yuklashda xatolik yuz berdi');
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = { ...form };
      if (!payload.startDate) delete payload.startDate;
      await api.createRental(payload);
      navigate('/rentals');
    } catch (e) {
      setError(e.message || (t('create_error') || 'Yaratishda xatolik'));
    } finally {
      setIsLoading(false);
    }
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('uz-UZ').format(amount);
  }

  return (
    <div className="container fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">{t('start_rental')}</h1>
        <button 
          onClick={() => navigate('/rentals')}
          className="btn secondary"
        >
          {t('back') || 'Ortga'}
        </button>
      </div>

      {error && (
        <div className="notification error mb-4">
          <div className="notification-icon"><FaExclamationTriangle /></div>
          <div className="notification-content">
            <div className="notification-title">Xatolik</div>
            <div className="notification-message">{error}</div>
          </div>
          <button className="notification-close" onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="card">
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('select_product')}</label>
              <select 
                className="form-input" 
                value={form.productId} 
                onChange={e => setForm(v => ({...v, productId: e.target.value}))}
                required
              >
                <option value="">{t('select_product')}</option>
                {products.map(p => (
                  <option key={p._id} value={p._id}>
                    {transliterate(p.name)} ({formatCurrency(p.dailyPrice)} {transliterate(t('per_day'))})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{transliterate('Miqdori')}</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={form.quantity}
                  onChange={e => setForm(v => ({...v, quantity: parseInt(e.target.value) || 1}))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('start_date')}</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={form.startDate} 
                  onChange={e => setForm(v => ({...v, startDate: e.target.value}))}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t('client_name')}</label>
              <input 
                className="form-input" 
                placeholder={t('client_name')} 
                value={form.clientName} 
                onChange={e => setForm(v => ({...v, clientName: e.target.value}))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('client_phone')}</label>
              <input 
                type="tel" 
                className="form-input" 
                placeholder={t('client_phone')} 
                value={form.clientPhone} 
                onChange={e => setForm(v => ({...v, clientPhone: e.target.value}))}
                required
              />
            </div>
            <div className="form-actions flex justify-end btn-spacing-wide pt-4">
              <button 
                type="button" 
                className="btn secondary" 
                onClick={() => navigate('/rentals')}
                disabled={isLoading}
              >
                {t('cancel') || 'Bekor qilish'}
              </button>
              <button 
                type="submit" 
                className="btn" 
                disabled={isLoading}
              >
                {isLoading ? (t('adding') || 'Qo\'shilmoqda...') : t('start_rental')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}