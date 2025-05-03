import { useCallback, useContext, useState } from 'react';
import { Badge, Button } from 'react-bootstrap';
import { useTable } from '../hooks/useTable';
import { DataTable } from '../components/tables/DataTable';
import AppContext from '../context/AppContext';
import PaymentConfirmationModal from '../components/PaymentConfirmationModal';
import { ArrowClockwise } from 'react-bootstrap-icons';

const Payments = () => {
  const { payments = [], paymentsLoading, paymentsError, refreshPayments, updatePayment } = useContext(AppContext);
  const { tableState, tableHandlers } = useTable({ status: [], bundle: [], method: [] });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRowDoubleClick = useCallback((payment) => {
    if (payment.status !== 'PAID') {
      setSelectedPayment(payment);
      setShowConfirmModal(true);
    }
  }, []);

  const handleConfirmPayment = async (updateData) => {
    setIsUpdating(true);
    try { 
      await updatePayment(selectedPayment.paymentId, updateData); 
      setShowConfirmModal(false);
      refreshPayments();
    } finally { 
      setIsUpdating(false); 
    }
  };

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
      options: [...new Set(payments.map(p => p.paymentMethod))].filter(Boolean), 
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
          <Button variant="outline-secondary" onClick={refreshPayments} disabled={paymentsLoading}>
            <ArrowClockwise className={`me-1 ${paymentsLoading ? 'spin' : ''}`} /> Refresh
          </Button>
        )}
        renderRow={(payment) => (
          <tr 
            key={payment.paymentId} 
            onDoubleClick={() => handleRowDoubleClick(payment)} 
            className={payment.status === 'PAID' ? 'table-active' : ''}
          >
            {columns.map(({ key }) => (
              <td key={key} className="align-middle">
                {key === 'status' ? (
                  <Badge bg={payment.status === 'PAID' ? 'success' : payment.status === 'PENDING' ? 'warning' : 'secondary'}>
                    {payment.status}
                  </Badge>
                ) : key === 'amount' ? `$${payment.amount?.toFixed(2)}` : 
                key.includes('Date') ? (payment[key] ? new Date(payment[key]).toLocaleString() : '-') : 
                payment[key] || '-'}
              </td>
            ))}
          </tr>
        )}
        containerStyle={{ 
          maxHeight: '550px', 
          border: '1px solid #dee2e6',
          overflowX: 'auto'
        }}
      />

      <PaymentConfirmationModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        payment={selectedPayment}
        methods={[...new Set(payments.map(p => p.paymentMethod))]}
        onConfirm={handleConfirmPayment}
        isLoading={isUpdating}
      />
    </div>
  );
};

export default Payments;