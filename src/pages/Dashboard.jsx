import { useState, useEffect } from "react";
import NavigationBar from "../layouts/NavigationBar";
import HeaderBar from "../layouts/HeaderBar";
import ReservationsBoard from "../components/Calendar/ReservationsBoard";
import BookingFilters from "../components/Common/BookingFilters";
import useBookingStore from "../store/bookingStore";

export default function Dashboard() {
  const [filters, setFilters] = useState({});
  const fetchBookings = useBookingStore(state => state.fetchBookings);
  const startPolling = useBookingStore(state => state.startPolling);
  const stopPolling = useBookingStore(state => state.stopPolling);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    // Refetch bookings with new filters
    fetchBookings(newFilters);
  };

  useEffect(() => {
    // Start polling for real-time updates
    startPolling({}, 30000); // Poll every 30 seconds

    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  return (
    <div className="h-screen flex flex-col">
      <NavigationBar />

      <HeaderBar />

      <BookingFilters onFiltersChange={handleFiltersChange} />

      <ReservationsBoard filters={filters} />
    </div>
  );
}