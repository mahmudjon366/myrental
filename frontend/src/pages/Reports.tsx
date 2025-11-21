import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Button } from 'react-bootstrap';
import { reportService } from '../services/reportService';
import { isAuthenticated, logout } from '../lib/auth';

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState<any[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      navigate('/report-login');
      return;
    }
    
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch rentals
      const rentalsData = await reportService.getRentals();
      setRentals(rentalsData);
      
      // Fetch total income
      const incomeData = await reportService.getTotalIncome();
      setTotalIncome(incomeData.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/report-login');
  };

  if (!isAuthenticated()) {
    return null; // or redirect component
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1>Hisobotlar</h1>
            <Button variant="outline-danger" onClick={handleLogout}>
              Chiqish
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Row>
          <Col>
            <div className="alert alert-danger">
              {error}
            </div>
          </Col>
        </Row>
      )}

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Umumiy daromad</Card.Title>
              <Card.Text className="display-6 text-success">
                ${totalIncome.toFixed(2)}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Jami ijaralar</Card.Title>
              <Card.Text className="display-6">
                {rentals.length}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Oy</Card.Title>
              <Card.Text className="display-6 text-primary">
                {new Date().toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' })}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Rentals Table */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Ijara tarixi</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Yuklanmoqda...</span>
                  </div>
                </div>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Mahsulot</th>
                      <th>Mijoz</th>
                      <th>Boshlanish sanasi</th>
                      <th>Tugash sanasi</th>
                      <th>Kunlar</th>
                      <th>Umumiy narx</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rentals.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          <i className="fas fa-file-invoice fa-2x text-muted mb-2"></i>
                          <p className="text-muted">Hech qanday ijara topilmadi</p>
                        </td>
                      </tr>
                    ) : (
                      rentals.map((rental) => (
                        <tr key={rental._id}>
                          <td>
                            <strong>{rental.product?.name || 'N/A'}</strong>
                          </td>
                          <td>
                            <div>{rental.clientName}</div>
                            <small className="text-muted">{rental.clientPhone}</small>
                          </td>
                          <td>{new Date(rental.startDate).toLocaleDateString('uz-UZ')}</td>
                          <td>
                            {rental.returnDate 
                              ? new Date(rental.returnDate).toLocaleDateString('uz-UZ')
                              : <span className="badge bg-warning">Faol</span>
                            }
                          </td>
                          <td>{rental.totalDays || '-'}</td>
                          <td className="text-success fw-bold">
                            ${rental.totalPrice?.toFixed(2) || '0.00'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Reports;