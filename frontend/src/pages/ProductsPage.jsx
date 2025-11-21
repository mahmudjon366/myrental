import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useI18n } from '../lib/i18n.jsx';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaCamera } from 'react-icons/fa';

export default function ProductsPage() {
  const { t, transliterate } = useI18n();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', dailyPrice: '', imageUrl: '' });
  const [showEditModal, setShowEditModal] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setError('');
      const data = await api.listProducts();
      setProducts(data);
    } catch (e) {
      console.error('Error loading products:', e);
      setError(e.message || 'Mahsulotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onDelete(p) {
    if (!window.confirm(`"${p.name}" mahsulotini o'chirishni xohlaysizmi?`)) return;
    try {
      await api.deleteProduct(p._id);
      await load();
    } catch (e) {
      setError(e.message || 'Mahsulotni o\'chirishda xatolik yuz berdi');
    }
  }

  function onStartEdit(p) {
    console.log('Edit tugmasi bosildi:', p);
    setEditId(p._id);
    setEditForm({ name: p.name, dailyPrice: p.dailyPrice, imageUrl: p.imageUrl || '' });
    setShowEditModal(true);
    console.log('Modal ochilishi kerak:', true);
  }

  async function onSaveEdit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const payload = { ...editForm };
      await api.updateProduct(editId, payload);
      setEditId(null);
      setEditForm({ name: '', dailyPrice: '', imageUrl: '' });
      setShowEditModal(false);
      await load();
    } catch (e) {
      setError(e.message || 'Saqlashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }

  function onCancelEdit() {
    setEditId(null);
    setEditForm({ name: '', dailyPrice: '', imageUrl: '' });
    setShowEditModal(false);
  }

  // Calculate products statistics
  const totalProducts = products.length;
  const averagePrice = totalProducts > 0 ? 
    products.reduce((sum, p) => sum + (p.dailyPrice || 0), 0) / totalProducts : 0;
  const maxPrice = totalProducts > 0 ? 
    Math.max(...products.map(p => p.dailyPrice || 0)) : 0;

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
            ✨ Mahsulotlar
          </h1>
          <p style={{
            margin: '0.5rem 0 0 0',
            color: '#94a3b8',
            fontSize: '1.1rem',
            fontWeight: '500'
          }}>
            Jami {products.length} ta mahsulot
          </p>
        </div>
        <button
          onClick={() => navigate('/add-product')}
          className="btn-premium btn-premium-primary"
          style={{ fontSize: '1rem', padding: '1rem 2rem' }}
        >
          <FaPlus />
          Yangi mahsulot
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="premium-notification error mb-8 animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
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

      {/* Products Table */}
      <div className="premium-table-container">
        <table className="premium-table">
          <thead>
            <tr>
              <th>📦 Mahsulot nomi</th>
              <th>💰 Kunlik narx</th>
              <th>🖼️ Rasm</th>
              <th style={{ textAlign: 'right' }}>⚙️ Amallar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="premium-loading">
                  <div className="premium-loading-spinner animate-spin"></div>
                  <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Yuklanmoqda...</span>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="4" className="premium-empty-state">
                  <div className="premium-empty-state-icon">📦</div>
                  <div className="premium-empty-state-text">Mahsulotlar mavjud emas</div>
                  <div className="premium-empty-state-description">Yangi mahsulot qo'shish uchun yuqoridagi tugmani bosing</div>
                </td>
              </tr>
            ) : (
              products.map((p, index) => (
                <tr key={p._id || index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <td style={{ fontWeight: '600', fontSize: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #5b8cff, #fbbf24)'
                      }}></div>
                      {p.name || 'Noma\'lum mahsulot'}
                    </div>
                  </td>
                  <td>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: '600',
                      color: '#fbbf24'
                    }}>
                      <span style={{ fontSize: '1.1rem' }}>
                        {p.dailyPrice ? `${p.dailyPrice.toLocaleString()}` : '0'}
                      </span>
                      <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>so'm</span>
                    </div>
                  </td>
                  <td>
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '12px',
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                          transition: 'transform 0.2s ease'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                      />
                    ) : (
                      <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'linear-gradient(135deg, #1a2332, #243247)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                        color: '#5b8cff'
                      }}>
                        🖼️
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="flex gap-4 justify-end">
                      <button
                        onClick={() => onStartEdit(p)}
                        className="btn-premium btn-premium-primary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                      >
                        <FaEdit />
                        Tahrirlash
                      </button>
                      <button
                        onClick={() => onDelete(p)}
                        className="btn-premium btn-premium-danger"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                      >
                        <FaTrash />
                        O'chirish
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={onCancelEdit}
        >
          <div
            style={{
              background: 'rgba(15, 23, 48, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '1.5rem',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(91, 140, 255, 0.2)',
              color: '#e2e8f0'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              padding: '2rem 2rem 1rem',
              borderBottom: '1px solid rgba(91, 140, 255, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #5b8cff, #fbbf24)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                ✏️ Mahsulotni tahrirlash
              </h3>
              <button
                onClick={onCancelEdit}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={onSaveEdit}>
                <div className="premium-form-group">
                  <label className="premium-form-label">📝 Mahsulot nomi</label>
                  <input
                    type="text"
                    className="premium-form-input"
                    value={editForm.name}
                    onChange={e => setEditForm(v => ({ ...v, name: e.target.value }))}
                    placeholder="Mahsulot nomini kiriting..."
                    required
                  />
                </div>
                <div className="premium-form-group">
                  <label className="premium-form-label">💰 Kunlik narx (so'm)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    className="premium-form-input"
                    value={editForm.dailyPrice}
                    onChange={e => setEditForm(v => ({ ...v, dailyPrice: e.target.value }))}
                    placeholder="Masalan: 50000"
                    required
                  />
                </div>
                <div className="premium-form-group">
                  <label className="premium-form-label">🖼️ Rasm manzili (ixtiyoriy)</label>
                  <input
                    type="url"
                    className="premium-form-input"
                    value={editForm.imageUrl}
                    onChange={e => setEditForm(v => ({ ...v, imageUrl: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="flex justify-end gap-4" style={{ paddingTop: '1.5rem' }}>
                  <button
                    type="button"
                    className="btn-premium btn-premium-secondary"
                    onClick={onCancelEdit}
                    disabled={loading}
                  >
                    <FaTimes />
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="btn-premium btn-premium-success"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="animate-spin" style={{
                        width: '1rem',
                        height: '1rem',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%'
                      }}></div>
                    ) : (
                      <FaCamera />
                    )}
                    Saqlash
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}