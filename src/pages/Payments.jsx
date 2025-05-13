import { useCallback, useContext, useState, useEffect } from 'react';
import { Badge, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTable } from '../hooks/useTable';
import { DataTable } from '../components/tables/DataTable';
import AppContext from '../context/AppContext';
import PaymentConfirmationModal from '../components/PaymentConfirmationModal';
import CreatePaymentModal from '../components/CreatePaymentModal';
import { ArrowClockwise, PlusCircleFill } from 'react-bootstrap-icons';

const Payments = () => {
  const { 
    payments = [], 
    paymentsLoading, 
    paymentsError, 
    refreshPayments, 
    updatePayment,
    createPayment 
  } = useContext(AppContext);
  
  const { tableState, tableHandlers } = useTable({ status: [], bundle: [], method: [] });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [showCreatePaymentModal, setShowCreatePaymentModal] = useState(false);
  const [newPaymentSelection, setNewPaymentSelection] = useState(null); 
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.flow === 'createPaymentCompleteCP' && 
        location.state?.selectedUserBundleId &&
        location.state?.selectedBundleName) {
      setNewPaymentSelection({
        userBundleId: location.state.selectedUserBundleId,
        bundleName: location.state.selectedBundleName,
        bundlePrice: location.state.selectedBundlePrice,
        userName: location.state.selectedUserName, 
      });
      setShowCreatePaymentModal(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const handleRowDoubleClick = useCallback((payment) => {
    if (payment.status !== 'PAID') {
      setSelectedPayment(payment);
      setShowConfirmModal(true);
    }
  }, []);

  const handleConfirmPaymentUpdate = async (updateData) => {
    setIsUpdating(true);
    try { 
      await updatePayment(selectedPayment.paymentId, updateData); 
      setShowConfirmModal(false);
      await refreshPayments(); 
    } finally { 
      setIsUpdating(false); 
    }
  };

  const handleCreateNewPayment = async (paymentDataFromModal) => {
    if (!createPayment) {
      console.error("createPayment function is not available in AppContext");
      alert("Error: Payment creation functionality is not set up.");
      return;
    }
    setIsCreatingPayment(true);
    try {
      await createPayment(paymentDataFromModal);
      setShowCreatePaymentModal(false);
      setNewPaymentSelection(null); 
      await refreshPayments(); 
    } catch (error) {
      console.error("Failed to create payment from Payments.jsx:", error);
    } finally {
      setIsCreatingPayment(false);
    }
  };
  
  const uniquePaymentMethods = [...new Set(payments.map(p => p.paymentMethod).filter(Boolean))];

  const filterConfig = [
    { 
      type: 'status', 
      options: ['PAID', 'PENDING', 'UNPAID'], 
      label: 'Status' 
    },
    { 
      type: 'bundle', 
      options: [...new Set(payments.map(p => p.bundleName))].filter(Boolean), 
      label: 'Bundle' 
    },
    { 
      type: 'method', 
      options: uniquePaymentMethods, 
      label: 'Method' 
    }
  ];

  const columns = [
    'paymentId', 'userId', 'userName', 'bundleName', 'amount', 'paymentDate', 'dueDate', 'paymentMethod', 'status'
  ].map(key => ({ 
    key, 
    label: key.replace(/([A-Z])/g, ' $1').toUpperCase(), 
    sortable: true 
  }));

  return (
    <div className="p-3">
      <DataTable
        title="Payment Management"
        columns={columns}
        data={payments}
        loading={paymentsLoading}
        error={paymentsError}
        onRetry={refreshPayments}
        filterConfig={filterConfig}
        tableState={tableState}
        tableHandlers={tableHandlers}
        searchPlaceholder="Search payments..."
        renderHeader={() => (
          <div className="d-flex flex-column flex-md-row gap-2 ms-auto">
            <Button 
              variant="success" 
              onClick={() => navigate('/users?flow=CP')}
              disabled={paymentsLoading}
            >
              <PlusCircleFill className="me-1" /> Create Custom Payment
            </Button>
            <Button variant="outline-secondary" onClick={refreshPayments} disabled={paymentsLoading}>
              <ArrowClockwise className={`me-1 ${paymentsLoading ? 'spin' : ''}`} /> Refresh
            </Button>
          </div>
        )}
        renderRow={(payment) => (
          <tr 
            key={payment.paymentId} 
            onDoubleClick={() => handleRowDoubleClick(payment)} 
            // Reverted className logic
            className={payment.status === 'PAID' ? 'table-active' : ''}
            style={{ cursor: payment.status !== 'PAID' ? 'pointer' : 'default' }}
          >
            {columns.map(({ key }) => (
              <td key={key} className="align-middle">
                {key === 'status' ? (
                  // Reverted Badge bg logic
                  <Badge bg={payment.status === 'PAID' ? 'success' : payment.status === 'PENDING' ? 'warning' : 'secondary'}>
                    {payment.status}
                  </Badge>
                ) : key === 'amount' ? `$${payment.amount?.toFixed(2)}` : 
                key.includes('Date') ? (payment[key] ? new Date(payment[key]).toLocaleString() : '-') : // Using toLocaleString for dates
                payment[key] || '-'}
              </td>
            ))}
          </tr>
        )}
        containerStyle={{ 
          maxHeight: '600px', 
          border: '1px solid #dee2e6',
          overflowX: 'auto'
        }}
      />

      <PaymentConfirmationModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        payment={selectedPayment}
        methods={uniquePaymentMethods}
        onConfirm={handleConfirmPaymentUpdate}
        isLoading={isUpdating}
      />

      <CreatePaymentModal
        show={showCreatePaymentModal}
        onHide={() => {
          setShowCreatePaymentModal(false);
          setNewPaymentSelection(null); 
        }}
        selectionData={newPaymentSelection}
        paymentMethods={uniquePaymentMethods}
        onConfirmCreate={handleCreateNewPayment}
        isLoading={isCreatingPayment}
      />
    </div>
  );
};

export default Payments;