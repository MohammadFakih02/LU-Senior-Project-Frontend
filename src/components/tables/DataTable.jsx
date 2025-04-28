import { Table, Pagination, Spinner, Alert, Form, Stack, Button } from 'react-bootstrap';
import { MultiSelectDropdown } from './MultiSelectDropdown';
import { ArrowClockwise } from 'react-bootstrap-icons';

export const DataTable = ({
  columns,
  data = [], // Default to empty array
  loading,
  error,
  itemsPerPage = 10,
  onRetry,
  renderRow,
  filterConfig,
  tableState,
  tableHandlers,
  searchPlaceholder = "Search...",
  title,
  renderHeader
}) => {
  const { 
    searchTerm,
    currentPage,
    sortKey,
    sortDirection,
    filters
  } = tableState;

  const {
    setSearchTerm,
    setCurrentPage,
    handleSort,
    toggleFilter,
    clearFilters
  } = tableHandlers;

  // Handle search and pagination
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Loading state
  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
      <Spinner animation="border" variant="primary" />
    </div>
  );

  // Error state
  if (error) return (
    <div className="p-3">
      <Alert variant="danger">{error}</Alert>
      <Button variant="secondary" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );

  return (
    <div className="p-3">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">{title}</h1>
        <div className="d-flex align-items-center gap-3">
          <Form.Control
            type="text"
            placeholder={searchPlaceholder}
            style={{ width: '300px' }}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {renderHeader && renderHeader()}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="mb-4">
        <Stack direction="horizontal" gap={3} className="flex-wrap">
          {filterConfig.map(({ type, options, label, variant }) => (
            <MultiSelectDropdown
              key={type}
              options={options}
              selected={filters[type]}
              onToggle={(value) => toggleFilter(value, type)}
              label={label}
              variant={variant}
            />
          ))}
          <Button 
            variant="outline-danger"
            onClick={clearFilters}
            disabled={Object.values(filters).every(arr => arr.length === 0) && !searchTerm}
          >
            Clear Filters
          </Button>
        </Stack>
      </div>

      {/* Table Section */}
      <div className="table-responsive">
        <Table striped bordered hover className="mb-0">
          <thead className="table-dark">
            <tr>
              {columns.map(({ key, label, sortable }) => (
                <th 
                  key={key}
                  onClick={() => sortable && handleSort(key)}
                  style={{ 
                    cursor: sortable ? 'pointer' : 'default',
                    minWidth: '120px',
                    verticalAlign: 'middle'
                  }}
                >
                  {label}
                  {sortKey === key && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems.map(item => renderRow(item))}
          </tbody>
        </Table>
      </div>

      {/* Empty State */}
      {data.length === 0 && (
        <div className="text-center p-5 text-muted">
          <h5>
            {searchTerm || Object.values(filters).some(arr => arr.length > 0) 
              ? 'No matching items found' 
              : 'No data available'}
          </h5>
        </div>
      )}

      {/* Pagination */}
      {data.length > itemsPerPage && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.First 
              onClick={() => setCurrentPage(1)} 
              disabled={currentPage === 1} 
            />
            <Pagination.Prev 
              onClick={() => setCurrentPage(currentPage - 1)} 
              disabled={currentPage === 1} 
            />
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }

              return (
                <Pagination.Item
                  key={pageNumber}
                  active={pageNumber === currentPage}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </Pagination.Item>
              );
            })}

            <Pagination.Next 
              onClick={() => setCurrentPage(currentPage + 1)} 
              disabled={currentPage === totalPages} 
            />
            <Pagination.Last 
              onClick={() => setCurrentPage(totalPages)} 
              disabled={currentPage === totalPages} 
            />
          </Pagination>
        </div>
      )}
    </div>
  );
};