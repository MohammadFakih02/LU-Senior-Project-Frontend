import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tippy';
import 'react-tippy/dist/tippy.css';
import { Badge, Button, Alert, Modal } from 'react-bootstrap';
import { useTable } from '../hooks/useTable';
import { DataTable } from '../components/tables/DataTable';
import AppContext from '../context/AppContext';
import { ArrowClockwise, Trash } from 'react-bootstrap-icons';

const TruncatedText = ({ text, maxWidth = 150 }) => (
  <Tooltip title={text} position="top" trigger="mouseenter" animation="scale" arrow={true}>
    <span className="text-truncate d-inline-block" style={{ maxWidth: `${maxWidth}px` }}>
      {text}
    </span>
  </Tooltip>
);

const Users = () => {
  const { users, usersLoading, usersError, refreshUsers, deleteUser } = useContext(AppContext);
  const { tableState, tableHandlers } = useTable({
    status: [],
    city: [],
    bundle: []
  });

  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const currentFlow = queryParams.get('flow');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleShowDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setUserToDelete(null);
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await deleteUser(userToDelete.id);
      handleCloseDeleteModal();
    } catch { // Omitting the error parameter as it's not used
      // Error toast is handled by deleteUser in AppContext
      // If you needed to log the error here, you'd use: catch (e) { console.error(e); }
    } finally {
      setIsDeleting(false);
    }
  };


  const filterConfig = [
    {
      type: 'status',
      options: [...new Set(users.map(u => u.status))].filter(Boolean),
      label: 'Status',
      variant: 'outline-primary'
    },
    {
      type: 'city',
      options: [...new Set(users.map(u => u.location?.city))].filter(Boolean),
      label: 'City',
      variant: 'outline-secondary'
    },
    {
      type: 'bundle',
      options: [...new Set(users.flatMap(u => u.bundleNames || []))].filter(Boolean),
      label: 'Bundle',
      variant: 'outline-success'
    }
  ];

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone', sortable: true },
    { key: 'bundles', label: 'Bundles' },
    { key: 'city', label: 'City', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions' }
  ];

  const tableData = users;

  return (
    <>
      {currentFlow === 'CP' && (
        <Alert variant="info" className="mb-3">
          You are in <strong>Create Payment mode</strong>. Double-click a user in the table below or use the "Select" button to view their details and select a bundle subscription for payment.
        </Alert>
      )}
      <DataTable
        title="User Management"
        columns={columns}
        data={tableData}
        loading={usersLoading}
        error={usersError}
        onRetry={refreshUsers}
        filterConfig={filterConfig}
        tableState={tableState}
        tableHandlers={tableHandlers}
        searchPlaceholder="Search users..."
        renderHeader={() => (
          <div className="d-flex flex-column flex-md-row gap-2 ms-auto w-100 w-md-auto">
            <Button
              variant="outline-secondary"
              onClick={refreshUsers}
              disabled={usersLoading}
              className="order-1 order-md-0"
            >
              <ArrowClockwise className={`me-1 ${usersLoading ? 'spin' : ''}`} />
              Refresh
            </Button>
            <Button
              as={Link}
              to="/users/create"
              variant="primary"
              className="order-0 order-md-1 mb-2 mb-md-0"
            >
              Add New User
            </Button>
          </div>
        )}
        renderRow={(user) => (
          <tr
            key={user.id}
            onDoubleClick={() => {
              if (currentFlow === 'CP') {
                navigate(`/users/${user.id}?flow=CP`);
              }
            }}
            style={{ cursor: currentFlow === 'CP' ? 'pointer' : 'default' }}
          >
            <td>{user.id}</td>
            <td><TruncatedText text={`${user.firstName} ${user.lastName}` }/></td>
            <td><TruncatedText text={user.email} /></td>
            <td>{user.phone ? <TruncatedText text={user.phone} /> : '-'}</td>
            <td>
              {user.bundleNames?.length > 0 ? (
                <div className="d-flex flex-wrap gap-1" style={{ maxWidth: '200px' }}>
                  {user.bundleNames.map((bundle, index) => (
                    <Badge key={index} bg="info" className="text-truncate">
                      <TruncatedText text={bundle} maxWidth={200} />
                    </Badge>
                  ))}
                </div>
              ) : '-'}
            </td>
            <td><TruncatedText text={user.location?.city || '-'} /></td>
            <td>
              <Badge pill bg={user.status === 'ACTIVE' ? 'success' : 'secondary'}>
                {user.status}
              </Badge>
            </td>
            <td>
              <div className="d-flex gap-2">
                {currentFlow === 'CP' && (
                  <Button
                    variant="success"
                    size="sm"
                    as={Link}
                    to={`/users/${user.id}?flow=CP`}
                  >
                    Select
                  </Button>
                )}
                <Button
                  variant="info"
                  size="sm"
                  as={Link}
                  to={`/users/${user.id}${currentFlow === 'CP' ? '?flow=CP' : ''}`}
                >
                  View
                </Button>
                <Button variant="warning" size="sm" as={Link} to={`/users/edit/${user.id}`}>
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleShowDeleteModal(user)}
                  disabled={isDeleting && userToDelete?.id === user.id}
                >
                  <Trash />
                </Button>
              </div>
            </td>
          </tr>
        )}
      />

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete user{' '}
          <strong>{userToDelete && `${userToDelete.firstName} ${userToDelete.lastName}`}</strong> (ID: {userToDelete?.id})?
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete User'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Users;