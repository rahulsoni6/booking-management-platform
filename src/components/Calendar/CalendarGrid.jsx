import { useMemo } from "react";
import { FixedSizeGrid as Grid } from "react-window";
import { generateTimeSlots } from "../../utils/timeUtils";
import useBookingStore from "../../store/bookingStore";
import ReservationCard from "./ReservationCard";
import styles from "./calendar.module.scss";

const therapists = [
  { id: 1, name: "Lily", gender: "female" },
  { id: 2, name: "James", gender: "male" },
  { id: 3, name: "Sophia", gender: "female" },
];

function CalendarGrid() {
  const bookings = useBookingStore((state) => state.bookings);
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // Create efficient lookup map for bookings
  const bookingMap = useMemo(() => {
    const map = new Map();
    bookings.forEach(booking => {
      // Create key based on therapist and time slot
      const therapistName = booking.therapistName || booking.therapist;
      const startTime = booking.startTime || booking.start_time;
      if (therapistName && startTime) {
        const key = `${therapistName}-${startTime}`;
        map.set(key, booking);
      }
    });
    return map;
  }, [bookings]);

  // Cell renderer for virtual grid
  const cellRenderer = ({ columnIndex, rowIndex, style }) => {
    const therapist = therapists[columnIndex];
    const timeSlot = timeSlots[rowIndex];

    // Find booking for this therapist and time slot
    const bookingKey = `${therapist.name}-${timeSlot}`;
    const booking = bookingMap.get(bookingKey);

    return (
      <div style={style} className={styles.gridCell}>
        {booking ? (
          <ReservationCard booking={booking} />
        ) : (
          <div className={styles.emptySlot}></div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.gridWrapper}>
      {/* Time Column - Fixed */}
      <div className={styles.timeColumn}>
        <div className={styles.timeHeader}></div>
        {timeSlots.map((time) => (
          <div key={time} className={styles.timeSlot}>
            {time}
          </div>
        ))}
      </div>

      {/* Therapist Headers */}
      <div className={styles.therapistHeaders}>
        {therapists.map((therapist) => (
          <div
            key={therapist.id}
            className={`${styles.therapistHeader} ${
              therapist.gender === 'female' ? styles.femaleTherapist : styles.maleTherapist
            }`}
          >
            {therapist.name}
          </div>
        ))}
      </div>

      {/* Virtual Grid for Calendar Body */}
      <Grid
        className={styles.virtualGrid}
        columnCount={therapists.length}
        columnWidth={120}
        height={600}
        rowCount={timeSlots.length}
        rowHeight={40}
        width={therapists.length * 120}
      >
        {cellRenderer}
      </Grid>
    </div>
  );
}

export default CalendarGrid;