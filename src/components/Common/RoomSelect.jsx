import { useState, useEffect } from 'react';

export default function RoomSelect({ value, onChange, className = "" }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock rooms data - replace with API call
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call
        // const data = await bookingApi.getRooms();
        const mockRooms = [
          { id: 223, name: 'Couples Room', type: 'double-bed', capacity: 2, amenities: ['Jacuzzi', 'TV'] },
          { id: 224, name: 'Deluxe Suite', type: 'single-bed', capacity: 1, amenities: ['Sauna', 'Massage Table'] },
          { id: 225, name: 'Standard Room', type: 'single-bed', capacity: 1, amenities: ['Massage Table'] },
          { id: 226, name: 'VIP Suite', type: 'double-bed', capacity: 2, amenities: ['Jacuzzi', 'Sauna', 'TV', 'Bar'] },
        ];
        setRooms(mockRooms);
      } catch (err) {
        setError('Failed to load rooms');
        console.error('Error fetching rooms:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const selectedRoom = rooms.find(r => r.id.toString() === value?.toString());

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Room
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        disabled={loading}
      >
        <option value="">Select a room...</option>
        {rooms.map((room) => (
          <option key={room.id} value={room.id}>
            {room.name} ({room.capacity} person{room.capacity > 1 ? 's' : ''})
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

      {/* Room details */}
      {selectedRoom && (
        <div className="mt-2 p-2 bg-gray-50 rounded-md">
          <div className="text-sm">
            <span className="font-medium">Type:</span> {selectedRoom.type.replace('-', ' ')}
          </div>
          <div className="text-sm">
            <span className="font-medium">Capacity:</span> {selectedRoom.capacity} person{selectedRoom.capacity > 1 ? 's' : ''}
          </div>
          {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
            <div className="text-sm">
              <span className="font-medium">Amenities:</span> {selectedRoom.amenities.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}