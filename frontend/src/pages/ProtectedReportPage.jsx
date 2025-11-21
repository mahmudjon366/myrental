import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../lib/i18n';
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';

export default function ProtectedReportPage() {
  const { t, transliterate } = useI18n();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send login request to backend
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/auth/report-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Set authentication token
        localStorage.setItem('token', data.token);
        sessionStorage.setItem('reportAccess', 'true');
        navigate('/report');
      } else {
        setError(data.error || 'Login yoki parol noto\'g\'ri kiritildi');
      }
    } catch (error) {
      setError('Serverga ulanishda xatolik yuz berdi');
    }
    
    setLoading(false);
  };

  const handleBack = () => {
    navigate('/products');
  };

  return (
    <div className="auth-container">
      <div className="auth-modal">
        {/* Close Button */}
        <button 
          onClick={handleBack}
          className="auth-close"
          title={transliterate('Yopish')}
        >
          ×
        </button>

        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon">
            <FaLock />
          </div>
          <h2 className="auth-title">{transliterate('Hisobotga kirish')}</h2>
          <p className="auth-description">
            {transliterate('Moliyaviy hisobotlarni ko\'rish uchun tizimga kiring')}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="auth-error">
            <span className="auth-error-icon"><FaExclamationTriangle /></span>
            <span>{transliterate(error)}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">{transliterate('Foydalanuvchi nomi')}</label>
            <input
              type="text"
              className="auth-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={transliterate('Login kiriting')}
              required
              autoFocus
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">{transliterate('Parol')}</label>
            <div className="auth-password-container">
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-input auth-password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={transliterate('Parolni kiriting')}
                required
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading || !username.trim() || !password.trim()}
          >
            {loading ? (
              <>
                <div className="auth-spinner"></div>
                {transliterate('Tekshirilmoqda...')}
              </>
            ) : (
              <>
                <FaLock />
                {transliterate('Kirish')}
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p className="auth-help">
            {transliterate('Kirish ma\'lumotlarini unutdingizmi?')}
          </p>
          <p className="auth-contact">
            {transliterate('Administrator bilan bog\'laning: +998 91 975 27 57')}
          </p>
        </div>
      </div>
    </div>
  );
}