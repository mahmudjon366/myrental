import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Badge,
  InputGroup,
  Dropdown,
} from 'react-bootstrap';
import { rentalService } from '../services/rentalService';
import { productService } from '../services/productService';
import { customerService } from '../services/customerService';
import { Rental, Product, Customer } from '../types';
import toast from 'react-hot-toast';

const Rentals: React.FC = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formData, setFormData] = useState({
    productId: '',
    customerId: '',
    quantity: '',
    startDate: '',
    endDate: '',
    notes: '',
  });

  useEffect(() => {
    fetchRentals();
    fetchProducts();
    fetchCustomers();
  }, [searchTerm, statusFilter]);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      
      const data = await rentalService.getAll(params);
      setRentals(data.rentals);
    } catch (error) {
      toast.error('Failed to fetch rentals');
      console.error('Fetch rentals error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data.filter(p => p.availableQuantity > 0));
    } catch (error) {
      console.error('Fetch products error:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Fetch customers error:', error);
    }
  };

  const handleShowModal = () => {
    setFormData({
      productId: '',
      customerId: '',
      quantity: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      productId: '',
      customerId: '',
      quantity: '',
      startDate: '',
      endDate: '',
      notes: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId || !formData.customerId || !formData.quantity || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const rentalData = {
        productId: formData.productId,
        customerId: formData.customerId,
        quantity: parseInt(formData.quantity),
        startDate: formData.startDate,
        endDate: formData.endDate,
        notes: formData.notes,
      };

      await rentalService.create(rentalData);
      toast.success('Rental created successfully');
      handleCloseModal();
      fetchRentals();
      fetchProducts(); // Refresh products to update availability
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create rental');
    }
  };

  const handleReturn = async (rentalId: string) => {
    if (window.confirm('Mark this rental as returned?')) {
      try {
        await rentalService.returnRental(rentalId);
        toast.success('Rental returned successfully');
        fetchRentals();
        fetchProducts(); // Refresh products to update availability
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to return rental');
      }
    }
  };

  const handleCancel = async (rentalId: string) => {
    if (window.confirm('Are you sure you want to cancel this rental?')) {
      try {
        await rentalService.delete(rentalId);
        toast.success('Rental cancelled successfully');
        fetchRentals();
        fetchProducts(); // Refresh products to update availability
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to cancel rental');
      }
    }
  };

  const getStatusBadge = (rental: Rental) => {
    const now = new Date();
    const endDate = new Date(rental.endDate);
    
    if (rental.status === 'returned') {
      return <Badge bg="info">Returned</Badge>;
    } else if (now > endDate && rental.status === 'active') {
      return <Badge bg="danger">Overdue</Badge>;
    } else {
      return <Badge bg="success">Active</Badge>;
    }
  };

  const filteredRentals = rentals.filter(rental =>
    (rental.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (rental.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1>Rentals</h1>
            <Button variant="primary" onClick={handleShowModal}>
              <i className="fas fa-plus me-2"></i>
              New Rental
            </Button>
          </div>
        </Col>
      </Row>

      {/* Search and Filter */}
      <Row className="mb-3">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <i className="fas fa-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by product or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="status-filter">
              <i className="fas fa-filter me-2"></i>
              {statusFilter ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) : 'All Status'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setStatusFilter('')}>All Status</Dropdown.Item>
              <Dropdown.Item onClick={() => setStatusFilter('active')}>Active</Dropdown.Item>
              <Dropdown.Item onClick={() => setStatusFilter('returned')}>Returned</Dropdown.Item>
              <Dropdown.Item onClick={() => setStatusFilter('overdue')}>Overdue</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
        <Col md={3}>
          <Button variant="outline-primary" onClick={fetchRentals} disabled={loading}>
            <i className="fas fa-sync-alt me-2"></i>
            Refresh
          </Button>
        </Col>
      </Row>

      {/* Rentals Table */}
      <Row>
        <Col>
          <Card>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Customer</th>
                      <th>Quantity</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Total Cost</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRentals.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-4">
                          <i className="fas fa-handshake fa-2x text-muted mb-2"></i>
                          <p className="text-muted">No rentals found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredRentals.map((rental) => (
                        <tr key={rental._id}>
                          <td>
                            <strong>{rental.product?.name || 'Unknown Product'}</strong>
                            <small className="d-block text-muted">
                              ${rental.product?.price?.toFixed(2) || '0.00'}/day
                            </small>
                          </td>
                          <td>
                            <strong>{rental.customer?.name || 'Unknown Customer'}</strong>
                            <small className="d-block text-muted">
                              {rental.customer?.phone || ''}
                            </small>
                          </td>
                          <td>{rental.quantity}</td>
                          <td>{new Date(rental.startDate).toLocaleDateString()}</td>
                          <td>{new Date(rental.endDate).toLocaleDateString()}</td>
                          <td>
                            <span className="text-success fw-bold">
                              ${rental.totalAmount?.toFixed(2) || '0.00'}
                            </span>
                          </td>
                          <td>{getStatusBadge(rental)}</td>
                          <td>
                            <div className="btn-group btn-group-sm" role="group">
                              {rental.status === 'active' && (
                                <>
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => handleReturn(rental._id)}
                                    title="Return"
                                  >
                                    <i className="fas fa-check"></i>
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleCancel(rental._id)}
                                    title="Cancel"
                                  >
                                    <i className="fas fa-times"></i>
                                  </Button>
                                </>
                              )}
                            </div>
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

      {/* Add Rental Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Rental</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product *</Form.Label>
                  <Form.Select
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    required
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name} - ${product.price}/day (Available: {product.availableQuantity})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Customer *</Form.Label>
                  <Form.Select
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    required
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name} - {customer.phone}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Quantity *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Rental
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Rentals;