import * as bookingApi from "../api/bookingApi";
import logger from "./loggerService";

class BookingService {
  async fetchBookings(params) {
    try {
      logger.info("inside booking ")
      const data = await bookingApi.getBookings(params);
      logger.info("HUIIII", data)

      // Normalize response: ensure we always get an array
      const bookingsArray = Array.isArray(data?.data?.list?.bookings) ? data?.data?.list?.bookings : data?.data.data.list.bookings || [];
      logger.info("11111111111111111111111111", bookingsArray)


      logger.info("Bookings fetched", {
        count: bookingsArray.length,
        raw: bookingsArray,
      });

      return bookingsArray;
    } catch (error) {
      // logger.error("Failed to fetch bookings", error);
      throw error;
    }
  }

  async getBookingDetails(id) {
    try {
      const data = await bookingApi.getBookingDetails(id);

      logger.info("Booking details fetched", { id });

      return data;
    } catch (error) {
      logger.error("Failed to fetch booking details", error);
      throw error;
    }
  }

  async createBooking(data) {
    try {
      const response =
        await bookingApi.createBooking(data);

      logger.info("Booking created");

      return response;
    } catch (error) {
      logger.error("Create booking failed", error);
      throw error;
    }
  }

  async updateBooking(id, data) {
    try {
      const response =
        await bookingApi.updateBooking(id, data);

      logger.info("Booking updated");

      return response;
    } catch (error) {
      logger.error("Update booking failed", error);
      throw error;
    }
  }

  async updateBookingStatus(data) {
    try {
      const response =
        await bookingApi.updateBookingStatus(data);

      logger.info("Booking status updated");

      return response;
    } catch (error) {
      logger.error("Update booking status failed", error);
      throw error;
    }
  }

  async cancelBooking(data) {
    try {
      const response =
        await bookingApi.cancelBooking(data);

      logger.info("Booking cancelled");

      return response;
    } catch (error) {
      logger.error("Cancel booking failed", error);
      throw error;
    }
  }

  async deleteBooking(id) {
    try {
      const response =
        await bookingApi.deleteBooking(id);

      logger.info("Booking deleted");

      return response;
    } catch (error) {
      logger.error("Delete booking failed", error);
      throw error;
    }
  }
}

const bookingService = new BookingService();

export default bookingService;