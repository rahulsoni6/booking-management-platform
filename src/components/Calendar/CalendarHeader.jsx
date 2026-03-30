import styles from "./calendar.module.scss";

function CalendarHeader() {
  return (
    <div className={styles.header}>
      <h2>Therapist Schedule</h2>
    </div>
  );
}

export default CalendarHeader;