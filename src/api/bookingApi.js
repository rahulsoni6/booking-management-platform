import axiosClient from "./axiosClient";

// Default configuration - should come from environment or config
const DEFAULT_CONFIG = {
  company: 1,
  outlet: 1,
  outlet_type: 2,
  panel: "outlet",
  currency: "SGD",
  membership: 0,
  booking_type: 1,
  payment_type: "payatstore",
  source: "Walk-in", // Default, can be overridden
  type: "manual"
};

export const getBookings = async (params = {}) => {
  // Build dynamic query parameters
  const queryParams = {
    pagination: params.pagination || 1,
    outlet: params.outlet || DEFAULT_CONFIG.outlet,
    panel: DEFAULT_CONFIG.panel,
    view_type: params.view_type || "calendar",
    ...params // Allow overriding any parameter
  };

  // Handle daterange specially - ensure proper format
  if (params.daterange) {
    queryParams.daterange = params.daterange;
  }

  // Add optional filters if provided
  if (params.therapist) queryParams.therapist = params.therapist;
  if (params.service) queryParams.service = params.service;
  if (params.per_page) queryParams.per_page = params.per_page;
  if (params.booking) queryParams.booking = params.booking;
  if (params.status) queryParams.status = params.status;

  const response = await axiosClient.get("/bookings/outlet/booking/list", {
    params: queryParams,
  });
  console.log("here 1", response.data)

  return response.data;
};

export const getBookingDetails = async (id) => {
  const response = await axiosClient.get(`/bookings/booking-details/${id}`);
  return response.data;
};

export const createBooking = async (bookingData) => {
  const formData = new FormData();

  // Set defaults and merge with provided data
  const config = {
    ...DEFAULT_CONFIG,
    ...bookingData.config // Allow overriding defaults
  };

  // Required fields
  formData.append('company', config.company);
  formData.append('outlet', config.outlet);
  formData.append('outlet_type', config.outlet_type);
  formData.append('booking_type', config.booking_type);
  formData.append('currency', config.currency);
  formData.append('source', config.source);
  formData.append('payment_type', config.payment_type);
  formData.append('membership', config.membership);
  formData.append('panel', config.panel);
  formData.append('type', config.type);

  // Customer data - dynamic
  if (bookingData.customer) {
    formData.append('customer', bookingData.customer);
  }
  if (bookingData.customer_name) {
    formData.append('customer_name', bookingData.customer_name);
  }
  if (bookingData.customer_lastname) {
    formData.append('customer_lastname', bookingData.customer_lastname);
  }
  if (bookingData.customer_email) {
    formData.append('customer_email', bookingData.customer_email);
  }
  if (bookingData.mobile_number) {
    formData.append('mobile_number', bookingData.mobile_number);
  }

  // User/creator data - should come from auth context
  if (bookingData.created_by) {
    formData.append('created_by', bookingData.created_by);
  }

  // Service timing - required
  if (bookingData.service_at) {
    formData.append('service_at', bookingData.service_at);
  }

  // Items array - dynamic based on booking items
  if (bookingData.items && Array.isArray(bookingData.items)) {
    formData.append('items', JSON.stringify(bookingData.items));
  }

  // Optional note
  if (bookingData.note) {
    formData.append('note', bookingData.note);
  }

  const response = await axiosClient.post("/bookings/create", formData);
  return response.data;
};

export const updateBooking = async (id, bookingData) => {
  const formData = new FormData();

  // Set defaults for update
  const config = {
    ...DEFAULT_CONFIG,
    ...bookingData.config
  };

  // Required fields for update
  formData.append('company', config.company);
  formData.append('outlet', config.outlet);
  formData.append('panel', config.panel);

  // Booking ID
  formData.append('id', id);

  // Customer data - dynamic
  if (bookingData.customer) {
    formData.append('customer', bookingData.customer);
  }
  if (bookingData.customer_name) {
    formData.append('customer_name', bookingData.customer_name);
  }
  if (bookingData.customer_lastname) {
    formData.append('customer_lastname', bookingData.customer_lastname);
  }
  if (bookingData.customer_email) {
    formData.append('customer_email', bookingData.customer_email);
  }
  if (bookingData.mobile_number) {
    formData.append('mobile_number', bookingData.mobile_number);
  }

  // User/creator data
  if (bookingData.updated_by) {
    formData.append('updated_by', bookingData.updated_by);
  }

  // Service timing
  if (bookingData.service_at) {
    formData.append('service_at', bookingData.service_at);
  }

  // Items array - dynamic
  if (bookingData.items && Array.isArray(bookingData.items)) {
    formData.append('items', JSON.stringify(bookingData.items));
  }

  // Optional note
  if (bookingData.note) {
    formData.append('note', bookingData.note);
  }

  const response = await axiosClient.post(`/bookings/${id}`, formData);
  return response.data;
};

export const updateBookingStatus = async (data) => {
  const formData = new FormData();

  // Required fields
  formData.append('company', DEFAULT_CONFIG.company);
  formData.append('id', data.id);
  formData.append('status', data.status);
  formData.append('panel', DEFAULT_CONFIG.panel);

  if (data.outlet_type) {
    formData.append('outlet_type', data.outlet_type);
  }

  const response = await axiosClient.post("/bookings/update/payment-status", formData);
  return response.data;
};

export const cancelBooking = async (data) => {
  const cancelData = {
    company: data.company || DEFAULT_CONFIG.company,
    id: data.id,
    type: data.type || 'normal', // normal or no-show
    panel: data.panel || DEFAULT_CONFIG.panel,
    ...data // Allow additional overrides
  };

  const formData = new FormData();
  Object.entries(cancelData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  const response = await axiosClient.post("/bookings/item/cancel", formData);
  return response.data;
};

export const deleteBooking = async (id) => {
  const response = await axiosClient.delete(`/bookings/destroy/${id}`);
  return response.data;
};