export default function TimeColumn({ timeSlots = [] }) {
  return (
    <div className="w-24 border-r bg-gray-50">
      {timeSlots.map((time) => (
        <div
          key={time}
          className="
            h-20
            border-b
            flex
            items-start
            justify-center
            text-xs
            text-gray-500
            pt-1
          "
        >
          {time}
        </div>
      ))}
    </div>
  );
}