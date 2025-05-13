import { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tippy';
import 'react-tippy/dist/tippy.css';
import { Badge, Button } from 'react-bootstrap';
import { useTable } from '../hooks/useTable';
import { DataTable } from '../components/tables/DataTable';
import AppContext from '../context/AppContext';
import { ArrowClockwise } from 'react-bootstrap-icons';

const TruncatedText = ({ text, maxWidth = 150 }) => (
  <Tooltip title={text} position="top" trigger="mouseenter" animation="scale" arrow={true}>
    <span className="text-truncate d-inline-block" style={{ maxWidth: `${maxWidth}px` }}>
      {text}
    </span>
  </Tooltip>
);

const Users = () => {
  const { users, usersLoading, usersError, refreshUsers } = useContext(AppContext);
  const { tableState, tableHandlers } = useTable({
    status: [],
    city: [],
    bundle: []
  });

  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const currentFlow = queryParams.get('flow'); // Will be "CP" or null

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
    { key: 'id', label: 'ID', sortable: true }, // The user list from /api/users has "id"
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone', sortable: true },
    { key: 'bundles', label: 'Bundles' },
    { key: 'city', label: 'City', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions' }
  ];
  
  // Data for DataTable uses the 'users' array directly.
  // The user object in this list has 'id', 'firstName', 'lastName', etc.
  const tableData = users; 

  return (
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
              navigate(`/users/${user.id}?flow=CP`, { 
                state: { 
                } 
              });
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
              <Button variant="info" size="sm" as={Link} to={`/users/${user.id}`}>
                View
              </Button>
              <Button variant="warning" size="sm" as={Link} to={`/users/edit/${user.id}`}>
                Edit
              </Button>
            </div>
          </td>
        </tr>
      )}
      containerStyle={{ overflowX: 'auto' }}
    />
  );
};

export default Users;