export const generateTimeSlots = () => {
  const slots = [];

  let startHour = 9;
  let endHour = 21;

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const h = String(hour).padStart(2, "0");
      const m = String(minute).padStart(2, "0");

      slots.push(`${h}:${m}`);
    }
  }

  return slots;
};