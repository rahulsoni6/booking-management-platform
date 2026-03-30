export default function TherapistHeader({ therapists = [] }) {
  return (
    <div className="flex border-b bg-white">
      <div className="w-24" />

      {therapists.map((therapist) => (
        <div
          key={therapist.id || therapist.name}
          className="
            flex-1
            border-l
            p-2
            text-center
          "
        >
          <div className="w-8 h-8 bg-pink-500 text-white rounded-full mx-auto flex items-center justify-center text-xs">
            {therapist.name?.[0] || "?"}
          </div>

          <div className="text-xs mt-1">{therapist.name}</div>
        </div>
      ))}
    </div>
  );
}