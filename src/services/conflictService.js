import * as bookingApi from "../api/bookingApi";
import logger from "./loggerService";

class ConflictService {
  /**
   * Check for scheduling conflicts before creating/updating a booking
   * @param {Object} bookingData - The booking data to validate
   * @returns {Promise<Array>} - Array of conflict objects
   */
  async checkConflicts(bookingData) {
    try {
      const conflicts = [];

      // Check therapist availability
      const therapistConflicts = await this.checkTherapistAvailability(
        bookingData.therapist,
        bookingData.service_at,
        bookingData.items[0].duration,
        bookingData.id // Exclude current booking if updating
      );

      if (therapistConflicts.length > 0) {
        conflicts.push(...therapistConflicts.map(conflict => ({
          type: 'therapist',
          severity: 'error',
          message: `Therapist ${conflict.therapistName} is already booked`,
          details: conflict,
          suggestion: 'Choose a different time or therapist'
        })));
      }

      // Check room availability
      const roomConflicts = await this.checkRoomAvailability(
        bookingData.items[0].room_id,
        bookingData.service_at,
        bookingData.items[0].duration,
        bookingData.id
      );

      if (roomConflicts.length > 0) {
        conflicts.push(...roomConflicts.map(conflict => ({
          type: 'room',
          severity: 'error',
          message: `Room is already occupied`,
          details: conflict,
          suggestion: 'Choose a different room or time'
        })));
      }

      // Check for overlapping customer bookings
      const customerConflicts = await this.checkCustomerAvailability(
        bookingData.customer,
        bookingData.service_at,
        bookingData.items[0].duration,
        bookingData.id
      );

      if (customerConflicts.length > 0) {
        conflicts.push(...customerConflicts.map(conflict => ({
          type: 'customer',
          severity: 'warning',
          message: `Customer has another booking at this time`,
          details: conflict,
          suggestion: 'Customer may need to reschedule existing booking'
        })));
      }

      // Check business hours
      const businessHourConflicts = this.checkBusinessHours(bookingData.service_at);
      if (businessHourConflicts.length > 0) {
        conflicts.push(...businessHourConflicts);
      }

      logger.info('Conflict check completed', {
        bookingData: bookingData.id,
        conflictsFound: conflicts.length
      });

      return conflicts;
    } catch (error) {
      logger.error('Conflict check failed', error);
      throw error;
    }
  }

  /**
   * Check if therapist is available for the given time slot
   */
  async checkTherapistAvailability(therapistId, startTime, duration, excludeBookingId = null) {
    try {
      // Mock conflict checking - replace with actual API call
      const mockConflicts = [];

      // Simulate API call to check therapist schedule
      // const response = await bookingApi.checkTherapistAvailability(therapistId, startTime, duration);

      // For demo purposes, create some mock conflicts
      if (therapistId === '441' && startTime.includes('10:00')) {
        mockConflicts.push({
          therapistId,
          therapistName: 'Lily',
          conflictingBooking: {
            id: 999,
            customer: 'John Smith',
            service: 'Massage',
            startTime: '2024-03-25 10:00:00',
            duration: 60
          }
        });
      }

      return mockConflicts;
    } catch (error) {
      logger.error('Therapist availability check failed', error);
      throw error;
    }
  }

  /**
   * Check if room is available for the given time slot
   */
  async checkRoomAvailability(roomId, startTime, duration, excludeBookingId = null) {
    try {
      const mockConflicts = [];

      // Mock room conflict checking
      if (roomId === '223' && startTime.includes('14:00')) {
        mockConflicts.push({
          roomId,
          roomName: 'Couples Room',
          conflictingBooking: {
            id: 1000,
            customer: 'Jane Doe',
            service: 'Facial',
            startTime: '2024-03-25 14:00:00',
            duration: 45
          }
        });
      }

      return mockConflicts;
    } catch (error) {
      logger.error('Room availability check failed', error);
      throw error;
    }
  }

  /**
   * Check if customer has overlapping bookings
   */
  async checkCustomerAvailability(customerId, startTime, duration, excludeBookingId = null) {
    try {
      const mockConflicts = [];

      // Mock customer conflict checking
      if (customerId === '980' && startTime.includes('16:00')) {
        mockConflicts.push({
          customerId,
          customerName: 'John Smith',
          conflictingBooking: {
            id: 1001,
            service: 'Deep Tissue Massage',
            therapist: 'James',
            startTime: '2024-03-25 16:00:00',
            duration: 90
          }
        });
      }

      return mockConflicts;
    } catch (error) {
      logger.error('Customer availability check failed', error);
      throw error;
    }
  }

  /**
   * Check if booking is within business hours
   */
  checkBusinessHours(startTime) {
    const conflicts = [];
    const bookingDate = new Date(startTime);
    const hour = bookingDate.getHours();

    // Business hours: 9 AM - 9 PM
    if (hour < 9 || hour >= 21) {
      conflicts.push({
        type: 'business-hours',
        severity: 'warning',
        message: 'Booking is outside business hours (9 AM - 9 PM)',
        details: { requestedHour: hour },
        suggestion: 'Consider rescheduling within business hours'
      });
    }

    return conflicts;
  }

  /**
   * Get suggestions for alternative booking times
   */
  async getAlternativeTimes(bookingData, maxSuggestions = 3) {
    try {
      const alternatives = [];
      const baseTime = new Date(bookingData.service_at);

      // Suggest next available slots
      for (let i = 1; i <= maxSuggestions; i++) {
        const alternativeTime = new Date(baseTime);
        alternativeTime.setHours(baseTime.getHours() + i);

        // Check if this time slot is available
        const conflicts = await this.checkConflicts({
          ...bookingData,
          service_at: alternativeTime.toISOString().slice(0, 19).replace('T', ' ')
        });

        if (conflicts.length === 0) {
          alternatives.push({
            time: alternativeTime,
            formatted: alternativeTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })
          });
        }

        if (alternatives.length >= maxSuggestions) break;
      }

      return alternatives;
    } catch (error) {
      logger.error('Alternative times generation failed', error);
      return [];
    }
  }
}

const conflictService = new ConflictService();
export default conflictService;