import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';

// Navigation component for RentaCloud application
const Navigation: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container fluid>
        <Navbar.Brand href="/">
          <i className="fas fa-tools me-2"></i>
          Ijara boshqaruv
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/">
              <Nav.Link>
                <i className="fas fa-tachometer-alt me-2"></i>
                Boshqaruv paneli
              </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/products">
              <Nav.Link>
                <i className="fas fa-box me-2"></i>
                Mahsulotlar
              </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/customers">
              <Nav.Link>
                <i className="fas fa-users me-2"></i>
                Mijozlar
              </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/rentals">
              <Nav.Link>
                <i className="fas fa-handshake me-2"></i>
                Ijaralar
              </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/report-login">
              <Nav.Link>
                <i className="fas fa-chart-bar me-2"></i>
                Hisobotlar
              </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/backup">
              <Nav.Link>
                <i className="fas fa-download me-2"></i>
                Zaxira nusxa
              </Nav.Link>
            </LinkContainer>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;