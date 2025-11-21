import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navigation from './components/Navigation';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Rentals from './pages/Rentals';
import Reports from './pages/Reports';
import Backup from './pages/Backup';
import ReportLoginPage from './pages/ReportLoginPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Container fluid className="mt-3">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/rentals" element={<Rentals />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/report-login" element={<ReportLoginPage />} />
            <Route path="/backup" element={<Backup />} />
          </Routes>
        </Container>
        <PWAInstallPrompt />
      </div>
    </Router>
  );
}

export default App;