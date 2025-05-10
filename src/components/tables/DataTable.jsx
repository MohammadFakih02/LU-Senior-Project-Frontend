import { Table, Pagination, Spinner, Alert, Form, Stack, Button } from 'react-bootstrap';
import { MultiSelectDropdown } from './MultiSelectDropdown';
import { useState } from 'react';

export const DataTable = ({
  columns,
  data = [],
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
  renderHeader,
  containerStyle
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

  const [openDropdown, setOpenDropdown] = useState(null);

  const handleDropdownToggle = (dropdownKey) => {
    setOpenDropdown(prev => prev === dropdownKey ? null : dropdownKey);
  };

  // Handle search and pagination
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Filtering logic
  const filteredData = data.filter(item => {
    // Search term filter
    const matchesSearch = !searchTerm || 
      Object.values(item).some(
        value => value && 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

    // Apply each active filter
    const matchesFilters = Object.entries(filters).every(([filterType, filterValues]) => {
      if (filterValues.length === 0) return true;
      
      if (filterType === 'method') {
        return filterValues.includes(item.paymentMethod);
      }
      if (filterType === 'city') {
        return filterValues.includes(item.location?.city);
      }
      if (filterType === 'bundle') {
        const itemBundles = Array.isArray(item.bundleNames)
          ? item.bundleNames
          : item.bundleName
            ? [item.bundleName]
            : [];
        return filterValues.some(value => itemBundles.includes(value));
      }
      return filterValues.includes(item[filterType]);
    });

    return matchesSearch && matchesFilters;
  });

  // Sorting logic
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    
    const aValue = sortKey === 'city' ? a.location?.city : a[sortKey];
    const bValue = sortKey === 'city' ? b.location?.city : b[sortKey];

    if (aValue === bValue) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    return sortDirection === 'asc' 
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

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
    <div className="p-3" style={containerStyle}>
      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <h1 className="mb-0">{title}</h1>
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3 w-100 w-md-auto">
          <Form.Control
            type="text"
            placeholder={searchPlaceholder}
            className="w-100 w-md-auto"
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
              dropdownKey={type}
              options={options}
              selected={filters[type]}
              onToggle={(value) => toggleFilter(value, type)}
              label={label}
              variant={variant}
              isOpen={openDropdown === type}
              onToggleDropdown={handleDropdownToggle}
            />
          ))}
          <Button 
            variant="outline-danger"
            onClick={clearFilters}
            disabled={Object.values(filters).every(arr => arr.length === 0) && !searchTerm}
            className="mt-2 mt-md-0"
          >
            Clear Filters
          </Button>
        </Stack>
      </div>

      {/* Table Section */}
      <div className="table-responsive" style={{ overflowX: 'auto' }}>
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
      {sortedData.length === 0 && (
        <div className="text-center p-5 text-muted">
          <h5>
            {searchTerm || Object.values(filters).some(arr => arr.length > 0) 
              ? 'No matching items found' 
              : 'No data available'}
          </h5>
        </div>
      )}

      {/* Pagination */}
      {sortedData.length > itemsPerPage && (
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