import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useI18n } from '../lib/i18n.jsx';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function ActiveRentalsPage() {
  const { t, transliterate } = useI18n();
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      setError('');
      const rs = await api.listRentals();
      // Faqat faol ijaralarni filter qilamiz
      setRentals(rs.filter(r => !r.returnDate));
    } catch (e) {
      setError(t('active_rentals_load_error') || 'Faol ijaralarni yuklashda xatolik yuz berdi');
    }
  }

  useEffect(() => { load(); }, []);

  async function onReturn(r) {
    try {
      const date = new Date().toISOString();
      await api.returnRental(r._id, date);
      await load(); // Reload to update the list
      // Navbar'dagi tarix sonini yangilash uchun event yuborish
      window.dispatchEvent(new CustomEvent('rentalUpdated'));
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
    const end = new Date();
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Calculate total amount
  function calculateTotal(rental, products) {
    const product = products.find(p => p._id === rental.productId);
    if (!product) return 0;
    return calculateDays(rental) * product.dailyPrice * (rental.quantity || 1);
  }

  // Get all products from rentals
  const products = [];
  rentals.forEach(rental => {
    if (rental.product && !products.find(p => p._id === rental.product._id)) {
      products.push(rental.product);
    }
  });

  // Filter active rentals
  const activeRentals = rentals.filter(r => !r.returnDate);

  return (
    <div className="container fade-in">
      <div className="mb-6">
        <h1 className="page-title">{t('activeRentals')}</h1>
        <button 
          onClick={() => navigate('/start-rental')}
          className="btn mt-2"
        >
          {t('start_rental')}
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

      {activeRentals.length === 0 ? (
        <div className="card text-center" style={{ padding: 'var(--space-8)' }}>
          <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>{t('no_active_rentals')}</h3>
          <p style={{ margin: 'var(--space-2) 0 0 0', color: 'var(--text-muted)' }}>
            {t('no_active_rentals_message') || 'Hozirda hech qanday faol ijara mavjud emas.'}
          </p>
          <div className="mt-4">
            <button 
              onClick={() => navigate('/start-rental')}
              className="btn"
            >
              {t('start_rental')}
            </button>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <div className="scrollable-table">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('product')}</th>
                  <th>{t('client')}</th>
                  <th>{t('phone')}</th>
                  <th>{transliterate('Miqdori')}</th>
                  <th>{t('start')}</th>
                  <th>{t('days')}</th>
                  <th>{t('total')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {activeRentals.map(r => {
                  const product = r.product || products.find(p => p._id === r.productId);
                  return (
                    <tr key={r._id}>
                      <td>{product ? transliterate(product.name) : transliterate('Noma\'lum')}</td>
                      <td>{transliterate(r.clientName)}</td>
                      <td>{r.clientPhone}</td>
                      <td>{r.quantity || 1}</td>
                      <td>{formatDate(r.startDate)}</td>
                      <td>{calculateDays(r)}</td>
                      <td>{formatCurrency(calculateTotal(r, [product]))}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            onClick={() => onReturn(r)}
                            className="btn small"
                          >
                            {t('mark_returned')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}