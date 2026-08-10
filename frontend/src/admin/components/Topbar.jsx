import { FiBell, FiChevronDown, FiMenu, FiSearch } from "react-icons/fi";

const Topbar = ({ onMenuClick }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 px-4 py-4 backdrop-blur-xl lg:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="rounded-full border border-white/10 p-2 text-slate-300 lg:hidden">
            <FiMenu />
          </button>
          <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-3 py-2 md:flex md:items-center md:gap-2">
            <FiSearch className="text-slate-400" />
            <input
              type="text"
              placeholder="Search admin"
              className="w-40 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative rounded-full border border-white/10 p-2 text-slate-300">
            <FiBell />
            <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-orange-500" />
          </button>

          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-400 font-semibold text-white">
              A
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-white">Admin</p>
              <p className="text-xs text-slate-400">Super admin</p>
            </div>
            <FiChevronDown className="text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
