import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import useBookingStore from "../../store/bookingStore";
import TherapistSelect from "../Common/TherapistSelect";
import ServiceSelect from "../Common/ServiceSelect";
import RoomSelect from "../Common/RoomSelect";
import CustomerSearch from "../Common/CustomerSearch";
import CustomerCreateModal from "../Common/CustomerCreateModal";
import CustomerHistory from "../Common/CustomerHistory";
import ConflictWarnings from "../Common/ConflictWarnings";
import BookingWorkflow from "../Common/BookingWorkflow";

export default function BookingSidePanel({ selectedBooking, onClose }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [conflictChecked, setConflictChecked] = useState(false);

  const createBooking = useBookingStore((state) => state.createBooking);
  const updateBooking = useBookingStore((state) => state.updateBooking);
  const cancelBooking = useBookingStore((state) => state.cancelBooking);
  const deleteBooking = useBookingStore((state) => state.deleteBooking);
  const setSelectedBooking = useBookingStore((state) => state.setSelectedBooking);

  const isNew = !selectedBooking?.id;

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      customerName: "",
      customerLastName: "",
      customerEmail: "",
      mobileNumber: "",
      service: "",
      therapist: "",
      startTime: "",
      duration: 60,
      room: "",
      notes: ""
    }
  });

  const watchedValues = watch();

  useEffect(() => {
    if (!selectedBooking) {
      reset();
      setError(null);
      return;
    }

    // For new bookings, set proper defaults
    const isNewBooking = !selectedBooking?.id;
    const now = new Date();

    // Reset form with booking data
    reset({
      title: selectedBooking.title || selectedBooking.customerName || "",
      service: selectedBooking.service || selectedBooking.serviceId || "",
      therapist: selectedBooking.therapist || selectedBooking.therapistId || "",
      phone: selectedBooking.phone || "",
      startTime: selectedBooking.startTime || (isNewBooking ? now.toISOString() : ""),
      status: selectedBooking.status || "confirmed",
      notes: selectedBooking.notes || "",
      duration: selectedBooking.duration || 60,
      room: selectedBooking.room || selectedBooking.roomId || "",
      customerName: selectedBooking.customerName || "",
      customerLastName: selectedBooking.customerLastName || "",
      customerEmail: selectedBooking.customerEmail || "",
      mobileNumber: selectedBooking.mobileNumber || selectedBooking.phone || ""
    });

    // Initialize selected customer if editing existing booking
    if (selectedBooking.customerId || selectedBooking.customer) {
      setSelectedCustomer({
        id: selectedBooking.customerId || selectedBooking.customer,
        name: selectedBooking.customerName || selectedBooking.title,
        email: selectedBooking.customerEmail || '',
        phone: selectedBooking.phone || selectedBooking.mobileNumber || ''
      });
    }
  }, [selectedBooking, reset]);

  if (!selectedBooking) return null;
   // Helper function for date formatting
      const formatDateTime = (date) => format(date, "yyyy-MM-dd HH:mm:ss");

  const onSubmit = async (formData) => {
    setSaving(true);
    setError(null);
    try {
     

      // Calculate start and end times from form data
      const startDateTime = new Date(formData.startTime);
      const endDateTime = new Date(startDateTime.getTime() + (formData.duration || 60) * 60000);

      // Build dynamic booking data object
      const bookingData = {
        // Customer data - from selected customer
        customer: selectedCustomer?.id || 980, // Fallback to default if no customer selected
        customer_name: selectedCustomer?.name || formData.customerName || 'New Customer',
        customer_lastname: formData.customerLastName || '',
        customer_email: selectedCustomer?.email || formData.customerEmail || '',
        mobile_number: selectedCustomer?.phone || formData.mobileNumber || formData.phone || '',

        // Service timing - calculated from form
        service_at: formatDateTime(startDateTime),

        // Items array - built dynamically from form
        items: [{
          service: formData.service || 34, // Dynamic service selection
          customer_name: formData.customerName || 'New Customer',
          start_time: startDateTime.toTimeString().slice(0, 5),
          end_time: endDateTime.toTimeString().slice(0, 5),
          duration: formData.duration || 60,
          therapist: formData.therapist || 441, // Dynamic therapist selection
          requested_person: 0,
          price: "77.00", // TODO: Get from service pricing
          quantity: "1",
          service_request: formData.service || "",
          commission: null,
          primary: 1,
          item_number: 1,
          room_segments: [{
            room_id: formData.room || 223, // Dynamic room selection
            item_type: "single-bed", // TODO: Get from room type
            meta_service: null,
            start_time: startDateTime.toTimeString().slice(0, 5),
            end_time: endDateTime.toTimeString().slice(0, 5),
            duration: formData.duration || 60,
            priority: 1
          }]
        }],

        // Optional note
        note: formData.notes || '',

        // Configuration overrides
        config: {
          source: 'Walk-in', // Could be dynamic based on booking source
          created_by: '229061' // TODO: Get from authenticated user
        }
      };

      console.log('Sending booking data:', bookingData);

      if (isNew) {
        const created = await createBooking(bookingData);
        setSelectedBooking(created);
      } else {
        // For updates, add the booking ID
        bookingData.updated_by = '229061'; // Should come from auth
        await updateBooking(selectedBooking.id, bookingData);
        setSelectedBooking({ ...selectedBooking, ...formData });
      }
      onClose();
    } catch (err) {
      console.error('Save booking error:', err);
      setError("Failed to save booking. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  async function handleCancelBooking() {
    if (isNew) return;
    const confirmed = window.confirm(
      "Mark this booking as cancelled?"
    );
    if (!confirmed) return;

    setSaving(true);
    setError(null);
    try {
      const cancelData = {
        id: selectedBooking.id,
        type: 'normal' // or 'no-show'
      };

      await cancelBooking(cancelData);
      setSelectedBooking({ ...selectedBooking, status: "cancelled" });
    } catch (err) {
      setError("Failed to cancel booking. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteBooking() {
    const confirmed = window.confirm(
      "Permanently delete this booking? This cannot be undone."
    );
    if (!confirmed) return;

    setSaving(true);
    setError(null);
    try {
      console.log("here",selectedBooking)
      await deleteBooking(selectedBooking.id);
      onClose();
    } catch (err) {
      setError("Failed to delete booking. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // Handle date/time display properly
  const getDisplayDateTime = () => {
    const timeString = watchedValues?.startTime || selectedBooking?.startTime;
    if (!timeString) return { day: "Invalid Date", time: "Invalid Date" };

    let dateObj;
    if (isNew) {
      // For new bookings, combine today's date with the selected time slot
      const today = new Date();
      const [hours, minutes] = timeString.split(':');
      today.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      dateObj = today;
    } else {
      // For existing bookings, parse the full date-time string
      dateObj = new Date(timeString);
    }

    if (isNaN(dateObj.getTime())) {
      return { day: "Invalid Date", time: "Invalid Date" };
    }

    const day = dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const time = dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return { day, time };
  };

  const { day, time } = getDisplayDateTime();

  return (
    <aside className="absolute top-0 right-0 z-20 h-full w-full max-w-md bg-white border-l shadow-lg overflow-auto">
      <div className="flex items-center justify-between p-4 border-b bg-slate-100">
        <div>
          <h2 className="text-lg font-bold">
            {isNew ? "Create Booking" : "Update Booking"}
          </h2>
          <div className="text-xs text-gray-500">
            Outlet: {selectedBooking?.outlet || "Liat Towers"}
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-sm px-3 py-1 rounded bg-white border hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center py-2 border-b text-sm text-gray-500">
          <span>{day}</span>
          <span>{time}</span>
        </div>

        <div className="bg-slate-50 rounded p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center text-white font-bold text-sm">
              {(selectedCustomer?.name || watchedValues?.customerName || selectedBooking?.title || selectedBooking?.customerName || "Unknown").charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-sm">
                {selectedCustomer?.name || watchedValues?.customerName || selectedBooking?.title || selectedBooking?.customerName || "New Customer"}
              </div>
              <div className="text-xs text-gray-500">
                {selectedCustomer?.phone || watchedValues?.mobileNumber || watchedValues?.phone || selectedBooking?.phone || "Add phone number"}
              </div>
              {selectedCustomer?.email && (
                <div className="text-xs text-gray-500">
                  {selectedCustomer.email}
                </div>
              )}
            </div>
          </div>
        </div>

        <CustomerSearch
          value={selectedCustomer}
          onChange={setSelectedCustomer}
          onCreateNew={(name) => setShowCustomerModal(true)}
          className="mb-4"
        />

        {selectedCustomer && (
          <CustomerHistory
            customerId={selectedCustomer.id}
            className="mb-4"
          />
        )}

        {/* Conflict Warnings */}
        {isNew && selectedCustomer && watchedValues.service && watchedValues.therapist && watchedValues.startTime && (
          <ConflictWarnings
            bookingData={{
              id: null, // New booking
              customer: selectedCustomer.id,
              customer_name: selectedCustomer.name,
              service_at: formatDateTime(new Date(watchedValues.startTime)),
              items: [{
                service: watchedValues.service,
                therapist: watchedValues.therapist,
                room_id: watchedValues.room,
                duration: watchedValues.duration || 60,
                start_time: new Date(watchedValues.startTime).toTimeString().slice(0, 5),
                end_time: new Date(new Date(watchedValues.startTime).getTime() + (watchedValues.duration || 60) * 60000).toTimeString().slice(0, 5)
              }]
            }}
            onConflictResolved={(resolvedData) => {
              // Update form with resolved data
              const resolvedTime = new Date(resolvedData.service_at);
              setValue('startTime', resolvedTime.toISOString());
              setValue('therapist', resolvedData.items[0].therapist);
              setValue('room', resolvedData.items[0].room_id);
              setConflictChecked(false);
            }}
          />
        )}

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-xs text-gray-500">Last Name</span>
            <input
              {...register("customerLastName")}
              className="mt-1 w-full rounded border px-2 py-2 text-sm"
              placeholder="Last name"
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">Phone</span>
            <input
              {...register("mobileNumber")}
              className="mt-1 w-full rounded border px-2 py-2 text-sm"
              placeholder="Phone number"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs text-gray-500">Email</span>
          <input
            {...register("customerEmail")}
            type="email"
            className="mt-1 w-full rounded border px-2 py-2 text-sm"
            placeholder="customer@example.com"
          />
        </label>

        <ServiceSelect
          value={watchedValues.service}
          onChange={(value) => setValue('service', value)}
        />

        <div className="grid grid-cols-2 gap-2">
          <TherapistSelect
            value={watchedValues.therapist}
            onChange={(value) => setValue('therapist', value)}
          />

          <label className="block">
            <span className="text-xs text-gray-500">Duration (min)</span>
            <input
              {...register("duration")}
              type="number"
              className="mt-1 w-full rounded border px-2 py-2 text-sm"
            />
          </label>
        </div>

        <div className="text-xs text-gray-500">
          Adjusted commission (S$) : <span className="font-semibold">52.00</span>
        </div>

        <RoomSelect
          value={watchedValues.room}
          onChange={(value) => setValue('room', value)}
        />

        <label className="block">
          <span className="text-xs text-gray-500">Notes</span>
          <textarea
            {...register("notes")}
            rows={3}
            className="mt-1 w-full rounded border px-2 py-2 text-sm"
          />
        </label>

        {/* Booking Workflow - Only for existing bookings */}
        {!isNew && (
          <BookingWorkflow
            booking={selectedBooking}
            onStatusChange={(newStatus) => {
              // Update the local booking state
              setSelectedBooking({ ...selectedBooking, status: newStatus });
            }}
          />
        )}

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <div className="sticky bottom-0 left-0 right-0 bg-white pt-3">
          <div className="flex gap-2">
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={saving}
              className="flex-1 rounded bg-amber-900 text-white py-2 text-sm hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : isNew ? "Create Booking" : "Save Changes"}
            </button>
            {!isNew && (
              <button
                onClick={handleCancelBooking}
                disabled={saving || selectedBooking.status === "cancelled"}
                className="flex-1 rounded bg-orange-500 text-white py-2 text-sm hover:opacity-90 disabled:opacity-50"
              >
                {selectedBooking.status === "cancelled" ? "Cancelled" : "Cancel"}
              </button>
            )}
            {!isNew && (
              <button
                onClick={handleDeleteBooking}
                disabled={saving}
                className="flex-1 rounded bg-red-500 text-white py-2 text-sm hover:opacity-90 disabled:opacity-50"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Customer Create Modal */}
      <CustomerCreateModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        initialName={watchedValues?.customerName || ''}
        onCreate={(newCustomer) => {
          setSelectedCustomer(newCustomer);
          // setForm(prev => ({
          //   ...prev,
          //   title: newCustomer.name,
          //   customerEmail: newCustomer.email,
          //   mobileNumber: newCustomer.phone
          // }));
        }}
      />
    </aside>
  );
}
