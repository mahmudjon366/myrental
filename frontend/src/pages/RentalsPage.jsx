import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useI18n } from '../lib/i18n.jsx';
import { FaHome, FaBox, FaSortNumericUp, FaUser, FaPhone, FaCalendarAlt, FaClock, FaDollarSign, FaCog, FaExclamationTriangle } from 'react-icons/fa';

export default function RentalsPage() {
  const { t, transliterate } = useI18n();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      setError('');
      const [ps, rs] = await Promise.all([api.listProducts(), api.listRentals()]);
      setProducts(ps);
      setRentals(rs);
    } catch (e) {
      setError(t('rentals_load_error') || 'Ijaralarni yuklashda xatolik yuz berdi');
    }
  }
  useEffect(() => { load(); }, []);

  async function onReturn(r) {
    try {
      const date = new Date().toISOString();
      await api.returnRental(r._id, date);
      await load();
    } catch (e) {
      setError(e.message || (t('return_error') || 'Qaytarishda xatolik'));
    }
  }

  function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('uz-UZ');
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('uz-UZ').format(amount);
  }

  // Calculate rental days
  function calculateDays(rental) {
    const start = new Date(rental.startDate);
    const end = rental.returnDate ? new Date(rental.returnDate) : new Date();
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Calculate total amount
  function calculateTotal(rental) {
    const product = products.find(p => p._id === rental.productId);
    if (!product) return 0;
    return calculateDays(rental) * product.dailyPrice * (rental.quantity || 1);
  }

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div className="premium-card mb-8 flex justify-between items-center">
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '2.5rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #5b8cff 0%, #fbbf24 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            <FaHome style={{ marginRight: '0.5rem' }} /> {transliterate('Faol ijaralar')}
          </h1>
          <p style={{
            margin: '0.5rem 0 0 0',
            color: '#94a3b8',
            fontSize: '1.1rem',
            fontWeight: '500'
          }}>
            Hozirda davom etayotgan ijaralar
          </p>
        </div>
        <button 
          onClick={() => navigate('/start-rental')}
          className="btn-premium btn-premium-primary"
          style={{ fontSize: '1rem', padding: '1rem 2rem' }}
        >
          + {transliterate('Yangi ijara')}
        </button>
      </div>

      {/* Error Message */}
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
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Rentals Table */}
      <div className="premium-table-container">
        <table className="premium-table">
          <thead>
            <tr>
              <th><FaBox style={{ marginRight: '0.5rem' }} /> {transliterate('Mahsulot')}</th>
              <th><FaSortNumericUp style={{ marginRight: '0.5rem' }} /> {transliterate('Miqdori')}</th>
              <th><FaUser style={{ marginRight: '0.5rem' }} /> {transliterate('Mijoz')}</th>
              <th><FaPhone style={{ marginRight: '0.5rem' }} /> {transliterate('Telefon')}</th>
              <th><FaCalendarAlt style={{ marginRight: '0.5rem' }} /> {transliterate('Boshlanish')}</th>
              <th><FaClock style={{ marginRight: '0.5rem' }} /> {transliterate('Kunlar')}</th>
              <th><FaDollarSign style={{ marginRight: '0.5rem' }} /> {transliterate('Jami')}</th>
              <th style={{ textAlign: 'right' }}><FaCog style={{ marginRight: '0.5rem' }} /> {transliterate('Amallar')}</th>
            </tr>
          </thead>
          <tbody>
            {rentals.filter(r => !r.returnDate).length === 0 ? (
              <tr>
                <td colSpan="8" className="premium-empty-state">
                  <div className="premium-empty-state-icon"><FaHome style={{ fontSize: '3rem', color: '#94a3b8' }} /></div>
                  <div className="premium-empty-state-text">Faol ijaralar mavjud emas</div>
                  <div className="premium-empty-state-description">Yangi ijara boshlash uchun yuqoridagi tugmani bosing</div>
                </td>
              </tr>
            ) : (
              rentals.filter(r => !r.returnDate).map((r, index) => {
                const product = products.find(p => p._id === r.productId);
                return (
                  <tr key={r._id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <td style={{ fontWeight: '600' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #5b8cff, #fbbf24)'
                        }}></div>
                        {product ? product.name : 'Noma\'lum mahsulot'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        background: 'linear-gradient(135deg, #5b8cff, #4a7ce8)',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}>
                        {r.quantity || 1} dona
                      </span>
                    </td>
                    <td style={{ color: '#e2e8f0', fontWeight: '500' }}>{r.clientName}</td>
                    <td style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{r.clientPhone}</td>
                    <td style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{formatDate(r.startDate)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}>
                        {calculateDays(r)} kun
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: '#fbbf24', fontSize: '1.1rem' }}>
                      {formatCurrency(calculateTotal(r))} so'm
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn-premium btn-premium-success"
                        onClick={() => onReturn(r)}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        title="Ijarani yakunlash"
                      >
                        ✓ Qaytarish
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}