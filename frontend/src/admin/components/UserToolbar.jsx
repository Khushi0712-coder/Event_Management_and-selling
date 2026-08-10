import { FiRefreshCcw, FiSearch, FiRotateCcw } from "react-icons/fi";

const UserToolbar = ({
  search,
  onSearch,
  roleFilter,
  onRoleFilter,
  statusFilter,
  onStatusFilter,
  roles,
  sortBy,
  onSortBy,
  onReset,
  onRefresh,
}) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-3 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end">

        {/* Search */}
        <div className="w-full xl:flex-1">
          <label className="mb-2 block px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Search Users
          </label>

          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Name, email or user ID"
              className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/80 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/15 focus:border-orange-400/60 focus:bg-slate-950 focus:ring-2 focus:ring-orange-400/10"
            />
          </div>
        </div>

        {/* Role */}
        <div className="w-full xl:w-[170px]">
          <label className="mb-2 block px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Role
          </label>

          <select
            value={roleFilter}
            onChange={(e) => onRoleFilter(e.target.value)}
            className="h-12 w-full cursor-pointer rounded-2xl border border-white/10 bg-slate-950/80 px-4 text-sm font-medium text-white outline-none transition hover:border-white/15 focus:border-orange-400/60 focus:ring-2 focus:ring-orange-400/10"
          >
            <option value="All">All roles</option>

            {roles.map((role) => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="w-full xl:w-[170px]">
          <label className="mb-2 block px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Status
          </label>

          <select
            value={statusFilter}
            onChange={(e) => onStatusFilter(e.target.value)}
            className="h-12 w-full cursor-pointer rounded-2xl border border-white/10 bg-slate-950/80 px-4 text-sm font-medium text-white outline-none transition hover:border-white/15 focus:border-orange-400/60 focus:ring-2 focus:ring-orange-400/10"
          >
            <option value="All">All status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        {/* Sort */}
        <div className="w-full xl:w-[170px]">
          <label className="mb-2 block px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Sort By
          </label>

          <select
            value={sortBy}
            onChange={(e) => onSortBy(e.target.value)}
            className="h-12 w-full cursor-pointer rounded-2xl border border-white/10 bg-slate-950/80 px-4 text-sm font-medium text-white outline-none transition hover:border-white/15 focus:border-orange-400/60 focus:ring-2 focus:ring-orange-400/10"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="nameAsc">Name A-Z</option>
            <option value="nameDesc">Name Z-A</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex w-full gap-2 xl:w-auto">
          {/* Reset */}
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm font-semibold text-slate-300 transition hover:border-orange-400/30 hover:bg-slate-900 hover:text-white xl:flex-none"
          >
            <FiRotateCcw className="h-4 w-4" />
            Reset
          </button>

          {/* Refresh */}
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-orange-400/20 bg-orange-500/10 px-4 text-sm font-semibold text-orange-300 transition hover:border-orange-400/40 hover:bg-orange-500/15 xl:flex-none"
          >
            <FiRefreshCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserToolbar;