import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useI18n } from '../lib/i18n.jsx';
import { FaHistory, FaBox, FaUser, FaPhone, FaSortNumericUp, FaCalendarAlt, FaUndo, FaClock, FaDollarSign, FaExclamationTriangle } from 'react-icons/fa';

export default function HistoryPage() {
  const { t, transliterate } = useI18n();
  const [rentals, setRentals] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setError('');
        const rs = await api.listRentals();
        setRentals(rs);
      } catch (e) {
        setError(t('history_load_error') || 'Tarixni yuklashda xatolik yuz berdi');
      }
    })();
  }, []);

  function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('uz-UZ').format(amount);
  }

  // Calculate rental days (boshlanish kuni hisobga olinmaydi)
  function calculateDays(rental) {
    const start = new Date(rental.startDate);
    const end = rental.returnDate ? new Date(rental.returnDate) : new Date();
    
    // Faqat sana qismini olish (vaqtni e'tiborsiz qoldirish)
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Agar bir xil kun bo'lsa, 1 kun hisoblanadi
    return diffDays === 0 ? 1 : diffDays;
  }



  // Get all products from rentals
  const products = [];
  if (Array.isArray(rentals)) {
    rentals.forEach(rental => {
      if (rental && rental.product && rental.product._id && !products.find(p => p && p._id === rental.product._id)) {
        products.push(rental.product);
      }
    });
  }

  // Filter returned rentals
  const returnedRentals = Array.isArray(rentals) ? rentals.filter(r => r && r.returnDate) : [];

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div className="premium-card mb-8">
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '2rem',
            fontWeight: '700',
            color: '#1e293b'
          }}>
            <FaHistory style={{ marginRight: '0.5rem' }} /> {transliterate('Ijara tarixi')}
          </h1>
          <p style={{
            margin: '0.5rem 0 0 0',
            color: '#94a3b8',
            fontSize: '1.1rem',
            fontWeight: '500'
          }}>
            {transliterate('Tugallangan ijaralar ro\'yxati')}
          </p>
        </div>
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

      {/* History Table */}
      <div className="premium-table-container">
        <table className="premium-table">
          <thead>
            <tr>
              <th><FaBox style={{ marginRight: '0.5rem' }} /> {transliterate('Mahsulot')}</th>
              <th><FaUser style={{ marginRight: '0.5rem' }} /> {transliterate('Mijoz')}</th>
              <th><FaPhone style={{ marginRight: '0.5rem' }} /> {transliterate('Telefon')}</th>
              <th><FaSortNumericUp style={{ marginRight: '0.5rem' }} /> {transliterate('Miqdori')}</th>
              <th><FaCalendarAlt style={{ marginRight: '0.5rem' }} /> {transliterate('Boshlanish')}</th>
              <th><FaUndo style={{ marginRight: '0.5rem' }} /> {transliterate('Qaytarish')}</th>
              <th><FaClock style={{ marginRight: '0.5rem' }} /> {transliterate('Kunlar')}</th>
              <th><FaDollarSign style={{ marginRight: '0.5rem' }} /> {transliterate('Jami')}</th>
            </tr>
          </thead>
          <tbody>
            {returnedRentals.length === 0 ? (
              <tr>
                <td colSpan="8" className="premium-empty-state">
                  <div className="premium-empty-state-icon"><FaHistory style={{ fontSize: '3rem', color: '#94a3b8' }} /></div>
                  <div className="premium-empty-state-text">Ijara tarixi mavjud emas</div>
                  <div className="premium-empty-state-description">Hali hech qanday ijara tugallanmagan</div>
                </td>
              </tr>
            ) : (
              returnedRentals.map((r, index) => {
                const product = r.product || (products && products.find(p => p && p._id === r.productId));
                // To'g'ridan-to'g'ri hisoblash
                const days = calculateDays(r);
                const quantity = r.quantity || 1;
                const dailyPrice = product?.dailyPrice || 0;
                const totalAmount = days * dailyPrice * quantity;
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
                        {product ? product.name : transliterate('Noma\'lum mahsulot')}
                      </div>
                    </td>
                    <td style={{ color: '#e2e8f0' }}>{r.clientName || '-'}</td>
                    <td style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{r.clientPhone || '-'}</td>
                    <td style={{ textAlign: 'center', fontWeight: '600', color: '#5b8cff' }}>{r.quantity || 1}</td>
                    <td style={{ color: '#94a3b8' }}>{formatDate(r.startDate)}</td>
                    <td style={{ color: '#10b981', fontWeight: '500' }}>{formatDate(r.returnDate)}</td>
                    <td style={{ textAlign: 'center', fontWeight: '600', color: '#fbbf24' }}>{calculateDays(r)}</td>
                    <td style={{ fontWeight: '700', color: '#fbbf24', fontSize: '1.1rem' }}>
                      {formatCurrency(totalAmount)} so'm
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