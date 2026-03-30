import { useState } from 'react';
import useBookingStore from '../../store/bookingStore';

const WORKFLOW_STATUSES = [
  { key: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800', description: 'Booking confirmed' },
  { key: 'checked-in', label: 'Checked In', color: 'bg-green-100 text-green-800', description: 'Customer arrived' },
  { key: 'in-progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', description: 'Service in progress' },
  { key: 'completed', label: 'Completed', color: 'bg-purple-100 text-purple-800', description: 'Service finished' },
  { key: 'paid', label: 'Paid', color: 'bg-emerald-100 text-emerald-800', description: 'Payment received' },
  { key: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', description: 'Booking cancelled' },
  { key: 'no-show', label: 'No Show', color: 'bg-gray-100 text-gray-800', description: 'Customer didn\'t arrive' }
];

export default function BookingWorkflow({ booking, onStatusChange }) {
  const [updating, setUpdating] = useState(false);
  const updateBookingStatus = useBookingStore(state => state.updateBookingStatus);

  const currentStatusIndex = WORKFLOW_STATUSES.findIndex(status => status.key === booking.status);

  const handleStatusChange = async (newStatus) => {
    if (updating) return;

    setUpdating(true);
    try {
      await updateBookingStatus({ id: booking.id, status: newStatus });
      onStatusChange && onStatusChange(newStatus);
    } catch (error) {
      console.error('Failed to update booking status:', error);
      alert('Failed to update booking status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const canTransitionTo = (targetStatus) => {
    const targetIndex = WORKFLOW_STATUSES.findIndex(status => status.key === targetStatus);

    // Allow forward progression in normal workflow
    if (targetIndex > currentStatusIndex) {
      return true;
    }

    // Allow cancellation from any status
    if (targetStatus === 'cancelled') {
      return true;
    }

    // Allow no-show from confirmed or checked-in
    if (targetStatus === 'no-show' && ['confirmed', 'checked-in'].includes(booking.status)) {
      return true;
    }

    // Allow going back to previous status (limited)
    if (targetIndex === currentStatusIndex - 1 && currentStatusIndex > 0) {
      return true;
    }

    return false;
  };

  const getNextRecommendedStatus = () => {
    switch (booking.status) {
      case 'confirmed':
        return 'checked-in';
      case 'checked-in':
        return 'in-progress';
      case 'in-progress':
        return 'completed';
      case 'completed':
        return 'paid';
      default:
        return null;
    }
  };

  const nextStatus = getNextRecommendedStatus();

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Booking Status</h3>
        {updating && (
          <div className="flex items-center text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Updating...
          </div>
        )}
      </div>

      {/* Current Status Display */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-600">Current Status:</span>
            <div className="flex items-center mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${WORKFLOW_STATUSES.find(s => s.key === booking.status)?.color}`}>
                {WORKFLOW_STATUSES.find(s => s.key === booking.status)?.label}
              </span>
              <span className="ml-2 text-sm text-gray-600">
                {WORKFLOW_STATUSES.find(s => s.key === booking.status)?.description}
              </span>
            </div>
          </div>
          {nextStatus && (
            <button
              onClick={() => handleStatusChange(nextStatus)}
              disabled={updating}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Mark as {WORKFLOW_STATUSES.find(s => s.key === nextStatus)?.label}
            </button>
          )}
        </div>
      </div>

      {/* Status Workflow */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Status Workflow</h4>

        {WORKFLOW_STATUSES.filter(status => status.key !== 'no-show').map((status, index) => {
          const isCompleted = index < currentStatusIndex;
          const isCurrent = index === currentStatusIndex;
          const isAvailable = canTransitionTo(status.key);

          return (
            <div
              key={status.key}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                isCurrent
                  ? 'bg-blue-50 border-blue-200'
                  : isCompleted
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${
                  isCompleted
                    ? 'bg-green-500'
                    : isCurrent
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                }`}>
                  {isCompleted && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>

                <div>
                  <div className={`text-sm font-medium ${
                    isCompleted ? 'text-green-800' :
                    isCurrent ? 'text-blue-800' : 'text-gray-600'
                  }`}>
                    {status.label}
                  </div>
                  <div className="text-xs text-gray-500">{status.description}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isCurrent && (
                  <span className="text-xs text-blue-600 font-medium">Current</span>
                )}

                {!isCurrent && isAvailable && (
                  <button
                    onClick={() => handleStatusChange(status.key)}
                    disabled={updating}
                    className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                  >
                    Set Status
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Special Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex gap-2">
          {booking.status !== 'cancelled' && (
            <button
              onClick={() => handleStatusChange('cancelled')}
              disabled={updating}
              className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              Cancel Booking
            </button>
          )}

          {(booking.status === 'confirmed' || booking.status === 'checked-in') && booking.status !== 'no-show' && (
            <button
              onClick={() => handleStatusChange('no-show')}
              disabled={updating}
              className="px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
            >
              Mark as No Show
            </button>
          )}
        </div>
      </div>

      {/* Status Change Log */}
      {booking.statusHistory && booking.statusHistory.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Status History</h4>
          <div className="space-y-1">
            {booking.statusHistory.slice(-3).reverse().map((entry, index) => (
              <div key={index} className="text-xs text-gray-600">
                <span className="font-medium">{entry.status}</span> - {entry.timestamp}
                {entry.user && <span className="text-gray-500"> by {entry.user}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}