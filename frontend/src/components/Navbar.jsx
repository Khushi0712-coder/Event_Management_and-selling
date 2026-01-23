import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import MobileMenu from "./MobileMenu";

const Navbar = () => {
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 80) {
        setShow(false);
      } else {
        setShow(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const linkClass = ({ isActive }) =>
    isActive ? "text-orange-500" : "hover:text-orange-400";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 bg-black/70 backdrop-blur-md px-10 py-4 flex justify-between items-center transition-transform duration-300 ${
          show ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <h1 className="text-xl font-bold text-orange-500">EVENTIFY</h1>

        <ul className="hidden md:flex items-center gap-8 text-sm">
          <NavLink to="/" className={linkClass}>
            Home
          </NavLink>

          <NavLink to="/events" className={linkClass}>
            Events
          </NavLink>

          {/* ❌ HIDE FROM ADMIN */}
          {!isAdmin && (
            <>
              <NavLink to="/contact" className={linkClass}>
                Contact
              </NavLink>

              <NavLink to="/sell-ticket" className={linkClass}>
                Sell Your Tickets
              </NavLink>
            </>
          )}

          {/* ✅ ADMIN ONLY */}
          {isAdmin && (
            <NavLink to="/admin" className={linkClass}>
              Admin Dashboard
            </NavLink>
          )}

          {/* AUTH */}
          {!isLoggedIn ? (
            <>
              <NavLink
                to="/login"
                className="border border-orange-500 text-orange-500 px-4 py-1 rounded"
              >
                Login
              </NavLink>

              <NavLink
                to="/signup"
                className="bg-orange-500 text-black px-4 py-1 rounded"
              >
                Sign Up
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/profile"
                className="bg-orange-500 text-black px-4 py-1 rounded"
              >
                Profile
              </NavLink>

              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                }}
                className="border border-red-500 text-red-500 px-4 py-1 rounded"
              >
                Logout
              </button>
            </>
          )}
        </ul>

        <button
          onClick={() => setMenuOpen(true)}
          className="text-2xl md:hidden"
        >
          ☰
        </button>
      </nav>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
};

export default Navbar;
