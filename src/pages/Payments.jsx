import { useCallback, useContext, useState, useEffect } from 'react';
import { Badge, Button, Modal, Stack, Overlay, Popover } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTable } from '../hooks/useTable';
import { DataTable } from '../components/tables/DataTable';
import AppContext from '../context/AppContext';
import PaymentConfirmationModal from '../components/PaymentConfirmationModal';
import CreatePaymentModal from '../components/CreatePaymentModal';
import { ArrowClockwise, PlusCircleFill, PencilSquare, Trash3 } from 'react-bootstrap-icons';

const Payments = () => {
  const {
    payments = [],
    paymentsLoading,
    paymentsError,
    refreshPayments,
    updatePayment,
    createPayment,
    deletePayment,
    showErrorToast,
  } = useContext(AppContext);

  const { tableState, tableHandlers } = useTable({ status: [], bundle: [], method: [] });
  const [selectedPaymentForModal, setSelectedPaymentForModal] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [showCreatePaymentModal, setShowCreatePaymentModal] = useState(false);
  const [newPaymentSelection, setNewPaymentSelection] = useState(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [activeRowId, setActiveRowId] = useState(null);
  const [popoverState, setPopoverState] = useState({
    show: false,
    target: null,
    payment: null,
  });

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

  const handleOpenUpdateModal = useCallback((payment) => {
    if (payment.status !== 'PAID') {
      setSelectedPaymentForModal(payment);
      setShowConfirmModal(true);
    }
  }, []);

  const handleConfirmPaymentUpdate = async (updateData) => {
    setIsUpdating(true);
    try {
      await updatePayment(selectedPaymentForModal.paymentId, updateData);
      setShowConfirmModal(false);
      setSelectedPaymentForModal(null);
      await refreshPayments();
    } catch (error) {
      console.error("Failed to update payment:", error);
    }
    finally {
      setIsUpdating(false);
    }
  };

  const handleCreateNewPayment = async (paymentDataFromModal) => {
    if (!createPayment) {
      console.error("createPayment function is not available in AppContext");
      showErrorToast("Error: Payment creation functionality is not set up.");
      return;
    }
    setIsCreatingPayment(true);
    try {
      await createPayment(paymentDataFromModal);
      setShowCreatePaymentModal(false);
      setNewPaymentSelection(null);
      await refreshPayments();
    } catch (error)      {
      console.error("Failed to create payment from Payments.jsx:", error);
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handleOpenDeleteModal = useCallback((payment) => {
    setPaymentToDelete(payment);
    setShowDeleteConfirmModal(true);
  }, []);

  const handleConfirmDeletePayment = async () => {
    if (!paymentToDelete) return;
    setIsDeleting(true);
    try {
      await deletePayment(paymentToDelete.paymentId);
      setShowDeleteConfirmModal(false);
      setPaymentToDelete(null);
    } catch (error) {
      console.error("Failed to delete payment:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRowClick = useCallback((event, paymentId) => {
    event.stopPropagation();
    const { clientX, clientY } = event;

    const payment = payments.find(p => p.paymentId === paymentId);
    if (!payment) return;

    setPopoverState(prevState => {
      const isAlreadyShownForThisPayment = prevState.show && prevState.payment?.paymentId === paymentId;
      
      if (isAlreadyShownForThisPayment) {
        setActiveRowId(null);
        return { show: false, target: null, payment: null };
      } else {
        setActiveRowId(paymentId);
        return {
          show: true,
          target: { 
            getBoundingClientRect: () => ({
              width: 0,
              height: 0,
              top: clientY,
              right: clientX,
              bottom: clientY,
              left: clientX,
            }),
          },
          payment: payment,
        };
      }
    });
  }, [payments]);

  const closePopover = useCallback(() => {
    setPopoverState({ show: false, target: null, payment: null });
    setActiveRowId(null);
  }, []);


  const uniquePaymentMethods = [...new Set(payments.map(p => p.paymentMethod).filter(Boolean))];

  const filterConfig = [
    { type: 'status', options: ['PAID', 'PENDING', 'UNPAID'], label: 'Status' },
    { type: 'bundle', options: [...new Set(payments.map(p => p.bundleName))].filter(Boolean), label: 'Bundle' },
    { type: 'method', options: uniquePaymentMethods, label: 'Method' }
  ];

  const columns = [
    'paymentId', 'userId', 'userName', 'bundleName', 'amount', 'paymentDate', 'dueDate', 'paymentMethod', 'status'
  ].map(key => ({
    key,
    label: key.replace(/([A-Z])/g, ' $1').toUpperCase(),
    sortable: true
  }));

  return (
    <>
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
          <Stack direction="horizontal" gap={2} className="ms-auto">
            <Button variant="success" onClick={() => navigate('/users?flow=CP')} disabled={paymentsLoading} className="d-flex align-items-center">
              <PlusCircleFill className="me-2" /> Create Payment
            </Button>
            <Button variant="outline-secondary" onClick={() => refreshPayments()} disabled={paymentsLoading} className="d-flex align-items-center">
              <ArrowClockwise className={`me-2 ${paymentsLoading ? 'spin' : ''}`} /> Refresh
            </Button>
          </Stack>
        )}
        renderRow={(payment) => (
          <tr
            key={payment.paymentId}
            className={`
              ${payment.status === 'PAID' ? 'table-success-light' : payment.status === 'UNPAID' ? 'table-danger-light' : ''} 
              align-middle
              ${activeRowId === payment.paymentId ? 'table-info-light' : ''}
            `}
            onClick={(e) => handleRowClick(e, payment.paymentId)}
            style={{ cursor: 'pointer' }}
          >
            {columns.map(({ key, cellClassName }) => (
              <td key={key} className={`align-middle ${cellClassName || ''}`}>
                {key === 'status' ? (
                  <Badge pill bg={payment.status === 'PAID' ? 'success' : payment.status === 'PENDING' ? 'warning' : 'danger'} className="px-2 py-1">
                    {payment.status}
                  </Badge>
                ) : key === 'amount' ? (payment.amount != null ? `$${Number(payment.amount).toFixed(2)}` : '-') :
                (key === 'paymentDate' || key === 'dueDate') ? (payment[key] ? new Date(payment[key]).toLocaleDateString() : '-') :
                payment[key] || '-'}
              </td>
            ))}
          </tr>
        )}
        containerStyle={{
          maxHeight: 'calc(100vh - 250px)', // Kept for specific vertical scroll needs for the entire DataTable block
        }}
      />

      {popoverState.payment && (
        <Overlay
            show={popoverState.show}
            target={popoverState.target}
            placement="bottom-start"
            onHide={closePopover}
            rootClose
        >
            <Popover id={`popover-payment-actions-${popoverState.payment.paymentId}`} style={{zIndex: 1050}}>
                <Popover.Header as="h3" className="py-2 px-3 fs-6 fw-semibold">
                    Actions for P-{popoverState.payment.paymentId}
                </Popover.Header>
                <Popover.Body className="p-2">
                    <Stack direction="vertical" gap={2}>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            className="d-flex align-items-center justify-content-start text-nowrap w-100"
                            onClick={() => {
                                handleOpenUpdateModal(popoverState.payment);
                                closePopover();
                            }}
                            disabled={popoverState.payment.status === 'PAID'}
                        >
                            <PencilSquare className="me-2 flex-shrink-0" /> Update Payment
                        </Button>
                        <Button
                            variant="outline-danger"
                            size="sm"
                            className="d-flex align-items-center justify-content-start text-nowrap w-100"
                            onClick={() => {
                                handleOpenDeleteModal(popoverState.payment);
                                closePopover();
                            }}
                        >
                            <Trash3 className="me-2 flex-shrink-0" /> Delete Payment
                        </Button>
                    </Stack>
                </Popover.Body>
            </Popover>
        </Overlay>
      )}

      <PaymentConfirmationModal
        show={showConfirmModal}
        onHide={() => { setShowConfirmModal(false); setSelectedPaymentForModal(null); }}
        payment={selectedPaymentForModal}
        methods={uniquePaymentMethods}
        onConfirm={handleConfirmPaymentUpdate}
        isLoading={isUpdating}
      />

      <CreatePaymentModal
        show={showCreatePaymentModal}
        onHide={() => { setShowCreatePaymentModal(false); setNewPaymentSelection(null); }}
        selectionData={newPaymentSelection}
        paymentMethods={uniquePaymentMethods}
        onConfirmCreate={handleCreateNewPayment}
        isLoading={isCreatingPayment}
      />

      <Modal show={showDeleteConfirmModal} onHide={() => setShowDeleteConfirmModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Deletion</Modal.Title></Modal.Header>
        <Modal.Body>
          Are you sure you want to delete payment with ID: <strong>{paymentToDelete?.paymentId}</strong> for user <strong>{paymentToDelete?.userName}</strong>?
          <br />This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirmModal(false)} disabled={isDeleting}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirmDeletePayment} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Payment'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Payments;