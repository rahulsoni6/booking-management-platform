import { useEffect, useMemo } from "react";
import TimeColumn from "./TimeColumn";
import TherapistHeader from "./TherapistHeader";
import ReservationCard from "./ReservationCard";
import BookingSidePanel from "../Booking/BookingSidePanel";
import useBookingStore from "../../store/bookingStore";
import { generateTimeSlots } from "../../utils/timeUtils";



export default function ReservationsBoard({ filters = {} }) {
  const bookings = useBookingStore((state) => state.bookings);


  const therapists = useMemo(() => {
  if (!Array.isArray(bookings)) return [];

  const map = new Map();

  bookings.forEach((booking) => {
    const itemsObj = booking.booking_item;
    if (!itemsObj) return;

    Object.values(itemsObj).forEach((items) => {
      items.forEach((item) => {
        if (!item.therapist) return;

        const name = item.therapist.trim();

        if (!map.has(name.toLowerCase())) {
          map.set(name.toLowerCase(), {
            id: item.therapist_id,
            name: name,
          });
        }
      });
    });
  });

  return Array.from(map.values());
}, [bookings]);




  console.log("BOOOOOO", bookings)
  const selectedBooking = useBookingStore(
    (state) => state.selectedBooking
  );
  const fetchBookings = useBookingStore((state) => state.fetchBookings);
  const setSelectedBooking = useBookingStore(
    (state) => state.setSelectedBooking
  );

  useEffect(() => {
    // Use filters if provided, otherwise default to current date range
    if (Object.keys(filters).length > 0) {
      fetchBookings(filters);
    } else {
      // Default to current date range (today to 7 days ahead)
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 7);

      const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`; // DD-MM-YYYY format
      };

      const daterange = `${formatDate(today)} / ${formatDate(endDate)}`;
      fetchBookings({ daterange });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  const bookingMap = useMemo(() => {
    if (!Array.isArray(bookings)) return {};

    const map = {};

    bookings.forEach((booking) => {
      const itemsObj = booking.booking_item;
      if (!itemsObj) return;

      Object.values(itemsObj).forEach((items) => {
        items.forEach((item) => {
          if (!item.therapist || !item.start_time) return;

          // ✅ normalize time to match your slots (HH:mm)
          const start = item.start_time.slice(0, 5);
          const end = item.end_time.slice(0, 5);

          // ✅ fill ALL slots between start → end (handles duration)
          let current = start;

          while (current < end) {
            const key = `${item.therapist.trim().toLowerCase()}-${current}`;

            if (!map[key]) map[key] = [];
            map[key].push({
              id: booking.id,
              status: booking.status?.toLowerCase(),

              customerName: booking.customer_name,
              title: booking.customer_name,

              serviceName: item.service,
              therapistName: item.therapist,

              therapistGender: item.therapist_gender, // if exists

              room: item.room_items?.[0]?.room_name,

              requested_person: item.requested_person,

              startTime: item.start_time,
              endTime: item.end_time,

              raw: booking, // optional (for full access later)
            });

            // increment 15 mins (adjust if your slots differ)
            const [h, m] = current.split(":").map(Number);

            let newMinutes = m + 15;
            let newHours = h;

            if (newMinutes >= 60) {
              newMinutes -= 60;
              newHours += 1;
            }

            current = `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}`;

          }
        });
      });
    });

    return map;
  }, [bookings]);


  console.log("map ", bookingMap)

  return (
    <div className="flex flex-1 overflow-hidden relative">
      <div className="flex-1 flex flex-col overflow-hidden">
        <TherapistHeader therapists={therapists} />

        <div className="flex flex-1 overflow-auto">
          <TimeColumn timeSlots={timeSlots} />

          <div className="flex-1 grid grid-cols-7 min-w-[700px]">
            {timeSlots.map((slot) =>
              therapists.map((therapist) => {
                const bookingsForSlot =
                  bookingMap[`${therapist.name.trim().toLowerCase()}-${slot}`];
                console.log("slot", bookingsForSlot)
                return (
                  <div
                    key={`${therapist.name}-${slot}`}
                    className="border h-20 p-1 relative"
                  >
                    {bookingsForSlot?.length ? (
                      bookingsForSlot.map((b, i) => (
                        <ReservationCard
                          key={i}
                          booking={b}
                          onSelect={setSelectedBooking}
                        />
                      ))
                    ) : (
                      <button
                        onClick={() => {
                          // Create a proper date-time for new bookings
                          const today = new Date();
                          const [hours, minutes] = slot.split(':');
                          today.setHours(parseInt(hours), parseInt(minutes), 0, 0);

                          setSelectedBooking({
                            id: undefined,
                            customerName: "",
                            title: "",
                            service: "",
                            therapist: therapist.name,
                            phone: "",
                            startTime: today.toISOString(), // Full ISO date-time string
                            status: "confirmed",
                            notes: "",
                            outlet: "Liat Towers",
                          });
                        }}
                        className="h-full w-full rounded hover:bg-blue-50 text-[10px] text-gray-400"
                        aria-label={`Create booking for ${therapist.name} at ${slot}`}
                      >
                        +
                      </button>
                    )}
                  </div>
                );
              })
            )}

            {bookings.length === 0 && (
              <div className="col-span-7 p-4 text-center text-gray-500">
                No bookings available. Click any slot to create one.
              </div>
            )}
          </div>
        </div>
      </div>

      <BookingSidePanel
        selectedBooking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </div>
  );
}