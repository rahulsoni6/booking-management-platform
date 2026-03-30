import { useState, useEffect } from 'react';

export default function CustomerHistory({ customerId, className = "" }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!customerId) return;

    const fetchCustomerHistory = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const data = await bookingApi.getCustomerBookings(customerId);

        // Mock customer booking history
        const mockBookings = [
          {
            id: 1001,
            date: '2024-03-25',
            service: 'Swedish Massage',
            therapist: 'Lily',
            status: 'completed',
            amount: 77.00
          },
          {
            id: 1002,
            date: '2024-03-18',
            service: 'Facial Treatment',
            therapist: 'Sophia',
            status: 'completed',
            amount: 65.00
          },
          {
            id: 1003,
            date: '2024-03-10',
            service: 'Deep Tissue Massage',
            therapist: 'Lily',
            status: 'cancelled',
            amount: 95.00
          }
        ];

        setBookings(mockBookings);
      } catch (error) {
        console.error('Error fetching customer history:', error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerHistory();
  }, [customerId]);

  if (!customerId || bookings.length === 0) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const recentBookings = expanded ? bookings : bookings.slice(0, 2);

  return (
    <div className={`bg-gray-50 rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900">
          Recent Bookings ({bookings.length})
        </h4>
        {bookings.length > 2 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {expanded ? 'Show Less' : 'Show All'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {recentBookings.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between py-2 px-3 bg-white rounded border">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {booking.service}
                </div>
                <div className="text-xs text-gray-500">
                  {booking.date} • {booking.therapist}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  ${booking.amount}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {expanded && bookings.length > 2 && (
        <div className="mt-3 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Showing all {bookings.length} bookings
          </div>
        </div>
      )}
    </div>
  );
}