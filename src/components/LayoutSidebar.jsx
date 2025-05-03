// LayoutSidebar.jsx
import { useState, useEffect } from "react";
import { Col, Container, Row, Nav, Stack, Button } from "react-bootstrap";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { 
  PeopleFill, 
  BoxSeam, 
  CashStack,
  GearFill,
  ChevronRight,
  LightningChargeFill,
  List,
  X
} from "react-bootstrap-icons";
import { ToastContainer } from "react-toastify";
import './styles/LayoutSidebar.css';

const LayoutSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-show sidebar on larger screens
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);

  return (
    <Container fluid className="px-0">
      <Row className="g-0">
        {/* Sidebar Column */}
        <Col 
          md={3} 
          lg={2} 
          className={`min-vh-100 sticky-top bg-dark text-white p-0 sidebar-column ${sidebarOpen ? 'open' : ''}`}
        >
          <div className="d-flex flex-column h-100">
            {/* Sidebar Header */}
            <div className="p-4 bg-black bg-opacity-50 border-bottom border-secondary position-relative">
              <Stack direction="horizontal" gap={2} className="align-items-center">
                <LightningChargeFill className="text-warning fs-4" />
                <span className="fw-bold">DashBoard</span>
              </Stack>
              {isMobile && (
                <Button 
                  variant="link" 
                  className="position-absolute end-0 top-50 translate-middle-y text-white p-1"
                  onClick={toggleSidebar}
                  aria-label="Close sidebar"
                >
                  <X size={20} />
                </Button>
              )}
            </div>

            {/* Navigation */}
            <Nav className="flex-column p-3 flex-grow-1">
              <NavLink 
                to="/users" 
                className={({ isActive }) => 
                  `nav-link text-white mb-2 d-flex justify-content-between align-items-center rounded-1 p-3 
                  ${isActive ? 'active-nav-item bg-primary bg-opacity-90' : 'inactive-nav-item bg-dark bg-opacity-25'}`}
              >
                <Stack direction="horizontal" gap={3}>
                  <PeopleFill className="fs-5" />
                  <span>Users</span>
                </Stack>
                <ChevronRight size={14} />
              </NavLink>

              <NavLink 
                to="/bundles" 
                className={({ isActive }) => 
                  `nav-link text-white mb-2 d-flex justify-content-between align-items-center rounded-1 p-3 
                  ${isActive ? 'active-nav-item bg-primary bg-opacity-90' : 'inactive-nav-item bg-dark bg-opacity-25'}`}
              >
                <Stack direction="horizontal" gap={3}>
                  <BoxSeam className="fs-5" />
                  <span>Bundles</span>
                </Stack>
                <ChevronRight size={14} />
              </NavLink>

              <NavLink 
                to="/payments" 
                className={({ isActive }) => 
                  `nav-link text-white mb-2 d-flex justify-content-between align-items-center rounded-1 p-3 
                  ${isActive ? 'active-nav-item bg-primary bg-opacity-90' : 'inactive-nav-item bg-dark bg-opacity-25'}`}
              >
                <Stack direction="horizontal" gap={3}>
                  <CashStack className="fs-5" />
                  <span>Payments</span>
                </Stack>
                <ChevronRight size={14} />
              </NavLink>
            </Nav>

            {/* Sidebar Footer */}
            <div className="p-3 bg-black bg-opacity-50 border-top border-secondary">
              <NavLink 
                to="/settings" 
                className={({ isActive }) => 
                  `nav-link text-white d-flex align-items-center gap-3 rounded-1 p-3 
                  ${isActive ? 'active-nav-item bg-primary bg-opacity-90' : 'inactive-nav-item bg-dark bg-opacity-25'}`}
              >
                <GearFill className="fs-5" />
                <span>Settings</span>
              </NavLink>
            </div>
          </div>
        </Col>

        {/* Main Content Column */}
        <Col className="p-4 bg-light-subtle">
          {/* Mobile header with toggle button */}
          {isMobile && (
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Button 
                variant="outline-secondary" 
                onClick={toggleSidebar}
                className="d-md-none"
                aria-label="Open sidebar"
              >
                <List size={20} />
              </Button>
              <h4 className="m-0 text-capitalize">
                {location.pathname.split('/')[1] || 'Dashboard'}
              </h4>
              <div style={{ width: '40px' }}></div> {/* Spacer for alignment */}
            </div>
          )}
          
          <div className="bg-white rounded-2 shadow-sm p-4 h-100">
            <Outlet />
          </div>
        </Col>
      </Row>
      <ToastContainer />
    </Container>
  );
};

export default LayoutSidebar;