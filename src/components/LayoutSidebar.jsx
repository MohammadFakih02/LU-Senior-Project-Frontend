// LayoutSidebar.jsx
import { Col, Container, Row, Nav, Stack } from "react-bootstrap";
import { Outlet, NavLink } from "react-router-dom";
import { 
  PeopleFill, 
  BoxSeam, 
  CashStack,
  GearFill,
  ChevronRight,
  LightningChargeFill
} from "react-bootstrap-icons";
import { ToastContainer } from "react-toastify";
import './styles/LayoutSidebar.css';

const LayoutSidebar = () => {
  return (
    <Container fluid className="px-0">
      <Row className="g-0">
        {/* Sidebar Column */}
        <Col md={3} lg={2} className="min-vh-100 sticky-top bg-dark text-white p-0">
          <div className="d-flex flex-column h-100">
            {/* Sidebar Header */}
            <div className="p-4 bg-black bg-opacity-50 border-bottom border-secondary">
              <Stack direction="horizontal" gap={2} className="align-items-center">
                <LightningChargeFill className="text-warning fs-4" />
                <span className="fw-bold">DashBoard</span>
              </Stack>
            </div>

            {/* Navigation */}
            <Nav className="flex-column p-3 flex-grow-1">
              <NavLink 
                to="/users" 
                className={({ isActive }) => 
                  `nav-link text-white mb-2 d-flex justify-content-between align-items-center rounded-1 p-3 
                  ${isActive ? 'active-nav-item bg-primary bg-opacity-90' : 'inactive-nav-item bg-dark bg-opacity-25'}`
                }
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
                  ${isActive ? 'active-nav-item bg-primary bg-opacity-90' : 'inactive-nav-item bg-dark bg-opacity-25'}`
                }
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
                  ${isActive ? 'active-nav-item bg-primary bg-opacity-90' : 'inactive-nav-item bg-dark bg-opacity-25'}`
                }
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
                  ${isActive ? 'active-nav-item bg-primary bg-opacity-90' : 'inactive-nav-item bg-dark bg-opacity-25'}`
                }
              >
                <GearFill className="fs-5" />
                <span>Settings</span>
              </NavLink>
            </div>
          </div>
        </Col>

        {/* Main Content Column */}
        <Col className="p-4 bg-light-subtle">
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