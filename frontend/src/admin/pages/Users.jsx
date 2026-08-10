import { useEffect, useMemo, useState } from "react";
import {
  FiDownload,
  FiMail,
  FiMoreVertical,
  FiPhone,
  FiPlus,
  FiRefreshCcw,
  FiSearch,
  FiUsers,
  FiX
} from "react-icons/fi";
import api from "../../services/api";
import UserBadge from "../components/UserBadge";
import UserDetailsDrawer from "../components/UserDetailsDrawer";
import UserStats from "../components/UserStats";
import UserToolbar from "../components/UserToolbar";

const getStatusBadge = (status) => {
  const normalized = (status || "active").toLowerCase();
  if (normalized === "active") return { label: "Active", variant: "active" };
  if (normalized === "pending") return { label: "Pending", variant: "pending" };
  if (normalized === "suspended" || normalized === "blocked") return { label: "Suspended", variant: "suspended" };
  return { label: status || "Unknown", variant: "default" };
};

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getInitials = (name = "User") => {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
};

const getRoleLabel = (role) => {
  if (!role) return "User";
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const getUserId = (user) => user._id || "N/A";

const UserRow = ({ user, onSelect, selected, onView }) => {
  const status = getStatusBadge(user.status || "active");
  const roleLabel = getRoleLabel(user.role);

  return (
    <tr
      className={`
        group border-b border-white/[0.06] transition-all duration-200
        ${selected ? "bg-orange-500/[0.06]" : "hover:bg-white/[0.025]"}
      `}
    >
      {/* Checkbox */}
      <td className="w-14 px-5 py-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(user._id, e.target.checked)}
          className="h-4 w-4 cursor-pointer rounded-md border-white/20 bg-slate-900 text-orange-500 focus:ring-2 focus:ring-orange-400/20"
        />
      </td>

      {/* User */}
      <td className="w-[20%] px-5 py-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {user.name || "Unknown user"}
          </p>

          {/* Short ID + full ID on hover */}
          <p
            title={`USR-${getUserId(user)}`}
            className="
              mt-0.5 max-w-[150px]
              cursor-default truncate
              text-[11px] font-medium
              tracking-wide text-slate-500
            "
          >
            USR-{getUserId(user).slice(-15)}
          </p>
        </div>
      </td>

      {/* Email */}
       <td className="w-[22%] px-5 py-4">
        <span
          title={user.email || "N/A"}
          className="
            block max-w-full
            cursor-default truncate
            text-sm text-slate-300
          "
        >
          {user.email || "N/A"}
        </span>
      </td>

      {/* Phone */}
    <td className="w-[10%] px-5 py-4">
        <span
          title={user.phone || "N/A"}
          className="
            block max-w-full
            cursor-default truncate
            text-sm text-slate-400
          "
        >
          {user.phone || "N/A"}
        </span>
      </td>

      {/* Role */}
      <td className="px-5 py-4">
        <UserBadge
          label={roleLabel}
          variant={
            user.role === "admin"
              ? "admin"
              : user.role === "manager"
              ? "manager"
              : "user"
          }
        />
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <UserBadge
          label={status.label}
          variant={status.variant}
        />
      </td>

      {/* Joined */}
      <td className="whitespace-nowrap px-5 py-4">
        <span className="text-sm font-medium text-slate-300">
          {formatDate(user.createdAt)}
        </span>
      </td>

      {/* Last Active */}
      <td className="whitespace-nowrap px-5 py-4">
        <span className="text-sm font-medium text-slate-300">
          {formatDate(user.updatedAt)}
        </span>
      </td>

      {/* Actions */}
      <td className="px-5 py-4 text-right">
        <button
          type="button"
          onClick={() => onView(user)}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/80 px-3.5 py-2 text-xs font-semibold text-white transition-all duration-200 hover:border-orange-400/30 hover:bg-orange-500/10 hover:text-orange-200 active:scale-95"
        >
          <FiMoreVertical className="h-3.5 w-3.5 text-orange-300" />
          View
        </button>
      </td>
    </tr>
  );
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedIds, setSelectedIds] = useState([]);
  const [detailsUser, setDetailsUser] = useState(null);
  const [stats, setStats] = useState({ totalUsers: 0, adminUsers: 0, regularUsers: 0, otherRoles: 0 });
  const [toast, setToast] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "user", status: "active", password: "" });
  const [modalError, setModalError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 2600);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/api/admin/users");
      const normalized = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setUsers(normalized);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load users. Please try again.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const totals = users.reduce(
      (acc, user) => {
        acc.totalUsers += 1;
        if (user.role === "admin") acc.adminUsers += 1;
        else if (!user.role || user.role === "user") acc.regularUsers += 1;
        else acc.otherRoles += 1;
        return acc;
      },
      { totalUsers: 0, adminUsers: 0, regularUsers: 0, otherRoles: 0 },
    );
    setStats(totals);
  }, [users]);

  useEffect(() => {
    document.body.style.overflow = showUserModal || !!detailsUser || !!confirmDelete ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showUserModal, detailsUser, confirmDelete]);

  const availableRoles = useMemo(() => {
    const unique = Array.from(new Set(users.map((user) => user.role || "user")));
    return unique.filter((role) => role !== "user").sort();
  }, [users]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users
      .filter((user) => {
        const matchesSearch = !term || [user.name, user.email, user.phone, user._id].some((value) =>
          String(value || "").toLowerCase().includes(term),
        );
        const matchesRole = roleFilter === "All" || (user.role || "user") === roleFilter;
        const matchesStatus = statusFilter === "All" || (user.status || "active") === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortBy === "nameAsc") return (a.name || "").localeCompare(b.name || "");
        if (sortBy === "nameDesc") return (b.name || "").localeCompare(a.name || "");
        return 0;
      });
  }, [users, search, roleFilter, statusFilter, sortBy]);

  const toggleSelect = (id, checked) => {
    setSelectedIds((prev) => {
      if (checked) return [...new Set([...prev, id])];
      return prev.filter((item) => item !== id);
    });
  };

  const selectAll = (checked) => {
    setSelectedIds(checked ? filteredUsers.map((user) => user._id) : []);
  };

  const resetFilters = () => {
    setSearch("");
    setRoleFilter("All");
    setStatusFilter("All");
    setSortBy("newest");
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setForm({ name: "", email: "", phone: "", role: "user", status: "active", password: "" });
    setModalError("");
    setShowUserModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "user",
      status: user.status || "active",
      password: "",
    });
    setModalError("");
    setShowUserModal(true);
  };

  const closeModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
    setModalError("");
    setForm({ name: "", email: "", phone: "", role: "user", status: "active", password: "" });
  };

  const submitUserForm = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setModalError("");

    if (!form.name || !form.email || (!editingUser && !form.password)) {
      setModalError("Name, email and password are required for new users.");
      setSubmitting(false);
      return;
    }

    try {
      if (editingUser) {
        const response = await api.put(`/api/admin/users/${editingUser._id}`, {
          name: form.name,
          email: form.email,
          phone: form.phone,
          role: form.role,
          status: form.status,
        });
        const updatedUser = response.data;
        setUsers((current) => current.map((user) => (user._id === updatedUser._id ? updatedUser : user)));
        if (detailsUser?._id === updatedUser._id) setDetailsUser(updatedUser);
        showToast("success", "User updated successfully.");
      } else {
        const response = await api.post("/api/admin/users", {
          name: form.name,
          email: form.email,
          phone: form.phone,
          role: form.role,
          status: form.status,
          password: form.password,
        });
        const createdUser = response.data;
        setUsers((current) => [createdUser, ...current]);
        showToast("success", "User created successfully.");
      }
      closeModal();
    } catch (err) {
      setModalError(err?.response?.data?.message || "Unable to save user. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (user, status) => {
    setActionLoading(true);
    try {
      const response = await api.put(`/api/admin/users/${user._id}/status`, { status });
      const updatedUser = response.data;
      setUsers((current) => current.map((item) => (item._id === updatedUser._id ? updatedUser : item)));
      if (detailsUser?._id === updatedUser._id) setDetailsUser(updatedUser);
      showToast("success", `User status updated to ${status}.`);
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Unable to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRequest = (user) => {
    setConfirmDelete({ ids: [user._id], title: "Delete user", description: `Delete ${user.name || "this user"} permanently?` });
  };

  const handleBulkDeleteRequest = () => {
    setConfirmDelete({ ids: selectedIds, title: "Delete selected users", description: `Delete ${selectedIds.length} selected user${selectedIds.length === 1 ? "" : "s"}?` });
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDelete) return;
    setActionLoading(true);
    try {
      await Promise.all(confirmDelete.ids.map((id) => api.delete(`/api/admin/users/${id}`)));
      setUsers((current) => current.filter((user) => !confirmDelete.ids.includes(user._id)));
      setSelectedIds((current) => current.filter((id) => !confirmDelete.ids.includes(id)));
      if (detailsUser && confirmDelete.ids.includes(detailsUser._id)) setDetailsUser(null);
      showToast("success", `Deleted ${confirmDelete.ids.length} user${confirmDelete.ids.length === 1 ? "" : "s"}.`);
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Unable to delete selected users.");
    } finally {
      setConfirmDelete(null);
      setActionLoading(false);
    }
  };

  const handleBulkStatusChange = async (status) => {
    if (!selectedIds.length) return;
    setActionLoading(true);
    try {
      await Promise.all(selectedIds.map((id) => api.put(`/api/admin/users/${id}/status`, { status })));
      setUsers((current) => current.map((user) => (selectedIds.includes(user._id) ? { ...user, status } : user)));
      if (detailsUser && selectedIds.includes(detailsUser._id)) setDetailsUser({ ...detailsUser, status });
      showToast("success", `${selectedIds.length} user${selectedIds.length === 1 ? "" : "s"} marked ${status}.`);
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Unable to update selected users.");
    } finally {
      setActionLoading(false);
    }
  };

  const exportCsv = () => {
    const headers = ["User ID", "Name", "Email", "Phone", "Role", "Status", "Joined", "Last Active"];
    const rows = filteredUsers.map((user) => [
      getUserId(user),
      user.name || "N/A",
      user.email || "N/A",
      user.phone || "N/A",
      getRoleLabel(user.role),
      getStatusBadge(user.status).label,
      formatDate(user.createdAt),
      formatDate(user.updatedAt),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "users-export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-10">
      {toast && (
        <div
          className={`fixed right-4 top-4 z-50 rounded-2xl border px-4 py-3 text-sm shadow-2xl shadow-black/30 ${
            toast.type === "success"
              ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
              : "border-rose-400/20 bg-rose-500/10 text-rose-100"
          }`}
        >
          {toast.message}
        </div>
      )}

      <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-orange-400">User management</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Users</h1>
            <p className="mt-4 text-sm leading-7 text-slate-400">Manage accounts, roles, permissions, and user activity from one place.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-orange-500/95 px-5 py-3 text-sm font-semibold text-black transition hover:bg-orange-600"
            >
              <FiPlus className="h-4 w-4" />
              Add User
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/80 px-5 py-3 text-sm font-semibold text-white transition hover:border-orange-400/40 hover:bg-slate-900"
            >
              <FiDownload className="h-4 w-4 text-orange-300" />
              Export
            </button>
          </div>
        </div>
      </section>

      <UserStats totals={stats} />

      <UserToolbar
  search={search}
  onSearch={setSearch}
  roleFilter={roleFilter}
  onRoleFilter={setRoleFilter}
  statusFilter={statusFilter}
  onStatusFilter={setStatusFilter}
  roles={availableRoles}
  sortBy={sortBy}
  onSortBy={setSortBy}
  onReset={resetFilters}
  onRefresh={loadUsers}
/>

      <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-2xl shadow-black/20">
        {selectedIds.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-orange-400/10 bg-orange-500/10 px-4 py-3 text-sm text-orange-100">
            <span>{selectedIds.length} user{selectedIds.length === 1 ? "" : "s"} selected</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleBulkStatusChange("active")}
                disabled={actionLoading}
                className="rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm font-semibold text-white transition hover:border-orange-400/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Activate
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatusChange("suspended")}
                disabled={actionLoading}
                className="rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm font-semibold text-white transition hover:border-orange-400/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Suspend
              </button>
              <button
                type="button"
                onClick={handleBulkDeleteRequest}
                disabled={actionLoading}
                className="rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm font-semibold text-white transition hover:border-orange-400/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {error ? (
          <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6 text-sm text-rose-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-semibold text-white">Unable to load users</p>
                <p className="mt-2 text-sm text-rose-200">{error}</p>
              </div>
              <button
                type="button"
                onClick={loadUsers}
                className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm font-semibold text-white transition hover:border-orange-400/40 hover:bg-slate-900"
              >
                Retry
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="space-y-4">
            <div className="h-16 rounded-3xl bg-slate-950/70" />
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                <div className="h-4 w-1/3 rounded-full bg-slate-800" />
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="h-3 rounded-full bg-slate-800" />
                  <div className="h-3 rounded-full bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/70 p-10 text-center text-slate-400">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-900 text-orange-300">
              <FiUsers className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-semibold text-white">No users found</h2>
            <p className="mt-2 max-w-md mx-auto text-sm text-slate-500">Users matching your current filters will appear here.</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 rounded-2xl border border-white/10 bg-slate-950/80 px-5 py-3 text-sm font-semibold text-white transition hover:border-orange-400/40 hover:bg-slate-900"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="w-full overflow-hidden">
  <table className="w-full table-fixed border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-slate-950/40">
                  <th className="w-12 px-5 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={(e) => selectAll(e.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-slate-900 text-orange-400 focus:ring-orange-400"
                    />
                  </th>
                 <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
  User
</th>

<th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
  Email
</th>

<th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
  Phone
</th>

<th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
  Role
</th>

<th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
  Status
</th>

<th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
  Joined
</th>

<th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
  Last Active
</th>

<th className="px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
  Actions
</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <UserRow
                    key={user._id}
                    user={user}
                    selected={selectedIds.includes(user._id)}
                    onSelect={toggleSelect}
                    onView={setDetailsUser}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {detailsUser && (
        <UserDetailsDrawer
          user={detailsUser}
          onClose={() => setDetailsUser(null)}
          onEdit={openEditModal}
          onDelete={handleDeleteRequest}
          onStatusChange={handleStatusChange}
        />
      )}

      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 px-4 py-6 sm:items-center sm:px-6">
          <div className="absolute inset-0" onClick={closeModal} />
          <section className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/40">
            <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-400">{editingUser ? "Edit user" : "Add user"}</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{editingUser ? "Update account details" : "Create a new user"}</h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/90 text-slate-300 transition hover:bg-slate-800"
                aria-label="Close modal"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitUserForm} className="space-y-6 px-6 py-6 sm:px-8">
              {modalError && (
                <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {modalError}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-300">Full name</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Jane Doe"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-300">Email address</span>
                  <input
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    type="email"
                    placeholder="jane@domain.com"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-300">Phone</span>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    type="tel"
                    placeholder="+123 456 7890"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-300">Role</span>
                  <select
                    value={form.role}
                    onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-300">Status</span>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </label>
                {!editingUser && (
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-300">Password</span>
                    <input
                      value={form.password}
                      onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                      type="password"
                      placeholder="Choose a secure password"
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
                    />
                  </label>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm font-semibold text-white transition hover:border-orange-400/40 hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-orange-600 disabled:opacity-60"
                >
                  {submitting ? "Saving..." : editingUser ? "Update user" : "Create user"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 px-4 py-6">
          <div className="absolute inset-0" onClick={() => setConfirmDelete(null)} />
          <section className="relative z-10 w-full max-w-lg overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/95 p-6 shadow-2xl shadow-black/40">
            <h3 className="text-xl font-semibold text-white">{confirmDelete.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">{confirmDelete.description}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm font-semibold text-white transition hover:border-orange-400/40 hover:bg-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                disabled={actionLoading}
                className="inline-flex items-center justify-center rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Users;
