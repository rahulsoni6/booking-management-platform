export default function ReservationCard({
  booking,
  onSelect,
}) {



  console.log("inside card", booking)
  // Status-based colors
  const getStatusStyles = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'pending':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'completed':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  // Gender-based therapist colors
  const getTherapistColor = (gender) => {
    return gender === 'female' ? '#ec4899' : '#3b82f6'; // Pink for female, blue for male
  };

  const therapistColor = getTherapistColor(booking.therapistGender);

  return (
    <button
      onClick={() => onSelect(booking)}
      className={`
        text-left
        border
        rounded
        p-2
        text-xs
        shadow-sm
        w-full
        transition
        hover:shadow-md
        focus:outline-none
        ${getStatusStyles(booking.status?.toLowerCase())}
      `}
    >
      <div className="flex justify-between items-center mb-1">
        <div className="font-semibold truncate flex-1">
          {booking.customerName || "Unknown"}
        </div>
        <div className="flex items-center gap-1">
          {/* Requested Therapist Icon */}
          {booking.requested_person && (
            <span className="text-[10px] bg-white rounded px-1" title="Requested Therapist">
              T
            </span>
          )}
          {/* Room Icon */}
          {booking.room && (
            <span className="text-[10px] bg-white rounded px-1" title="Room Assigned">
              R
            </span>
          )}
        </div>
      </div>

      <div className="text-gray-700 truncate mb-1">
        {booking.serviceName}
      </div>

      <div
        className="text-xs truncate font-medium"
        style={{ color: therapistColor }}
      >
        { booking.therapistName}
      </div>

      {booking.room && (
        <div className="text-gray-500 text-[10px] truncate">
          {booking.room}
        </div>
      )}
    </button>
  );
}