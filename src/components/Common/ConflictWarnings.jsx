import { useState, useEffect } from 'react';
import conflictService from '../../services/conflictService';

export default function ConflictWarnings({ bookingData, onConflictResolved }) {
  const [conflicts, setConflicts] = useState([]);
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (bookingData && !checked) {
      checkForConflicts();
    }
  }, [bookingData, checked]);

  const checkForConflicts = async () => {
    if (!bookingData) return;

    setLoading(true);
    try {
      const foundConflicts = await conflictService.checkConflicts(bookingData);
      setConflicts(foundConflicts);

      // Get alternative times if there are conflicts
      if (foundConflicts.length > 0) {
        const altTimes = await conflictService.getAlternativeTimes(bookingData);
        setAlternatives(altTimes);
      }

      setChecked(true);
    } catch (error) {
      console.error('Error checking conflicts:', error);
      setConflicts([{
        type: 'error',
        severity: 'error',
        message: 'Unable to check for conflicts. Please try again.',
        suggestion: 'Contact support if this persists'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error':
        return (
          <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.732 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const handleAlternativeSelect = (alternativeTime) => {
    // Update the booking data with the alternative time
    const updatedBookingData = {
      ...bookingData,
      service_at: alternativeTime.time.toISOString().slice(0, 19).replace('T', ' '),
      items: bookingData.items.map(item => ({
        ...item,
        start_time: alternativeTime.time.toTimeString().slice(0, 5)
      }))
    };

    onConflictResolved(updatedBookingData);
    setConflicts([]);
    setAlternatives([]);
    setChecked(false);
  };

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-sm text-gray-600">Checking for conflicts...</span>
        </div>
      </div>
    );
  }

  if (conflicts.length === 0) {
    return checked ? (
      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-green-800 font-medium">No conflicts detected</span>
        </div>
      </div>
    ) : null;
  }

  return (
    <div className="space-y-3">
      {conflicts.map((conflict, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border ${getSeverityStyles(conflict.severity)}`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              {getSeverityIcon(conflict.severity)}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium mb-1">
                {conflict.type === 'therapist' && 'Therapist Conflict'}
                {conflict.type === 'room' && 'Room Conflict'}
                {conflict.type === 'customer' && 'Customer Conflict'}
                {conflict.type === 'business-hours' && 'Business Hours Warning'}
                {conflict.type === 'error' && 'Error'}
              </h4>
              <p className="text-sm mb-2">{conflict.message}</p>

              {conflict.details && conflict.details.conflictingBooking && (
                <div className="text-xs bg-white bg-opacity-50 p-2 rounded mb-2">
                  <div><strong>Conflicting booking:</strong> {conflict.details.conflictingBooking.customer}</div>
                  <div><strong>Service:</strong> {conflict.details.conflictingBooking.service}</div>
                  <div><strong>Time:</strong> {conflict.details.conflictingBooking.startTime}</div>
                </div>
              )}

              {conflict.suggestion && (
                <p className="text-xs italic">{conflict.suggestion}</p>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Alternative Times */}
      {alternatives.length > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            Suggested Alternative Times:
          </h4>
          <div className="flex flex-wrap gap-2">
            {alternatives.map((alt, index) => (
              <button
                key={index}
                onClick={() => handleAlternativeSelect(alt)}
                className="px-3 py-1 text-xs bg-white border border-blue-300 rounded hover:bg-blue-100 text-blue-700"
              >
                {alt.formatted}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Force Proceed Warning */}
      {conflicts.some(c => c.severity === 'error') && (
        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-xs text-red-700">
            ⚠️ Critical conflicts detected. Proceeding may cause double-bookings.
            Please resolve conflicts or choose an alternative time.
          </p>
        </div>
      )}
    </div>
  );
}