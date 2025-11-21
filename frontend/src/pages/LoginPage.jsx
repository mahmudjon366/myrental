import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../lib/i18n.jsx';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaRocket, FaExclamationTriangle } from 'react-icons/fa';

export default function LoginPage() {
  const { transliterate } = useI18n();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Disable body scroll when component mounts
  useEffect(() => {
    document.body.classList.add('auth-page');
    
    // Cleanup when component unmounts
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Automatic login - no password required
    localStorage.setItem('token', 'admin-token');
    localStorage.setItem('user', 'admin');
    
    // Small delay for better UX
    setTimeout(() => {
      navigate('/products');
    }, 500);
  };

  const clearError = () => {
    setError('');
  };

  return (
    <div className="auth-container">
      <div className="auth-modal">
        <div className="auth-header">
          <div className="auth-icon">
            <FaUser />
          </div>
          <h1 className="auth-title">{transliterate('Rentacloud')}</h1>
          <p className="auth-description">
            {transliterate('Tizimga kirish uchun login ma\'lumotlarini kiriting')}
          </p>
        </div>

        {/* Login Info */}
        <div className="notification info mb-4">
          <div className="notification-icon"><FaRocket /></div>
          <div className="notification-content">
            <div className="notification-title">{transliterate('Tez kirish')}</div>
            <div className="notification-message">
              {transliterate('Parol talab qilinmaydi - faqat "Kirish" tugmasini bosing')}
            </div>
          </div>
        </div>

        {error && (
          <div className="auth-error">
            <div className="auth-error-icon"><FaExclamationTriangle /></div>
            {transliterate(error)}
          </div>
        )}

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
            <FaArrowRight />
            {loading ? transliterate('Kirish...') : transliterate('💎 Rentacloud ga kirish')}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-help">
            {transliterate('Parolsiz kirish - xavfsiz va tez')}
          </p>
          <p className="auth-contact">
            {transliterate('Yordam: +998 91 975 27 57')}
          </p>
        </div>
      </div>
    </div>
  );
}