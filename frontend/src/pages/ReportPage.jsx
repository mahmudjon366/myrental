import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useI18n } from '../lib/i18n.jsx';
import { FaChartLine, FaCalendarAlt, FaMoneyBillWave, FaSignOutAlt, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

export default function ReportPage() {
  const { transliterate } = useI18n();
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [filteredRentals, setFilteredRentals] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalAllTimeIncome, setTotalAllTimeIncome] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    // Check if user has report access
    const hasAccess = sessionStorage.getItem('reportAccess') === 'true';
    if (!hasAccess) {
      navigate('/report-login');
      return;
    }

    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (rentals.length > 0) {
      filterRentalsByMonth(rentals, selectedDate);
    }
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch rentals using existing API
      const rentalsData = await api.listRentals();
      setRentals(rentalsData);

      // Filter rentals by selected month
      filterRentalsByMonth(rentalsData, selectedDate);
    } catch (err) {
      setError(err.message || 'Ma\'lumotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const filterRentalsByMonth = (rentalsData, date) => {
    const selectedMonth = date.getMonth();
    const selectedYear = date.getFullYear();

    const filtered = rentalsData.filter(rental => {
      if (!rental.returnDate) return false;

      const returnDate = new Date(rental.returnDate);
      return returnDate.getMonth() === selectedMonth && returnDate.getFullYear() === selectedYear;
    });

    setFilteredRentals(filtered);

    // Calculate total income for selected month
    let monthlyIncome = 0;
    filtered.forEach(rental => {
      if (rental.product) {
        const days = calculateDays(rental);
        const income = days * rental.product.dailyPrice * (rental.quantity || 1);
        monthlyIncome += income;
      }
    });
    setTotalIncome(monthlyIncome);

    // Calculate total all-time income
    let allTimeIncome = 0;
    rentalsData.forEach(rental => {
      if (rental.returnDate && rental.product) {
        const days = calculateDays(rental);
        const income = days * rental.product.dailyPrice * (rental.quantity || 1);
        allTimeIncome += income;
      }
    });
    setTotalAllTimeIncome(allTimeIncome);
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setShowDatePicker(false);
    filterRentalsByMonth(rentals, newDate);
  };

  const generateMonthOptions = () => {
    const months = [];
    const currentDate = new Date();

    // Generate last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push(date);
    }

    return months;
  };

  const handleLogout = () => {
    sessionStorage.removeItem('reportAccess');
    navigate('/report-login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const calculateDays = (rental) => {
    const start = new Date(rental.startDate);
    const end = rental.returnDate ? new Date(rental.returnDate) : new Date();
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const hasAccess = sessionStorage.getItem('reportAccess') === 'true';
  if (!hasAccess) {
    return null;
  }

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Premium Header */}
      <div className="premium-card mb-8 flex justify-between items-center">
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '2.5rem', 
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            📊 {transliterate('Hisobotlar')}
          </h1>
          <p style={{ 
            margin: '0.5rem 0 0 0', 
            color: '#64748b', 
            fontSize: '1.1rem',
            fontWeight: '500'
          }}>
            Moliyaviy hisobotlar va statistika
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="btn-premium btn-premium-danger"
        >
          <FaSignOutAlt />
          <span className="hidden md:inline">{transliterate('Chiqish')}</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="notification error mb-4 fade-in">
          <div className="notification-icon"><FaExclamationTriangle /></div>
          <div className="notification-content">
            <div className="notification-title">{transliterate('Xatolik')}</div>
            <div className="notification-message">{transliterate(error)}</div>
          </div>
          <button className="notification-close" onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Report Summary Cards */}
      <div className="report-summary-cards mb-6">
        <div
          className="report-card monthly clickable"
          onClick={() => setShowDatePicker(true)}
          title={transliterate('Oy tanlash uchun bosing')}
        >
          <div className="report-card-icon">
            <FaCalendarAlt />
          </div>
          <div className="report-card-content">
            <div className="report-card-title">{transliterate('Oylik daromad')}</div>
            <div className="report-card-value">
              {new Intl.NumberFormat('uz-UZ').format(totalIncome)} {transliterate('so\'m')}
            </div>
            <div className="report-card-subtitle">
              {transliterate(selectedDate.toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' }))}
            </div>
          </div>
        </div>

        <div className="report-card total">
          <div className="report-card-icon">
            <FaMoneyBillWave />
          </div>
          <div className="report-card-content">
            <div className="report-card-title">{transliterate('Umumiy daromad')}</div>
            <div className="report-card-value">
              {new Intl.NumberFormat('uz-UZ').format(totalAllTimeIncome)} {transliterate('so\'m')}
            </div>
            <div className="report-card-subtitle">
              {transliterate('Barcha vaqt davomida')}
            </div>
          </div>
        </div>

        <div
          className="report-card stats clickable"
          onClick={() => setShowDatePicker(true)}
          title={transliterate('Oy tanlash uchun bosing')}
        >
          <div className="report-card-icon">
            <FaChartLine />
          </div>
          <div className="report-card-content">
            <div className="report-card-title">{transliterate('Oylik ijaralar')}</div>
            <div className="report-card-value">
              {filteredRentals.length} {transliterate('ta')}
            </div>
            <div className="report-card-subtitle">
              {filteredRentals.length > 0 ?
                `${transliterate('O\'rtacha')}: ${new Intl.NumberFormat('uz-UZ').format(Math.round(totalIncome / filteredRentals.length))} ${transliterate('so\'m')}` :
                transliterate('Ma\'lumot yo\'q')
              }
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="report-controls mb-4">
        <button
          className="btn primary"
          onClick={() => setShowDatePicker(!showDatePicker)}
        >
          <FaCalendarAlt />
          {transliterate('Oy tanlash')}: {transliterate(selectedDate.toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' }))}
        </button>
      </div>

      {/* Month Picker Modal */}
      {showDatePicker && (
        <div className="date-picker-overlay fade-in" onClick={() => setShowDatePicker(false)}>
          <div className="date-picker-modal" onClick={e => e.stopPropagation()}>
            <div className="date-picker-header">
              <h3>{transliterate('Oy tanlang')}</h3>
              <button
                className="date-picker-close"
                onClick={() => setShowDatePicker(false)}
              >
                ×
              </button>
            </div>
            <div className="date-picker-content">
              {generateMonthOptions().map((date, index) => (
                <button
                  key={index}
                  className={`date-picker-option ${date.getMonth() === selectedDate.getMonth() &&
                    date.getFullYear() === selectedDate.getFullYear()
                    ? 'active' : ''
                    }`}
                  onClick={() => handleDateChange(date)}
                >
                  {transliterate(date.toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' }))}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Report Table */}
      <div className="table-container fade-in">
        <h3 className="mb-4">{transliterate('Moliyaviy hisobot')}</h3>

        {loading ? (
          <div className="loading-container">
            <FaSpinner className="loading-spinner" />
            <span>{transliterate('Yuklanmoqda...')}</span>
          </div>
        ) : (
          <div className="scrollable-table">
            <table className="table">
              <thead>
                <tr>
                  <th>{transliterate('№')}</th>
                  <th>{transliterate('Mahsulot nomi')}</th>
                  <th>{transliterate('Mijoz')}</th>
                  <th>{transliterate('Telefon')}</th>
                  <th className="hidden-mobile">{transliterate('Boshlanish sanasi')}</th>
                  <th className="hidden-mobile">{transliterate('Tugash sanasi')}</th>
                  <th>{transliterate('Kunlar soni')}</th>
                  <th>{transliterate('Kunlik narx')}</th>
                  <th>{transliterate('Jami summa')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRentals.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <FaChartLine className="w-12 h-12 mb-2 opacity-50" />
                        <span className="text-sm">{transliterate('Tanlangan oyda hech qanday ijara topilmadi')}</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {filteredRentals.map((rental, index) => {
                      const days = calculateDays(rental);
                      const dailyPrice = rental.product?.dailyPrice || 0;
                      const totalPrice = days * dailyPrice * (rental.quantity || 1);

                      return (
                        <tr key={rental._id}>
                          <td className="text-center">{index + 1}</td>
                          <td>
                            <div className="font-semibold">
                              {transliterate(rental.product?.name || 'Noma\'lum')}
                            </div>
                            {rental.quantity > 1 && (
                              <div className="text-sm opacity-75">
                                {rental.quantity} {transliterate('dona')}
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="font-semibold">
                              {transliterate(rental.clientName)}
                            </div>
                          </td>
                          <td>
                            <div className="font-mono">
                              {rental.clientPhone}
                            </div>
                          </td>
                          <td className="hidden-mobile">
                            <div className="font-mono">
                              {formatDate(rental.startDate)}
                            </div>
                          </td>
                          <td className="hidden-mobile">
                            <div className="font-mono">
                              {formatDate(rental.returnDate)}
                            </div>
                          </td>
                          <td className="text-center">
                            <div className="font-semibold">
                              {days}
                            </div>
                          </td>
                          <td className="text-right">
                            <div className="font-semibold">
                              {new Intl.NumberFormat('uz-UZ').format(dailyPrice)} {transliterate('so\'m')}
                            </div>
                          </td>
                          <td className="text-right">
                            <div className="font-semibold success">
                              {new Intl.NumberFormat('uz-UZ').format(totalPrice)} {transliterate('so\'m')}
                            </div>
                            <div className="visible-mobile text-sm opacity-75">
                              {formatDate(rental.startDate)} - {formatDate(rental.returnDate)}
                            </div>
                            <div className="visible-mobile text-sm opacity-75">
                              {days} {transliterate('kun')} × {new Intl.NumberFormat('uz-UZ').format(dailyPrice)} {transliterate('so\'m')}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {/* Summary Row */}
                    <tr className="summary-row">
                      <td colSpan="8" className="text-right font-semibold">
                        {transliterate('JAMI:')}
                      </td>
                      <td className="text-right">
                        <div className="font-bold success summary-total">
                          {new Intl.NumberFormat('uz-UZ').format(totalIncome)} {transliterate('so\'m')}
                        </div>
                      </td>
                    </tr>
                    {/* Statistics Row */}
                    <tr className="stats-row">
                      <td colSpan="9" className="text-center">
                        <div className="report-stats">
                          <span className="stat-item">
                            <FaChartLine className="stat-icon" />
                            {transliterate('Jami ijaralar')}: <strong>{filteredRentals.length} ta</strong>
                          </span>
                          <span className="stat-item">
                            <FaMoneyBillWave className="stat-icon" />
                            {transliterate('O\'rtacha daromad')}: <strong>{filteredRentals.length > 0 ? new Intl.NumberFormat('uz-UZ').format(Math.round(totalIncome / filteredRentals.length)) : '0'} {transliterate('so\'m')}</strong>
                          </span>
                          <span className="stat-item">
                            <FaCalendarAlt className="stat-icon" />
                            {transliterate('Tanlangan oy')}: <strong>{transliterate(selectedDate.toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' }))}</strong>
                          </span>
                        </div>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}