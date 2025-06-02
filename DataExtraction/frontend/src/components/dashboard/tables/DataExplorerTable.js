import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../../store/store';
import { FiSearch, FiFilter, FiDownload, FiChevronDown, FiChevronUp, FiChevronRight } from 'react-icons/fi';

const DataExplorerTable = ({ data, columns, title = 'Data Explorer', filterable = true, searchable = true, exportable = true }) => {
  const darkMode = useDarkMode();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filteredData, setFilteredData] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [filters, setFilters] = useState({});
  
  // Initialize columns if not provided
  const tableColumns = columns || (data && data.length > 0 
    ? Object.keys(data[0]).map(key => ({ 
        id: key, 
        header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        accessor: (row) => row[key]
      }))
    : []);
  
  // Effect to filter and sort data
  useEffect(() => {
    if (!data) {
      setFilteredData([]);
      return;
    }
    
    let filtered = [...data];
    
    // Apply search
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        return tableColumns.some(column => {
          const value = column.accessor(item);
          return value && String(value).toLowerCase().includes(lowercasedSearch);
        });
      });
    }
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== 'all') {
        filtered = filtered.filter(item => {
          const columnDef = tableColumns.find(col => col.id === key);
          if (!columnDef) return true;
          const itemValue = columnDef.accessor(item);
          return String(itemValue) === String(value);
        });
      }
    });
    
    // Apply sorting
    if (sortConfig.key) {
      const column = tableColumns.find(col => col.id === sortConfig.key);
      if (column) {
        filtered.sort((a, b) => {
          const aValue = column.accessor(a);
          const bValue = column.accessor(b);
          
          if (aValue === bValue) return 0;
          
          // Handle numeric sorting
          if (!isNaN(aValue) && !isNaN(bValue)) {
            return sortConfig.direction === 'asc' 
              ? Number(aValue) - Number(bValue)
              : Number(bValue) - Number(aValue);
          }
          
          // Handle string sorting
          const aString = String(aValue || '').toLowerCase();
          const bString = String(bValue || '').toLowerCase();
          
          return sortConfig.direction === 'asc'
            ? aString.localeCompare(bString)
            : bString.localeCompare(aString);
        });
      }
    }
    
    setFilteredData(filtered);
  }, [data, searchTerm, sortConfig, filters, tableColumns]);
  
  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Handle row expansion
  const toggleRowExpansion = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Get unique values for a column (for filters)
  const getUniqueValues = (columnId) => {
    if (!data || data.length === 0) return [];
    
    const column = tableColumns.find(col => col.id === columnId);
    if (!column) return [];
    
    const values = data.map(item => column.accessor(item));
    return ['all', ...new Set(values)];
  };
  
  // Handle filter change
  const handleFilterChange = (columnId, value) => {
    setFilters(prev => ({
      ...prev,
      [columnId]: value
    }));
  };
  
  // Export data to CSV
  const exportToCSV = () => {
    if (!filteredData || filteredData.length === 0) return;
    
    const headers = tableColumns.map(col => col.header).join(',');
    const rows = filteredData.map(row => {
      return tableColumns.map(col => {
        const value = col.accessor(row);
        // Handle values with commas by wrapping in quotes
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"`
          : value;
      }).join(',');
    }).join('\n');
    
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title.replace(/\s+/g, '_').toLowerCase()}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Generate a unique ID for each row
  const getRowId = (row, index) => {
    return row.id || row._id || `row-${index}`;
  };
  
  return (
    <div className={`w-full ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {searchable && (
            <div className={`relative ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-8 pr-4 py-1 rounded-md text-sm ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 focus:border-blue-500' 
                    : 'bg-white border-gray-300 focus:border-blue-500'
                } border focus:outline-none focus:ring-1 focus:ring-blue-500`}
              />
              <FiSearch className="absolute left-2.5 top-2 text-gray-400" />
            </div>
          )}
          
          {exportable && (
            <button
              onClick={exportToCSV}
              disabled={!filteredData || filteredData.length === 0}
              className={`flex items-center px-3 py-1 rounded-md text-sm ${
                darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' 
                  : 'bg-white hover:bg-gray-100 text-gray-700'
              } border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}
            >
              <FiDownload className="mr-1" /> Export
            </button>
          )}
        </div>
      </div>
      
      {filterable && tableColumns.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center`}>
            <FiFilter className="mr-1" /> Filters:
          </span>
          
          {tableColumns.slice(0, 3).map(column => (
            <div key={column.id} className="flex items-center">
              <select
                value={filters[column.id] || 'all'}
                onChange={(e) => handleFilterChange(column.id, e.target.value)}
                className={`text-sm rounded-md ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-700'
                } border px-2 py-1`}
              >
                <option value="all">{column.header}: All</option>
                {getUniqueValues(column.id).filter(v => v !== 'all').map(value => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
      
      <div className="overflow-x-auto">
        {filteredData && filteredData.length > 0 ? (
          <table className={`min-w-full border-collapse ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            <thead>
              <tr className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                <th className="w-10 px-4 py-2"></th> {/* Expansion column */}
                {tableColumns.map(column => (
                  <th 
                    key={column.id}
                    onClick={() => requestSort(column.id)}
                    className={`px-4 py-2 text-left text-sm font-medium cursor-pointer ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      {column.header}
                      {sortConfig.key === column.id ? (
                        sortConfig.direction === 'asc' ? (
                          <FiChevronUp className="ml-1" />
                        ) : (
                          <FiChevronDown className="ml-1" />
                        )
                      ) : null}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, rowIndex) => {
                const rowId = getRowId(row, rowIndex);
                const isExpanded = expandedRows[rowId];
                
                return (
                  <React.Fragment key={rowId}>
                    <tr 
                      className={`${
                        darkMode 
                          ? 'border-gray-700 hover:bg-gray-800/50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      } border-b`}
                    >
                      <td className="px-4 py-2">
                        <button 
                          onClick={() => toggleRowExpansion(rowId)}
                          className={`p-1 rounded-full ${
                            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                          }`}
                        >
                          <FiChevronRight 
                            className={`transition-transform ${isExpanded ? 'transform rotate-90' : ''}`} 
                          />
                        </button>
                      </td>
                      {tableColumns.map(column => (
                        <td key={column.id} className="px-4 py-2 text-sm">
                          {column.accessor(row)}
                        </td>
                      ))}
                    </tr>
                    
                    {isExpanded && (
                      <tr className={darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}>
                        <td colSpan={tableColumns.length + 1} className="px-4 py-2">
                          <div className="p-2 text-sm">
                            <h4 className="font-medium mb-2">Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {Object.entries(row).map(([key, value]) => (
                                <div key={key} className="flex">
                                  <span className={`font-medium mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {key}:
                                  </span>
                                  <span>
                                    {typeof value === 'object' 
                                      ? JSON.stringify(value) 
                                      : String(value)
                                    }
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className={`py-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {data && data.length > 0 
              ? 'No matching data found. Try adjusting your search or filters.'
              : 'No data available.'
            }
          </div>
        )}
      </div>
      
      <div className="mt-2 text-sm text-right text-gray-500">
        {filteredData && data 
          ? `Showing ${filteredData.length} of ${data.length} entries`
          : ''
        }
      </div>
    </div>
  );
};

export default DataExplorerTable;
