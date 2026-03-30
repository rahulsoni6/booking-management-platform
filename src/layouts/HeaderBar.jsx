export default function HeaderBar() {
  return (
    <div className="bg-gray-100 px-6 py-4 flex items-center justify-between">

      {/* Left */}
      <div>
        <div className="font-semibold">
          List Towers
        </div>

        <div className="text-sm text-gray-500">
          Display: 15 Min
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">

        <input
          type="text"
          placeholder="Search Sales by phone/name"
          className="border px-3 py-2 rounded w-64"
        />

        <button className="border px-4 py-2 rounded">
          Filter
        </button>

        <button className="border px-4 py-2 rounded">
          Today
        </button>

        <button className="border px-4 py-2 rounded">
          Sat, Aug 16
        </button>

      </div>
    </div>
  );
}