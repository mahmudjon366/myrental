import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaGlobe, FaBox, FaHome, FaHistory, FaChartBar, FaSignOutAlt, FaBuilding } from 'react-icons/fa';
import { useI18n } from '../lib/i18n.jsx';
import { api } from '../lib/api.js';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [historyCount, setHistoryCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { script, setScript, transliterate } = useI18n();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const toggleScript = () => {
    setScript(script === 'latin' ? 'cyrillic' : 'latin');
  };

  const handleReportClick = (e) => {
    e.preventDefault();
    sessionStorage.removeItem('reportAccess');
    navigate('/report-login');
  };

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Tugallangan ijaralar sonini olish
  useEffect(() => {
    const fetchHistoryCount = async () => {
      try {
        const rentals = await api.listRentals();
        const returnedRentals = rentals.filter(r => r && r.returnDate);
        setHistoryCount(returnedRentals.length);
      } catch (error) {
        console.error('Tarix sonini olishda xatolik:', error);
      }
    };

    fetchHistoryCount();

    // Custom event listener for rental updates
    const handleRentalUpdate = () => {
      fetchHistoryCount();
    };

    window.addEventListener('rentalUpdated', handleRentalUpdate);

    return () => {
      window.removeEventListener('rentalUpdated', handleRentalUpdate);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const navbar = document.querySelector('.navbar');
      if (isOpen && navbar && !navbar.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <nav style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      padding: '1rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative'
      }}>
        <Link to="/" style={{
          fontSize: '1.75rem',
          fontWeight: '700',
          color: '#1e293b',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{
            background: '#1e293b',
            color: 'white',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            marginRight: '0.5rem',
            fontWeight: '700',
            fontSize: '0.875rem'
          }}>RC</span>
          Rentacloud
        </Link>

        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="btn secondary small"
          style={{
            display: isMobile ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            padding: '0'
          }}
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>

        <ul style={{
          display: isMobile ? (isOpen ? 'flex' : 'none') : 'flex',
          position: isMobile ? 'absolute' : 'static',
          top: isMobile ? '100%' : 'auto',
          left: isMobile ? 0 : 'auto',
          right: isMobile ? 0 : 'auto',
          background: '#ffffff',
          ...(isMobile ? {
            borderLeft: '1px solid #e2e8f0',
            borderRight: '1px solid #e2e8f0',
            borderBottom: '1px solid #e2e8f0',
            borderRadius: '0 0 0.75rem 0.75rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          } : {}),
          flexDirection: isMobile ? 'column' : 'row',
          padding: isMobile ? '1rem' : '0',
          zIndex: 999,
          margin: 0,
          listStyle: 'none',
          gap: '0.5rem'
        }}>
          <li>
            <Link
              to="/products"
              className={`btn ${(location.pathname === '/products' || location.pathname === '/add-product') ? '' : 'ghost'} small`}
              style={{
                textDecoration: 'none',
                width: isMobile ? '100%' : 'auto',
                justifyContent: isMobile ? 'flex-start' : 'center'
              }}
            >
              <FaBox />
              {transliterate('Mahsulotlar')}
            </Link>
          </li>
          <li>
            <Link
              to="/rentals"
              className={`btn ${(location.pathname === '/rentals' || location.pathname === '/start-rental') ? '' : 'ghost'} small`}
              style={{
                textDecoration: 'none',
                width: isMobile ? '100%' : 'auto',
                justifyContent: isMobile ? 'flex-start' : 'center'
              }}
            >
              <FaHome />
              {transliterate('Faol ijaralar')}
            </Link>
          </li>
          <li>
            <Link
              to="/history"
              className={`btn ${location.pathname === '/history' ? '' : 'ghost'} small`}
              style={{
                textDecoration: 'none',
                width: isMobile ? '100%' : 'auto',
                justifyContent: isMobile ? 'flex-start' : 'center'
              }}
            >
              <FaHistory />
              {transliterate('Tarix')}
              <span style={{
                background: '#64748b',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: '600',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.375rem',
                minWidth: '1.5rem',
                height: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '0.5rem'
              }}>{historyCount}</span>
            </Link>
          </li>
          <li>
            <a
              href="/report"
              onClick={handleReportClick}
              className={`btn ${(location.pathname === '/report' || location.pathname === '/report-login') ? '' : 'ghost'} small`}
              style={{
                textDecoration: 'none',
                width: isMobile ? '100%' : 'auto',
                justifyContent: isMobile ? 'flex-start' : 'center'
              }}
            >
              <FaChartBar />
              {transliterate('Hisobot')}
            </a>
          </li>
          {isMobile && (
            <>
              <li>
                <button
                  onClick={toggleScript}
                  className="btn ghost small"
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start'
                  }}
                  title={`${transliterate('Alifbani')} ${script === 'latin' ? transliterate('kiril') : transliterate('lotin')}${transliterate('ga o\'zgartirish')}`}
                >
                  <FaGlobe />
                  {script === 'latin' ? 'Кирил' : 'Lotin'}
                </button>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="btn danger small"
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start'
                  }}
                >
                  <FaSignOutAlt />
                  {transliterate('Chiqish')}
                </button>
              </li>
            </>
          )}
        </ul>

        <div style={{
          display: isMobile ? 'none' : 'flex',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
          <button
            onClick={toggleScript}
            className="btn ghost small"
            title={`${transliterate('Alifbani')} ${script === 'latin' ? transliterate('kiril') : transliterate('lotin')}${transliterate('ga o\'zgartirish')}`}
          >
            <FaGlobe />
            <span>
              {script === 'latin' ? 'Кирил' : 'Lotin'}
            </span>
          </button>
          <button
            onClick={handleLogout}
            className="btn danger small"
          >
            <FaSignOutAlt />
            <span>
              {transliterate('Chiqish')}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;