import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export default function BookingFilters({ onFiltersChange, className = "" }) {
  const [filters, setFilters] = useState({
    searchQuery: '',
    customer: '',
    service: '',
    therapist: '',
    status: '',
    dateRange: 'today',
    customStartDate: '',
    customEndDate: ''
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Status options
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'pending', label: 'Pending' },
    { value: 'checked-in', label: 'Checked In' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no-show', label: 'No Show' }
  ];

  // Date range options
  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'this-week', label: 'This Week' },
    { value: 'next-week', label: 'Next Week' },
    { value: 'this-month', label: 'This Month' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Mock data for dropdowns (replace with API calls)
  const services = [
    { id: '', name: 'All Services' },
    { id: '34', name: 'Swedish Massage' },
    { id: '35', name: 'Deep Tissue Massage' },
    { id: '36', name: 'Facial Treatment' },
    { id: '37', name: 'Manicure' }
  ];

  const therapists = [
    { id: '', name: 'All Therapists' },
    { id: '441', name: 'Lily' },
    { id: '442', name: 'James' },
    { id: '443', name: 'Sophia' }
  ];

  // Calculate date range based on selection
  const getDateRange = (rangeType) => {
    const now = new Date();
    switch (rangeType) {
      case 'today':
        return {
          start: format(now, 'yyyy-MM-dd'),
          end: format(now, 'yyyy-MM-dd')
        };
      case 'tomorrow':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return {
          start: format(tomorrow, 'yyyy-MM-dd'),
          end: format(tomorrow, 'yyyy-MM-dd')
        };
      case 'this-week':
        return {
          start: format(startOfWeek(now), 'yyyy-MM-dd'),
          end: format(endOfWeek(now), 'yyyy-MM-dd')
        };
      case 'next-week':
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return {
          start: format(startOfWeek(nextWeek), 'yyyy-MM-dd'),
          end: format(endOfWeek(nextWeek), 'yyyy-MM-dd')
        };
      case 'this-month':
        return {
          start: format(startOfMonth(now), 'yyyy-MM-dd'),
          end: format(endOfMonth(now), 'yyyy-MM-dd')
        };
      case 'custom':
        return {
          start: filters.customStartDate,
          end: filters.customEndDate
        };
      default:
        return null;
    }
  };

  // Update filters and notify parent
  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Build API-compatible filter object
    const apiFilters = {
      search: newFilters.searchQuery,
      customer_name: newFilters.customer,
      service: newFilters.service,
      therapist: newFilters.therapist,
      status: newFilters.status,
      ...getDateRange(newFilters.dateRange)
    };

    // Remove empty filters
    Object.keys(apiFilters).forEach(key => {
      if (!apiFilters[key]) delete apiFilters[key];
    });

    onFiltersChange(apiFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    const defaultFilters = {
      searchQuery: '',
      customer: '',
      service: '',
      therapist: '',
      status: '',
      dateRange: 'today',
      customStartDate: '',
      customEndDate: ''
    };
    setFilters(defaultFilters);
    onFiltersChange({});
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value =>
    value && value !== 'today'
  );

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="px-4 py-3">
        {/* Main Search Bar */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search bookings by customer, service, or booking ID..."
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute left-3 top-2.5">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Filters
            <svg className={`ml-2 h-4 w-4 inline ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-300 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-gray-200">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => updateFilter('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {dateRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Date Range */}
            {filters.dateRange === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.customStartDate}
                    onChange={(e) => updateFilter('customStartDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.customEndDate}
                    onChange={(e) => updateFilter('customEndDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            )}

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Service */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service
              </label>
              <select
                value={filters.service}
                onChange={(e) => updateFilter('service', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Therapist */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Therapist
              </label>
              <select
                value={filters.therapist}
                onChange={(e) => updateFilter('therapist', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {therapists.map(therapist => (
                  <option key={therapist.id} value={therapist.id}>
                    {therapist.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                placeholder="Filter by customer name"
                value={filters.customer}
                onChange={(e) => updateFilter('customer', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.searchQuery && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                Search: "{filters.searchQuery}"
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Status: {statusOptions.find(s => s.value === filters.status)?.label}
              </span>
            )}
            {filters.service && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                Service: {services.find(s => s.id === filters.service)?.name}
              </span>
            )}
            {filters.therapist && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-pink-100 text-pink-800">
                Therapist: {therapists.find(t => t.id === filters.therapist)?.name}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}