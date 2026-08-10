import { useEffect, useState } from "react";
import {
  FiX,
  FiMail,
  FiPhone,
  FiHash,
  FiEdit2,
  FiSlash,
  FiCheckCircle,
  FiTrash2,
  FiUser,
  FiCalendar,
  FiActivity,
} from "react-icons/fi";

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const UserDetailsDrawer = ({
  user,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => cancelAnimationFrame(timer);
  }, []);

  if (!user) return null;

  const createdAt = formatDate(user.createdAt);

  const lastActiveValue =
    user.updatedAt && user.updatedAt !== user.createdAt
      ? formatDate(user.updatedAt)
      : "No activity";

  const isActive = user.status === "active";

  const role = user.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "User";

  const initials = user.name
    ? user.name
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">

      {/* =====================================================
          BACKDROP
      ====================================================== */}
      <div
        className={`
          absolute inset-0
          bg-slate-950/75
          backdrop-blur-[2px]
          transition-opacity duration-300 ease-out
          ${isVisible ? "opacity-100" : "opacity-0"}
        `}
        onClick={onClose}
      />

      {/* =====================================================
          DRAWER
      ====================================================== */}
      <section
        className={`
          relative z-10 flex h-full w-full max-w-3xl flex-col
          border-l border-white/[0.08]
          bg-[#080d1c]
          shadow-2xl shadow-black/50
          transform
          transition-transform duration-300 ease-out
          ${isVisible ? "translate-x-0" : "translate-x-full"}
        `}
      >

        {/* ===================================================
            HEADER
        ==================================================== */}
        <div
          className="
            sticky top-0 z-20
            border-b border-white/[0.08]
            bg-[#080d1c]/95
            px-5 py-5
            backdrop-blur-xl
            sm:px-7
          "
        >
          <div className="flex items-center justify-between gap-4">

            {/* Title */}
            <div className="min-w-0">

              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />

                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-orange-400">
                  User details
                </p>
              </div>

              <h2 className="mt-2 truncate text-2xl font-bold tracking-tight text-white">
                Account overview
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                View and manage user information
              </p>

            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-2">

              {/* Suspend / Activate */}
              <button
                type="button"
                onClick={() =>
                  onStatusChange(
                    user,
                    isActive ? "suspended" : "active"
                  )
                }
                className={`
                  hidden items-center gap-2
                  rounded-xl border
                  px-3.5 py-2.5
                  text-xs font-semibold
                  transition-all duration-200
                  sm:inline-flex
                  ${
                    isActive
                      ? "border-white/10 bg-slate-900 text-slate-200 hover:border-orange-400/30 hover:bg-orange-500/10 hover:text-orange-200"
                      : "border-emerald-400/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15"
                  }
                `}
              >
                {isActive ? (
                  <FiSlash className="h-3.5 w-3.5" />
                ) : (
                  <FiCheckCircle className="h-3.5 w-3.5" />
                )}

                {isActive ? "Suspend" : "Activate"}
              </button>

              {/* Edit */}
              <button
                type="button"
                onClick={() => onEdit(user)}
                className="
                  inline-flex items-center gap-2
                  rounded-xl
                  border border-white/10
                  bg-slate-900
                  px-3.5 py-2.5
                  text-xs font-semibold
                  text-slate-200
                  transition-all duration-200
                  hover:border-orange-400/30
                  hover:bg-orange-500/10
                  hover:text-orange-200
                "
              >
                <FiEdit2 className="h-3.5 w-3.5" />

                <span className="hidden sm:inline">
                  Edit
                </span>
              </button>

              {/* Delete */}
              <button
                type="button"
                onClick={() => onDelete(user)}
                className="
                  inline-flex items-center gap-2
                  rounded-xl
                  border border-rose-400/20
                  bg-rose-500/[0.07]
                  px-3.5 py-2.5
                  text-xs font-semibold
                  text-rose-300
                  transition-all duration-200
                  hover:border-rose-400/40
                  hover:bg-rose-500/15
                "
              >
                <FiTrash2 className="h-3.5 w-3.5" />

                <span className="hidden sm:inline">
                  Delete
                </span>
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close user details"
                className="
                  ml-1
                  inline-flex h-10 w-10
                  items-center justify-center
                  rounded-xl
                  border border-white/10
                  bg-slate-900
                  text-slate-400
                  transition-all duration-200
                  hover:border-white/20
                  hover:bg-slate-800
                  hover:text-white
                "
              >
                <FiX className="h-4 w-4" />
              </button>

            </div>
          </div>
        </div>

        {/* ===================================================
            CONTENT
        ==================================================== */}
        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7 sm:py-7">

          {/* =================================================
              USER PROFILE HERO
          ================================================== */}
          <div
            className="
              relative overflow-hidden
              rounded-[28px]
              border border-white/[0.08]
              bg-gradient-to-br
              from-slate-900
              via-slate-900
              to-slate-950
              p-6
              shadow-xl shadow-black/20
            "
          >

            {/* Decorative glow */}
            <div
              className="
                pointer-events-none
                absolute -right-20 -top-20
                h-48 w-48
                rounded-full
                bg-orange-500/[0.07]
                blur-3xl
              "
            />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              {/* User */}
              <div className="flex min-w-0 items-center gap-4">

                {/* Avatar */}
                <div
                  className="
                    flex h-[68px] w-[68px]
                    shrink-0
                    items-center justify-center
                    rounded-[22px]
                    border border-orange-400/20
                    bg-orange-500/[0.09]
                    text-xl font-bold
                    text-orange-300
                    shadow-lg shadow-orange-950/20
                  "
                >
                  {initials}
                </div>

                {/* Details */}
                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-2">

                    <h3 className="truncate text-xl font-bold text-white">
                      {user.name || "Unnamed user"}
                    </h3>

                    {/* Status */}
                    <span
                      className={`
                        inline-flex items-center gap-1.5
                        rounded-full
                        border
                        px-2.5 py-1
                        text-[10px]
                        font-bold uppercase tracking-wide
                        ${
                          isActive
                            ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                            : "border-amber-400/20 bg-amber-500/10 text-amber-300"
                        }
                      `}
                    >
                      <span
                        className={`
                          h-1.5 w-1.5 rounded-full
                          ${
                            isActive
                              ? "bg-emerald-400"
                              : "bg-amber-400"
                          }
                        `}
                      />

                      {user.status || "Unknown"}
                    </span>

                  </div>

                  <p className="mt-1 text-sm text-slate-400">
                    {role}
                  </p>

                  <p
                    title={user._id}
                    className="
                      mt-2 max-w-[360px]
                      cursor-default truncate
                      text-[11px] font-medium
                      tracking-wide text-slate-600
                    "
                  >
                    ID · {user._id}
                  </p>

                </div>
              </div>

            </div>
          </div>

          {/* =================================================
              CONTACT INFORMATION
          ================================================== */}
          <div
            className="
              mt-5
              rounded-[26px]
              border border-white/[0.08]
              bg-slate-900/60
              p-5
            "
          >

            {/* Section heading */}
            <div className="flex items-center gap-3">

              <div
                className="
                  flex h-9 w-9
                  items-center justify-center
                  rounded-xl
                  bg-orange-500/10
                "
              >
                <FiUser className="h-4 w-4 text-orange-300" />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
                  Profile
                </p>

                <p className="mt-0.5 text-sm font-semibold text-white">
                  Contact information
                </p>
              </div>

            </div>

            {/* Contact items */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">

              {/* Email */}
              <div
                className="
                  rounded-2xl
                  border border-white/[0.07]
                  bg-slate-950/70
                  p-4
                  transition-all duration-200
                  hover:border-orange-400/20
                  hover:bg-slate-950
                "
              >
                <p className="text-[11px] font-medium text-slate-500">
                  Email address
                </p>

                <div className="mt-2 flex items-center gap-2.5">

                  <FiMail className="h-4 w-4 shrink-0 text-slate-500" />

                  <span
                    title={user.email || "N/A"}
                    className="
                      min-w-0 cursor-default
                      truncate
                      text-sm font-semibold
                      text-slate-200
                    "
                  >
                    {user.email || "N/A"}
                  </span>

                </div>
              </div>

              {/* Phone */}
              <div
                className="
                  rounded-2xl
                  border border-white/[0.07]
                  bg-slate-950/70
                  p-4
                  transition-all duration-200
                  hover:border-orange-400/20
                  hover:bg-slate-950
                "
              >
                <p className="text-[11px] font-medium text-slate-500">
                  Phone number
                </p>

                <div className="mt-2 flex items-center gap-2.5">

                  <FiPhone className="h-4 w-4 shrink-0 text-slate-500" />

                  <span
                    title={user.phone || "N/A"}
                    className="
                      cursor-default
                      text-sm font-semibold
                      text-slate-200
                    "
                  >
                    {user.phone || "N/A"}
                  </span>

                </div>
              </div>

            </div>
          </div>

          {/* =================================================
              ACCOUNT + ACTIVITY
          ================================================== */}
          <div className="mt-5 grid gap-5 lg:grid-cols-2">

            {/* =================================================
                ACCOUNT
            ================================================== */}
            <div
              className="
                rounded-[26px]
                border border-white/[0.08]
                bg-slate-900/60
                p-5
              "
            >

              <div className="flex items-center gap-3">

                <div
                  className="
                    flex h-9 w-9
                    items-center justify-center
                    rounded-xl
                    bg-blue-500/10
                  "
                >
                  <FiHash className="h-4 w-4 text-blue-300" />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
                    Account
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-white">
                    Account information
                  </p>
                </div>

              </div>

              <div className="mt-5 space-y-0">

                {/* User ID */}
                <div
                  className="
                    flex items-center justify-between
                    gap-4
                    border-b border-white/[0.06]
                    py-3
                  "
                >
                  <span className="shrink-0 text-xs text-slate-500">
                    User ID
                  </span>

                  <span
                    title={user._id}
                    className="
                      max-w-[210px]
                      cursor-default truncate
                      text-right
                      text-xs font-semibold
                      text-slate-200
                    "
                  >
                    {user._id}
                  </span>
                </div>

                {/* Email */}
                <div
                  className="
                    flex items-center justify-between
                    gap-4
                    border-b border-white/[0.06]
                    py-3
                  "
                >
                  <span className="shrink-0 text-xs text-slate-500">
                    Email
                  </span>

                  <span
                    title={user.email || "N/A"}
                    className="
                      max-w-[210px]
                      cursor-default truncate
                      text-right
                      text-xs font-semibold
                      text-slate-200
                    "
                  >
                    {user.email || "N/A"}
                  </span>
                </div>

                {/* Phone */}
                <div
                  className="
                    flex items-center justify-between
                    gap-4
                    border-b border-white/[0.06]
                    py-3
                  "
                >
                  <span className="shrink-0 text-xs text-slate-500">
                    Phone
                  </span>

                  <span
                    title={user.phone || "N/A"}
                    className="
                      cursor-default
                      text-right
                      text-xs font-semibold
                      text-slate-200
                    "
                  >
                    {user.phone || "N/A"}
                  </span>
                </div>

                {/* Role */}
                <div
                  className="
                    flex items-center justify-between
                    gap-4 py-3
                  "
                >
                  <span className="text-xs text-slate-500">
                    Role
                  </span>

                  <span
                    className="
                      rounded-lg
                      border border-white/10
                      bg-slate-950
                      px-2.5 py-1
                      text-[10px]
                      font-bold uppercase tracking-wide
                      text-slate-300
                    "
                  >
                    {role}
                  </span>
                </div>

              </div>
            </div>

            {/* =================================================
                ACTIVITY
            ================================================== */}
            <div
              className="
                rounded-[26px]
                border border-white/[0.08]
                bg-slate-900/60
                p-5
              "
            >

              <div className="flex items-center gap-3">

                <div
                  className="
                    flex h-9 w-9
                    items-center justify-center
                    rounded-xl
                    bg-emerald-500/10
                  "
                >
                  <FiActivity className="h-4 w-4 text-emerald-300" />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
                    Activity
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-white">
                    Account timeline
                  </p>
                </div>

              </div>

              {/* Timeline */}
              <div className="relative mt-6 space-y-6">

                {/* Timeline line */}
                <div
                  className="
                    absolute left-[18px]
                    top-8 bottom-8
                    w-px bg-white/[0.07]
                  "
                />

                {/* Joined */}
                <div className="relative flex items-center gap-3">

                  <div
                    className="
                      relative z-10
                      flex h-9 w-9
                      shrink-0
                      items-center justify-center
                      rounded-xl
                      border border-white/[0.07]
                      bg-slate-950
                    "
                  >
                    <FiCalendar className="h-4 w-4 text-slate-500" />
                  </div>

                  <div className="flex-1">

                    <p className="text-[11px] text-slate-500">
                      Joined
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      {createdAt}
                    </p>

                  </div>

                </div>

                {/* Last Active */}
                <div className="relative flex items-center gap-3">

                  <div
                    className="
                      relative z-10
                      flex h-9 w-9
                      shrink-0
                      items-center justify-center
                      rounded-xl
                      border border-white/[0.07]
                      bg-slate-950
                    "
                  >
                    <FiActivity className="h-4 w-4 text-emerald-400" />
                  </div>

                  <div className="flex-1">

                    <p className="text-[11px] text-slate-500">
                      Last active
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      {lastActiveValue}
                    </p>

                  </div>

                </div>

              </div>
            </div>
          </div>

          {/* =================================================
              MOBILE STATUS BUTTON
          ================================================== */}
          <div className="mt-5 sm:hidden">

            <button
              type="button"
              onClick={() =>
                onStatusChange(
                  user,
                  isActive ? "suspended" : "active"
                )
              }
              className={`
                flex w-full
                items-center justify-center
                gap-2
                rounded-2xl
                border
                px-4 py-3
                text-sm font-semibold
                transition
                ${
                  isActive
                    ? "border-white/10 bg-slate-900 text-slate-200 hover:bg-slate-800"
                    : "border-emerald-400/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15"
                }
              `}
            >
              {isActive ? (
                <FiSlash className="h-4 w-4" />
              ) : (
                <FiCheckCircle className="h-4 w-4" />
              )}

              {isActive ? "Suspend User" : "Activate User"}
            </button>

          </div>

        </div>
      </section>
    </div>
  );
};

export default UserDetailsDrawer;