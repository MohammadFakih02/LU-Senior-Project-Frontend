// LayoutSidebar.jsx
import { useState, useEffect, useContext } from "react";
import { Col, Container, Row, Nav, Stack, Button, Form, Alert, Spinner } from "react-bootstrap";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { 
  PeopleFill, 
  BoxSeam, 
  CashStack,
  GearFill,
  ChevronRight,
  LightningChargeFill,
  List,
  X,
  ArrowClockwise
} from "react-bootstrap-icons";
import 'react-toastify/dist/ReactToastify.css';
import AppContext from '../context/AppContext';
import './styles/LayoutSidebar.css';

const LayoutSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  const { 
    appSettings, 
    updateAppSettings, 
    appSettingsLoading,
    appSettingsError, 
    showSuccessToast: contextShowSuccessToast,
    showErrorToast: contextShowErrorToast,
    showInfoToast: contextShowInfoToast, // Added for Refresh All feedback
    usersError,
    paymentsError,
    bundlesError,
    refreshUsers,
    refreshPayments,
    refreshBundles,
    refreshAppSettings, 
  } = useContext(AppContext);

  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [stagedSettings, setStagedSettings] = useState({ ...appSettings });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isRetryingLoadSettings, setIsRetryingLoadSettings] = useState(false); // For retry button in panel
  const [isReloadingSettingsOnly, setIsReloadingSettingsOnly] = useState(false); // For global alert button


  // Check for any data loading errors, including app settings
  const dataErrors = [usersError, paymentsError, bundlesError, appSettingsError].filter(Boolean);
  const hasMultipleErrors = dataErrors.length >= 2;
  
  const handleRefreshAll = async () => {
    contextShowInfoToast('Refreshing all data...'); 
    try {
      await Promise.all([
        refreshUsers({ showToast: false }),
        refreshPayments({ showToast: false }),
        refreshBundles({ showToast: false }),
        refreshAppSettings({ showToastOnSuccess: false, showToastOnError: false }) 
      ]);
      contextShowSuccessToast('All data refreshed successfully');
    } catch (error) {
      console.error("Error during 'Refresh All' operation:", error);
      contextShowErrorToast('Failed to refresh some data. Check console for details.');
    }
  };

  useEffect(() => {
    setStagedSettings({ ...appSettings });
  }, [appSettings]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true); 
      } else {
        setSidebarOpen(false); 
        if (showSettingsPanel) { 
            setShowSettingsPanel(false);
        }
      }
    };
    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showSettingsPanel]); 

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);

  const handleOpenSettingsPanel = () => {
    setStagedSettings({ ...appSettings }); 
    setShowSettingsPanel(true);
    if (isMobile && !sidebarOpen) { 
        setSidebarOpen(true); 
    }
  };

  const handleCloseSettingsPanel = () => {
    setShowSettingsPanel(false);
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const success = await updateAppSettings(stagedSettings); 
      if (success) {
        setShowSettingsPanel(false); 
        contextShowSuccessToast('Settings saved successfully!');
      }
    } catch (error) {
      console.error("Error saving settings from LayoutSidebar:", error);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStagedSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOverlayClick = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false); 
    }
  };

  const handleReloadSettings = async (setter) => {
    setter(true);
    try {
      await refreshAppSettings({ showToastOnSuccess: true, showToastOnError: true });
    } finally {
      setter(false);
    }
  };

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
                  className="position-absolute end-0 top-50 translate-middle-y text-white p-2"
                  onClick={toggleSidebar}
                  aria-label="Close sidebar"
                >
                  <X size={28} />
                </Button>
              )}
            </div>

            {/* Scrollable area for Navigation and Settings Panel */}
            <div className="flex-grow-1 overflow-auto sidebar-nav-wrapper">
              <Nav className="flex-column p-3">
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

              {/* Settings Panel - Animated */}
              <div className={`settings-panel-wrapper ${showSettingsPanel ? 'open' : ''}`}>
                <hr className="border-secondary mx-3 my-2" />
                <div className="settings-panel px-3 pb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0 text-white fw-bold">Panel Settings</h6>
                    <Button 
                      variant="link" 
                      className="text-white p-1" 
                      onClick={handleCloseSettingsPanel}
                      aria-label="Close settings panel"
                    >
                      <X size={24} />
                    </Button>
                  </div>
                  
                  {appSettingsLoading ? (
                    <div className="text-center p-3">
                      <Spinner animation="border" variant="light" size="sm" />
                      <p className="small mt-2 mb-0 text-white-50">Loading settings...</p>
                    </div>
                  ) : appSettingsError ? (
                    <Alert variant="danger" className="text-center small">
                      <p className="mb-2">{appSettingsError}</p>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleReloadSettings(setIsRetryingLoadSettings)}
                        disabled={isRetryingLoadSettings}
                      >
                        {isRetryingLoadSettings ? (
                          <>
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                            <span className="visually-hidden ms-1">Retrying...</span>
                          </>
                        ) : (
                          "Retry Load"
                        )}
                      </Button>
                    </Alert>
                  ) : (
                    <>
                      <Form className="settings-form">
                        <Form.Group className="mb-2" controlId="autoCreateMonthly">
                          <Form.Check
                            type="switch"
                            name="autoCreateMonthly"
                            label="Auto Create Payments monthly"
                            checked={stagedSettings.autoCreateMonthly || false}
                            onChange={handleSettingChange}
                            className="text-white"
                          />
                        </Form.Group>

                        <Form.Group className="mb-2" controlId="autoCreateOnUserCreation">
                          <Form.Check
                            type="switch"
                            name="autoCreateOnUserCreation"
                            label="Auto create payments on user creation"
                            checked={stagedSettings.autoCreateOnUserCreation || false}
                            onChange={handleSettingChange}
                            className="text-white"
                          />
                        </Form.Group>

                        <Form.Group className="mb-2" controlId="autoDisableBundleOnNoPayment">
                          <Form.Check
                            type="switch"
                            name="autoDisableBundleOnNoPayment"
                            label="Auto disable bundle if no payment"
                            checked={stagedSettings.autoDisableBundleOnNoPayment || false}
                            onChange={handleSettingChange}
                            className="text-white"
                          />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="autoDeletePaymentTime">
                          <Form.Label className="text-white small mb-1">Auto delete payments after</Form.Label>
                          <Form.Select
                            name="autoDeletePaymentTime"
                            aria-label="Auto delete payments after"
                            value={stagedSettings.autoDeletePaymentTime || 'never'}
                            onChange={handleSettingChange}
                            size="sm"
                          >
                            <option value="30">30 days</option>
                            <option value="60">60 days</option>
                            <option value="90">90 days</option>
                            <option value="never">Never</option>
                          </Form.Select>
                        </Form.Group>
                      </Form>
                      <div className="d-flex justify-content-end mt-3">
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={handleSaveSettings}
                          disabled={isSavingSettings}
                        >
                          {isSavingSettings ? (
                            <>
                              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                              <span className="visually-hidden ms-1">Saving...</span>
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div> 
            
            {/* Sidebar Footer - Settings Trigger */}
            {!showSettingsPanel && (
              <div className="p-3 bg-black bg-opacity-50 border-top border-secondary settings-trigger-footer">
                <div
                  className={`nav-link text-white d-flex align-items-center gap-3 rounded-1 p-3 inactive-nav-item bg-dark bg-opacity-25 cursor-pointer`}
                  onClick={handleOpenSettingsPanel}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && handleOpenSettingsPanel()}
                  aria-expanded={showSettingsPanel}
                  aria-controls="settings-panel-content" 
                >
                  <GearFill className="fs-5" />
                  <span>Settings</span>
                </div>
              </div>
            )}
          </div> 
        </Col>

        {/* Main Content Column */}
        <Col 
          className={`d-flex flex-column bg-light-subtle main-content-column ${isMobile && sidebarOpen ? 'sidebar-open-overlay' : ''}`}
          onClick={isMobile && sidebarOpen ? handleOverlayClick : undefined}
        >
          {/* Mobile Header container */}
          {isMobile && (
            <div className="px-3 pt-3 px-md-4 pt-md-4">
              <div className="d-flex justify-content-between align-items-center">
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
                <div style={{ width: '40px' }}></div> {/* Spacer to balance the header */}
              </div>
            </div>
          )}
          
          {/* Alert container for multiple errors */}
          {hasMultipleErrors && (
            <div className={`px-3 ${isMobile ? 'pt-2' : 'pt-3'} px-md-4 ${isMobile ? 'pt-md-2' : 'pt-md-4'}`}>
              <Alert variant="danger" className="mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <span>Multiple data sources failed to load.</span>
                  <Button 
                    variant="danger" 
                    onClick={handleRefreshAll}
                    className="d-flex align-items-center gap-2"
                  >
                    <ArrowClockwise /> Refresh All
                  </Button>
                </div>
              </Alert>
            </div>
          )}

          {/* Alert for App Settings load failure (if not covered by multiple errors) */}
          {appSettingsError && !appSettingsLoading && !hasMultipleErrors && (
            <div className={`px-3 ${isMobile ? 'pt-2' : 'pt-3'} px-md-4 ${isMobile ? 'pt-md-2' : 'pt-md-4'} ${hasMultipleErrors ? 'mt-3' : ''}`}>
              <Alert variant="warning" className="mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <span>{appSettingsError}</span>
                  <Button 
                    variant="warning" // Match Alert variant
                    onClick={() => handleReloadSettings(setIsReloadingSettingsOnly)}
                    disabled={isReloadingSettingsOnly}
                    className="d-flex align-items-center gap-1"
                  >
                    {isReloadingSettingsOnly ? (
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    ) : (
                      <ArrowClockwise size={16}/>
                    )}
                    <span className="ms-1">Reload Settings</span>
                  </Button>
                </div>
              </Alert>
            </div>
          )}
          
          {/* The white content card */}
          <div className="bg-white rounded-2 shadow-sm p-3 p-md-4 flex-grow-1 m-3 m-md-4 main-content-card"> 
            <Outlet />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default LayoutSidebar;