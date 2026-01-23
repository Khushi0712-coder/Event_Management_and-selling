import { NavLink } from "react-router-dom";

const MobileMenu = ({ open, onClose }) => {
  const token = localStorage.getItem("token");

  let role = null;
  if (token) {
    try {
      role = JSON.parse(atob(token.split(".")[1])).role;
    } catch {
      role = null;
    }
  }

  const isLoggedIn = !!token;
  const isAdmin = role === "admin";

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-transform duration-300 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="absolute right-0 top-0 w-72 h-full bg-zinc-900 p-6 flex flex-col gap-6">
        {/* Close */}
        <button onClick={onClose} className="self-end text-xl text-gray-400">
          ✕
        </button>

        {/* Menu */}
        <NavLink to="/" onClick={onClose}>
          Home
        </NavLink>

        <NavLink to="/events" onClick={onClose}>
          Events
        </NavLink>

        {/* ❌ HIDE FROM ADMIN */}
        {!isAdmin && (
          <>
            <NavLink to="/contact" onClick={onClose}>
              Contact
            </NavLink>

            <NavLink to="/sell-ticket" onClick={onClose}>
              Sell Your Tickets
            </NavLink>
          </>
        )}

        {/* ✅ ADMIN ONLY */}
        {isAdmin && (
          <NavLink to="/admin" onClick={onClose}>
            Admin Dashboard
          </NavLink>
        )}

        {/* AUTH */}
        {!isLoggedIn ? (
          <>
            <NavLink to="/login" onClick={onClose}>
              Login
            </NavLink>

            <NavLink to="/signup" onClick={onClose}>
              Signup
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/profile"
              onClick={onClose}
              className="bg-orange-500 text-black text-center py-2 rounded"
            >
              Profile
            </NavLink>

            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
              className="border border-red-500 text-red-500 py-2 rounded"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
