const menuItems = [
  "Home",
  "Therapists",
  "Sales",
  "Clients",
  "Transactions",
  "Reports",
];

export default function NavigationBar() {
  return (
    <nav className="bg-[#4b2e1e] text-white px-6 py-3 flex items-center justify-between">
      
      {/* Logo */}
      <div className="text-lg font-bold">
        Logo
      </div>

      {/* Menu */}
      <div className="flex gap-6 text-sm">
        {menuItems.map((item) => (
          <button
            key={item}
            className="hover:text-yellow-400 transition"
          >
            {item}
          </button>
        ))}
      </div>

      {/* Icons */}
      <div className="flex items-center gap-4">
        <span>🔔</span>
        <span>👤</span>
      </div>

    </nav>
  );
}