import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import styles from "./calendar.module.scss";

function CalendarLayout() {
  return (
    <div className={styles.calendarContainer}>
      <CalendarHeader />

      <div className={styles.calendarBody}>
        <CalendarGrid />
      </div>
    </div>
  );
}

export default CalendarLayout;