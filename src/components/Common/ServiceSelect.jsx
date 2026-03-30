import { useState, useEffect } from 'react';

export default function ServiceSelect({ value, onChange, className = "" }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock services data - replace with API call
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call
        // const data = await bookingApi.getServices();
        const mockServices = [
          { id: 34, name: 'Swedish Massage', duration: 60, price: 77.00, category: 'Massage' },
          { id: 35, name: 'Deep Tissue Massage', duration: 90, price: 95.00, category: 'Massage' },
          { id: 36, name: 'Facial Treatment', duration: 45, price: 65.00, category: 'Facial' },
          { id: 37, name: 'Manicure', duration: 30, price: 35.00, category: 'Nails' },
          { id: 38, name: 'Sports Massage', duration: 75, price: 85.00, category: 'Massage' },
        ];
        setServices(mockServices);
      } catch (err) {
        setError('Failed to load services');
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const selectedService = services.find(s => s.id.toString() === value?.toString());

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Service *
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        disabled={loading}
      >
        <option value="">Select a service...</option>
        {services.map((service) => (
          <option key={service.id} value={service.id}>
            {service.name} - {service.duration}min - ${service.price}
          </option>
        ))}
      </select>

      {loading && (
        <div className="absolute right-2 top-8 flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Service details */}
      {selectedService && (
        <div className="mt-2 p-2 bg-gray-50 rounded-md">
          <div className="text-sm">
            <span className="font-medium">Duration:</span> {selectedService.duration} minutes
          </div>
          <div className="text-sm">
            <span className="font-medium">Price:</span> ${selectedService.price}
          </div>
          <div className="text-sm">
            <span className="font-medium">Category:</span> {selectedService.category}
          </div>
        </div>
      )}
    </div>
  );
}