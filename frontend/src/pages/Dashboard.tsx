import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { customerService } from '../services/customerService';
import { rentalService } from '../services/rentalService';
import { ProductStats, CustomerStats, RentalStats } from '../types';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const [productStats, setProductStats] = useState<ProductStats | null>(null);
  const [customerStats, setCustomerStats] = useState<CustomerStats | null>(null);
  const [rentalStats, setRentalStats] = useState<RentalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Temporarily comment out API calls to test rendering
      // const [products, customers, rentals] = await Promise.all([
      //   productService.getStats(),
      //   customerService.getStats(),
      //   rentalService.getStats(),
      // ]);
      
      // setProductStats(products);
      // setCustomerStats(customers);
      // setRentalStats(rentals);
      
      // Set default data to test rendering
      setProductStats({ total: 0, available: 0, rented: 0, outOfStock: 0 });
      setCustomerStats({ total: 0, active: 0, topCustomers: [] });
      setRentalStats({ active: 0, total: 0, overdue: 0, returned: 0, totalRevenue: 0 });
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Dashboard</h1>
        <Button variant="outline-primary" onClick={fetchDashboardData}>
          <i className="fas fa-sync-alt me-2"></i>
          Refresh
        </Button>
      </div>

      {/* Product Statistics */}
      <Row className="mb-4">
        <Col>
          <h3 className="mb-3">Product Overview</h3>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title className="text-primary">
                <i className="fas fa-box fa-2x mb-2"></i>
              </Card.Title>
              <Card.Text>
                <h4>{productStats?.total || 0}</h4>
                <small className="text-muted">Total Products</small>
              </Card.Text>
              <Link to="/products" className="btn btn-outline-primary btn-sm">
                View All
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title className="text-success">
                <i className="fas fa-check-circle fa-2x mb-2"></i>
              </Card.Title>
              <Card.Text>
                <h4>{productStats?.available || 0}</h4>
                <small className="text-muted">Available</small>
              </Card.Text>
              <Link to="/products?status=available" className="btn btn-outline-success btn-sm">
                View Available
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title className="text-warning">
                <i className="fas fa-handshake fa-2x mb-2"></i>
              </Card.Title>
              <Card.Text>
                <h4>{productStats?.rented || 0}</h4>
                <small className="text-muted">Currently Rented</small>
              </Card.Text>
              <Link to="/products?status=rented" className="btn btn-outline-warning btn-sm">
                View Rented
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title className="text-danger">
                <i className="fas fa-exclamation-triangle fa-2x mb-2"></i>
              </Card.Title>
              <Card.Text>
                <h4>{productStats?.outOfStock || 0}</h4>
                <small className="text-muted">Out of Stock</small>
              </Card.Text>
              <Link to="/products" className="btn btn-outline-danger btn-sm">
                Manage Stock
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Customer and Rental Statistics */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-users me-2"></i>
                Customer Statistics
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="text-center">
                <Col>
                  <h4 className="text-primary">{customerStats?.total || 0}</h4>
                  <small className="text-muted">Total Customers</small>
                </Col>
                <Col>
                  <h4 className="text-success">{customerStats?.active || 0}</h4>
                  <small className="text-muted">Active Customers</small>
                </Col>
              </Row>
              <div className="mt-3">
                <Link to="/customers" className="btn btn-primary btn-sm me-2">
                  Manage Customers
                </Link>
                <Link to="/customers" className="btn btn-outline-primary btn-sm">
                  Add New
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-handshake me-2"></i>
                Rental Statistics
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="text-center">
                <Col>
                  <h4 className="text-primary">{rentalStats?.active || 0}</h4>
                  <small className="text-muted">Active Rentals</small>
                </Col>
                <Col>
                  <h4 className="text-danger">{rentalStats?.overdue || 0}</h4>
                  <small className="text-muted">Overdue</small>
                </Col>
              </Row>
              <div className="mt-3">
                <Link to="/rentals" className="btn btn-primary btn-sm me-2">
                  Manage Rentals
                </Link>
                <Link to="/rentals" className="btn btn-outline-primary btn-sm">
                  New Rental
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Revenue Information */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-dollar-sign me-2"></i>
                Revenue Overview
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="text-center">
                <Col md={3}>
                  <h4 className="text-success">${rentalStats?.totalRevenue?.toFixed(2) || '0.00'}</h4>
                  <small className="text-muted">Total Revenue</small>
                </Col>
                <Col md={3}>
                  <h4 className="text-info">{rentalStats?.total || 0}</h4>
                  <small className="text-muted">Total Rentals</small>
                </Col>
                <Col md={3}>
                  <h4 className="text-success">{rentalStats?.returned || 0}</h4>
                  <small className="text-muted">Completed</small>
                </Col>
                <Col md={3}>
                  <Link to="/reports" className="btn btn-success">
                    <i className="fas fa-chart-bar me-2"></i>
                    View Reports
                  </Link>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-bolt me-2"></i>
                Quick Actions
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="mb-2">
                  <Link to="/products" className="btn btn-primary w-100">
                    <i className="fas fa-plus me-2"></i>
                    Add Product
                  </Link>
                </Col>
                <Col md={3} className="mb-2">
                  <Link to="/customers" className="btn btn-success w-100">
                    <i className="fas fa-user-plus me-2"></i>
                    Add Customer
                  </Link>
                </Col>
                <Col md={3} className="mb-2">
                  <Link to="/rentals" className="btn btn-warning w-100">
                    <i className="fas fa-handshake me-2"></i>
                    New Rental
                  </Link>
                </Col>
                <Col md={3} className="mb-2">
                  <Link to="/backup" className="btn btn-info w-100">
                    <i className="fas fa-download me-2"></i>
                    Backup Data
                  </Link>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;