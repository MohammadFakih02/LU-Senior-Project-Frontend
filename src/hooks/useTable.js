import { useState, useCallback } from 'react';

export const useTable = (initialState = {}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState(initialState);

  const handleSort = useCallback((key) => {
    setSortKey(prevKey => {
      if (prevKey === key) {
        setSortDirection(prevDir => prevDir === 'asc' ? 'desc' : 'asc');
      } else {
        setSortDirection('asc');
      }
      return key;
    });
    setCurrentPage(1);
  }, []);

  const toggleFilter = useCallback((value, filterType) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value) 
        ? prev[filterType].filter(item => item !== value) 
        : [...prev[filterType], value]
    }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(Object.keys(filters).reduce((acc, key) => ({
      ...acc,
      [key]: []
    }), {}));
    setSearchTerm('');
    setCurrentPage(1);
  }, [filters]);

  return {
    tableState: {
      searchTerm,
      currentPage,
      sortKey,
      sortDirection,
      filters
    },
    tableHandlers: {
      setSearchTerm,
      setCurrentPage,
      handleSort,
      toggleFilter,
      clearFilters
    }
  };
};