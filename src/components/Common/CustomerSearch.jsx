import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

export default function CustomerSearch({
  value,
  onChange,
  onCreateNew,
  className = ""
}) {
  const [query, setQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Mock customer data - replace with API call
  const mockCustomers = [
    { id: 980, name: 'John Smith', email: 'john@example.com', phone: '+1234567890' },
    { id: 981, name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1234567891' },
    { id: 982, name: 'Mike Davis', email: 'mike@example.com', phone: '+1234567892' },
    { id: 983, name: 'Emma Wilson', email: 'emma@example.com', phone: '+1234567893' },
    { id: 984, name: 'Alex Brown', email: 'alex@example.com', phone: '+1234567894' },
  ];

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (searchQuery.length < 2) {
        setCustomers([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const data = await bookingApi.searchCustomers(searchQuery);
        const filteredCustomers = mockCustomers.filter(customer =>
          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.phone.includes(searchQuery)
        );
        setCustomers(filteredCustomers);
      } catch (error) {
        console.error('Error searching customers:', error);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
    return () => debouncedSearch.cancel();
  }, [query, debouncedSearch]);

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setShowDropdown(true);
    setSelectedIndex(-1);
  };

  const handleSelectCustomer = (customer) => {
    setQuery(customer.name);
    setShowDropdown(false);
    setSelectedIndex(-1);
    onChange(customer);
  };

  const handleCreateNew = () => {
    setShowDropdown(false);
    onCreateNew(query);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || customers.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < customers.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectCustomer(customers[selectedIndex]);
        } else if (query.length > 0) {
          handleCreateNew();
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleFocus = () => {
    if (customers.length > 0 || query.length >= 2) {
      setShowDropdown(true);
    }
  };

  const handleBlur = () => {
    // Delay hiding dropdown to allow for clicks
    setTimeout(() => setShowDropdown(false), 200);
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Customer Search *
      </label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
          placeholder="Search customers by name, email, or phone..."
        />

        {/* Loading indicator */}
        {loading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Search icon */}
        {!loading && (
          <div className="absolute right-3 top-2.5">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {customers.length > 0 ? (
            <>
              {customers.map((customer, index) => (
                <button
                  key={customer.id}
                  onClick={() => handleSelectCustomer(customer)}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                    index === selectedIndex ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    </div>
                    <div className="text-sm text-gray-500">{customer.phone}</div>
                  </div>
                </button>
              ))}

              {/* Create new customer option */}
              <div className="border-t border-gray-200">
                <button
                  onClick={handleCreateNew}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 text-blue-600 ${
                    selectedIndex === customers.length ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create new customer "{query}"
                  </div>
                </button>
              </div>
            </>
          ) : query.length >= 2 && !loading ? (
            <div className="px-4 py-2 text-gray-500">
              No customers found
              <button
                onClick={handleCreateNew}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                Create "{query}"?
              </button>
            </div>
          ) : query.length < 2 ? (
            <div className="px-4 py-2 text-gray-500">
              Type at least 2 characters to search
            </div>
          ) : null}
        </div>
      )}

      {/* Selected customer display */}
      {value && (
        <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
          <div className="text-sm">
            <span className="font-medium">Selected:</span> {value.name}
          </div>
          <div className="text-sm text-gray-600">{value.email} • {value.phone}</div>
        </div>
      )}
    </div>
  );
}