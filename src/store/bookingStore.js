import { create } from "zustand";
import bookingService from "../services/bookingService";
// import logger from "../services/loggerService";

const useBookingStore = create((set, get) => ({
  bookings: [],
  selectedBooking: null,
  loading: false,
  error: null,

  /*
  Fetch Bookings
  */

  fetchBookings: async (params) => {
    set({ loading: true, error: null });

    try {
      const data =
        await bookingService.fetchBookings(params);

      // Ensure data is always an array
      const bookingsArray = Array.isArray(data) ? data : [];

      set({
        bookings: bookingsArray,
        loading: false,
      });

      // logger.info("Bookings stored in state");
    } catch (error) {
      set({
        error: error.message,
        loading: false,
        bookings: [], // Reset to empty array on error
      });

      // logger.error("Fetch bookings failed", error);
    }
  },

  /*
  Select Booking
  */

  setSelectedBooking: (booking) => {
    set({
      selectedBooking: booking,
    });
  },

  /*
  Create Booking (Optimistic Update)
  */

  createBooking: async (newBooking) => {
    const previousBookings = get().bookings;

    // Ensure previousBookings is always an array
    const bookingsArray = Array.isArray(previousBookings) ? previousBookings : [];

    const tempBooking = {
      ...newBooking,
      id: Date.now(),
    };

    set({
      bookings: [...bookingsArray, tempBooking],
    });

    try {
      const created =
        await bookingService.createBooking(
          newBooking
        );

      set((state) => ({
        bookings: state.bookings.map((b) =>
          b.id === tempBooking.id
            ? created
            : b
        ),
      }));

      // logger.info("Booking created");
    } catch (error) {
      set({
        bookings: bookingsArray,
      });

      // logger.error("Create booking failed", error);
    }
  },

  /*
  Update Booking (Optimistic)
  */

  updateBooking: async (id, updatedData) => {
    const previousBookings = get().bookings;

    // Ensure previousBookings is always an array
    const bookingsArray = Array.isArray(previousBookings) ? previousBookings : [];

    set((state) => ({
      bookings: (Array.isArray(state.bookings) ? state.bookings : []).map((b) =>
        b.id === id
          ? { ...b, ...updatedData }
          : b
      ),
    }));

    try {
      await bookingService.updateBooking(
        id,
        updatedData
      );

      // logger.info("Booking updated");
    } catch (error) {
      set({
        bookings: bookingsArray,
      });

      // logger.error("Update booking failed", error);
    }
  },

  /*
  Cancel Booking
  */

  cancelBooking: async (data) => {
    const previousBookings = get().bookings;

    // Ensure previousBookings is always an array
    const bookingsArray = Array.isArray(previousBookings) ? previousBookings : [];

    set((state) => ({
      bookings: (Array.isArray(state.bookings) ? state.bookings : []).map((b) =>
        b.id === data.id
          ? { ...b, status: "cancelled" }
          : b
      ),
    }));

    try {
      await bookingService.cancelBooking(data);

      // logger.info("Booking cancelled");
    } catch (error) {
      set({
        bookings: bookingsArray,
      });

      // logger.error("Cancel booking failed", error);
    }
  },

  /*
  Get Booking Details
  */

  getBookingDetails: async (id) => {
    set({ loading: true, error: null });

    try {
      const bookingDetails = await bookingService.getBookingDetails(id);

      set({
        selectedBooking: bookingDetails,
        loading: false,
      });

      // logger.info("Booking details loaded", { id });
      return bookingDetails;
    } catch (error) {
      set({
        error: error.message,
        loading: false,
      });

      // logger.error("Get booking details failed", error);
      throw error;
    }
  },

  /*
  Update Booking Status
  */

  updateBookingStatus: async (data) => {
    const previousBookings = get().bookings;

    // Ensure previousBookings is always an array
    const bookingsArray = Array.isArray(previousBookings) ? previousBookings : [];

    set((state) => ({
      bookings: (Array.isArray(state.bookings) ? state.bookings : []).map((b) =>
        b.id === data.id
          ? { ...b, status: data.status }
          : b
      ),
    }));

    try {
      await bookingService.updateBookingStatus(data);

      // logger.info("Booking status updated");
    } catch (error) {
      set({
        bookings: bookingsArray,
      });

      // logger.error("Update booking status failed", error);
    }
  },

  /*
  Real-time Updates (Polling)
  */

  pollingInterval: null,
  lastFetchParams: null,

  startPolling: (params, interval = 30000) => { // 30 seconds default
    const { pollingInterval } = get();

    // Clear existing interval if any
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    // Store params for refetching
    set({ lastFetchParams: params });

    // Start new polling
    const newInterval = setInterval(async () => {
      try {
        await get().fetchBookings(params);
      } catch (error) {
        // Silent fail for polling - don't disrupt UI
        console.warn('Polling fetch failed:', error);
      }
    }, interval);

    set({ pollingInterval: newInterval });
  },

  stopPolling: () => {
    const { pollingInterval } = get();
    if (pollingInterval) {
      clearInterval(pollingInterval);
      set({ pollingInterval: null, lastFetchParams: null });
    }
  },

  refetchBookings: async () => {
    const { lastFetchParams } = get();
    if (lastFetchParams) {
      await get().fetchBookings(lastFetchParams);
    }
  },
}));

export default useBookingStore;