import { useState, useEffect } from 'react';
import useBookingStore from '../../store/bookingStore';

export default function TherapistSelect({ value, onChange, className = "" }) {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock therapists data - replace with API call
  useEffect(() => {
    const fetchTherapists = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call
        // const data = await bookingApi.getTherapists();
        const mockTherapists = [
          { id: 441, name: 'Lily', gender: 'female', specialties: ['Massage', 'Facial'] },
          { id: 442, name: 'James', gender: 'male', specialties: ['Massage', 'Sports Therapy'] },
          { id: 443, name: 'Sophia', gender: 'female', specialties: ['Facial', 'Manicure'] },
          { id: 444, name: 'Michael', gender: 'male', specialties: ['Massage', 'Reflexology'] },
        ];
        setTherapists(mockTherapists);
      } catch (err) {
        setError('Failed to load therapists');
        console.error('Error fetching therapists:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTherapists();
  }, []);

  const getGenderColor = (gender) => {
    return gender === 'female' ? '#ec4899' : '#3b82f6';
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Therapist *
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        disabled={loading}
      >
        <option value="">Select a therapist...</option>
        {therapists.map((therapist) => (
          <option key={therapist.id} value={therapist.id}>
            {therapist.name} ({therapist.specialties?.join(', ') || 'General'})
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

      {/* Therapist preview with gender color */}
      {value && therapists.find(t => t.id.toString() === value.toString()) && (
        <div className="mt-2 flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: getGenderColor(
                therapists.find(t => t.id.toString() === value.toString())?.gender
              )
            }}
          ></div>
          <span className="text-sm text-gray-600">
            {therapists.find(t => t.id.toString() === value.toString())?.name}
          </span>
        </div>
      )}
    </div>
  );
}