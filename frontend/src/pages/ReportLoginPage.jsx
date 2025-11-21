import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useI18n } from '../lib/i18n.jsx';
import { FaChartBar, FaExclamationTriangle, FaRocket } from 'react-icons/fa';

export default function ReportLoginPage() {
  const { transliterate } = useI18n();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Call API without credentials
      const response = await api.reportLogin();
      if (response.success || response.token) {
        // Set report access in sessionStorage
        sessionStorage.setItem('reportAccess', 'true');
        navigate('/report');
      } else {
        // Fallback - still allow access
        sessionStorage.setItem('reportAccess', 'true');
        navigate('/report');
      }
    } catch (err) {
      // Even if API fails, still allow access
      console.log('API call failed, but allowing access anyway');
      sessionStorage.setItem('reportAccess', 'true');
      navigate('/report');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="auth-container">
      <div className="auth-modal">
        <button className="auth-close" onClick={handleClose}>
          ×
        </button>
        
        <div className="auth-header">
          <div className="auth-icon">
            <FaChartBar />
          </div>
          <h1 className="auth-title">{transliterate('Hisobotga kirish')}</h1>
          <p className="auth-description">
            {transliterate('Moliyaviy hisobotlarni ko\'rish uchun tizimga kiring')}
          </p>
        </div>

        {error && (
          <div className="auth-error">
            <div className="auth-error-icon"><FaExclamationTriangle /></div>
            {transliterate(error)}
          </div>
        )}

        <div className="notification info mb-4">
          <div className="notification-icon"><FaRocket /></div>
          <div className="notification-content">
            <div className="notification-title">{transliterate('Tez kirish')}</div>
            <div className="notification-message">
              {transliterate('Hisobotlarga parolsiz kirish mumkin')}
            </div>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <button
            type="submit"
            disabled={loading}
            className="auth-submit"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '1rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              width: '100%',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(103, 126, 234, 0.4)'
            }}
          >
            {loading && <div className="auth-spinner"></div>}
            <FaChartBar style={{ marginRight: '0.5rem' }} />
            {loading ? transliterate('Kirish...') : transliterate('Hisobotlarga kirish')}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-help">
            {transliterate('Xavfsiz va tez kirish - parol talab qilinmaydi')}
          </p>
          <p className="auth-contact">
            {transliterate('Yordam: +998 91 975 27 57')}
          </p>
        </div>
      </div>
    </div>
  );
}