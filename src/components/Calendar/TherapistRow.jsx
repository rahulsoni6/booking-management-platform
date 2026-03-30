import styles from "./calendar.module.scss";

function TherapistRow({ therapist }) {
  return (
    <div className={styles.therapistColumn}>
      <div className={styles.therapistHeader}>
        {therapist.name}
      </div>
    </div>
  );
}

export default TherapistRow;