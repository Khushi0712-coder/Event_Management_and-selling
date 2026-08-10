import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiCheckCircle,
  FiClock,
  FiEye,
  FiInbox,
  FiMapPin,
  FiRefreshCcw,
  FiSearch,
  FiTag,
  FiTrash2,
  FiUser,
  FiXCircle,
} from "react-icons/fi";
import StatusDropdown from "../components/StatusDropdown";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const statusStyles = {
  Pending: "border border-amber-400/20 bg-amber-500/10 text-amber-300",
  Confirmed: "border border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
  Cancelled: "border border-rose-400/20 bg-rose-500/10 text-rose-300",
};

const paymentStyles = {
  Paid: "border border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
  Unpaid: "border border-amber-400/20 bg-amber-500/10 text-amber-300",
  Refunded: "border border-sky-400/20 bg-sky-500/10 text-sky-300",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getCustomerName = (booking) =>
  booking?.user?.name || booking?.customerName || booking?.name || "Unknown customer";

const getCustomerEmail = (booking) =>
  booking?.user?.email || booking?.email || booking?.userEmail || "—";

const getEventName = (booking) =>
  booking?.event?.title || booking?.eventName || "Untitled event";

const getEventLocation = (booking) =>
  booking?.event?.location || booking?.location || "Unknown location";

const getTicketCount = (booking) => booking?.tickets ?? booking?.ticketCount ?? 0;

const getAmountValue = (booking) => Number(booking?.totalAmount ?? booking?.totalPrice ?? 0) || 0;

const getBookingStatus = (booking) => booking?.bookingStatus || "Pending";
const getPaymentStatus = (booking) => booking?.paymentStatus || "Unpaid";

const StatCard = ({ title, value, icon: Icon, accent }) => (
  <article className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:border-orange-400/30">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm text-slate-400">{title}</p>
        <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      </div>
      <div className={`rounded-2xl border border-white/10 bg-white/5 p-2.5 ${accent}`}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
  </article>
);

const EmptyState = ({ title, subtitle }) => (
  <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-slate-950/60 px-8 py-12 text-center">
    <div className="rounded-2xl border border-orange-400/20 bg-orange-400/10 p-3 text-orange-300">
      <FiInbox className="h-7 w-7" />
    </div>
    <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 text-sm">
    <span className="text-slate-500">{label}</span>
    <span className="text-right font-medium text-slate-200">{value}</span>
  </div>
);

const Badge = ({ label, variant }) => {
  const style = variant === "status" ? statusStyles[label] || statusStyles.Pending : paymentStyles[label] || paymentStyles.Unpaid;
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${style}`}>
      {label}
    </span>
  );
};

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editBooking, setEditBooking] = useState(null);
  const [editStatus, setEditStatus] = useState("Pending");
  const [editPayment, setEditPayment] = useState("Paid");
  const [deleteBooking, setDeleteBooking] = useState(null);
  const [toast, setToast] = useState(null);
  const token = localStorage.getItem("token");

  const showToast = (type, message) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 2600);
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/api/admin/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = response.data;
      const data = Array.isArray(payload) ? payload : payload?.bookings || payload?.data || [];
      setBookings(data);
    } catch (error) {
      setBookings([]);
      showToast("error", error?.response?.data?.message || "Unable to load bookings right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedBooking || editBooking || deleteBooking ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedBooking, editBooking, deleteBooking]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter((booking) => getBookingStatus(booking) === "Confirmed").length;
    const pending = bookings.filter((booking) => getBookingStatus(booking) === "Pending").length;
    const revenue = bookings.reduce((sum, booking) => sum + getAmountValue(booking), 0);
    return [
      { title: "Total Bookings", value: total, icon: FiUser, accent: "text-orange-300" },
      { title: "Confirmed", value: confirmed, icon: FiCheckCircle, accent: "text-emerald-300" },
      { title: "Pending", value: pending, icon: FiClock, accent: "text-amber-300" },
      { title: "Revenue", value: formatCurrency(revenue), icon: FiTag, accent: "text-orange-300" },
    ];
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return bookings.filter((booking) => {
      const customer = getCustomerName(booking).toLowerCase();
      const email = getCustomerEmail(booking).toLowerCase();
      const eventName = getEventName(booking).toLowerCase();
      const matchesSearch = !query || customer.includes(query) || email.includes(query) || eventName.includes(query);
      const matchesStatus = statusFilter === "All" || getBookingStatus(booking) === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const handleUpdateBooking = async (bookingId, status, payment) => {
    try {
      const response = await axios.put(
        `${API}/api/admin/bookings/${bookingId}`,
        { bookingStatus: status, paymentStatus: payment },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const updatedBooking = response.data?.booking || response.data;
      setBookings((current) => current.map((booking) => (booking._id === bookingId ? updatedBooking : booking)));
      setEditBooking(updatedBooking);
      showToast("success", "Booking updated successfully.");
    } catch (error) {
      showToast("error", error?.response?.data?.message || "Unable to update booking.");
    }
  };

  const handleDeleteBooking = async () => {
    if (!deleteBooking) return;
    try {
      await axios.delete(`${API}/api/admin/bookings/${deleteBooking._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings((current) => current.filter((booking) => booking._id !== deleteBooking._id));
      setDeleteBooking(null);
      showToast("success", "Booking deleted permanently.");
    } catch (error) {
      showToast("error", error?.response?.data?.message || "Unable to delete booking.");
    }
  };

  const openView = (booking) => setSelectedBooking(booking);

  const openEdit = (booking) => {
    setEditBooking(booking);
    setEditStatus(getBookingStatus(booking));
    setEditPayment(getPaymentStatus(booking));
  };

  return (
    <div className="space-y-6">
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

      <section className="rounded-[28px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-400">BOOKING OPERATIONS</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Customer Bookings</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Review reservations, payments and attendee status from a single bookings dashboard.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchBookings}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-sm font-semibold text-white transition hover:border-orange-400/40 hover:bg-slate-900"
          >
            <FiRefreshCcw className="h-4 w-4 text-orange-300" />
            Refresh
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return <StatCard key={item.title} {...item} icon={Icon} />;
        })}
      </section>

      <section className="rounded-[24px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_12px_35px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-3">
            <FiSearch className="h-4 w-4 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search customer or event..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-3 text-sm text-slate-300">
            <FiTag className="h-4 w-4 text-orange-300" />
            <StatusDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              options={["All", "Confirmed", "Pending", "Cancelled"]}
            />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-white/10 bg-slate-900/70 shadow-[0_12px_35px_rgba(0,0,0,0.25)]">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-950/80">
              <tr>
                {["Customer", "Event", "Tickets", "Amount", "Payment", "Status", "Booking Date", "Actions"].map((header) => (
                  <th key={header} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10 bg-slate-900/70">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-14">
                    <div className="flex items-center justify-center gap-3 text-sm text-slate-400">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-400/30 border-t-orange-400" />
                      Loading bookings...
                    </div>
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-16">
                    <EmptyState
                      title="No bookings found."
                      subtitle="Booking records will appear here once reservations are processed."
                    />
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking, index) => (
                  <tr key={booking._id || index} className="transition hover:bg-slate-800/70">
                    <td className="px-4 py-3 text-sm text-white">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-400/10 text-sm font-semibold text-orange-200">
                          {getCustomerName(booking)
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((part) => part[0]?.toUpperCase())
                            .join("") || "CU"}
                        </div>
                        <div>
                          <div className="font-medium text-white">{getCustomerName(booking)}</div>
                          <div className="mt-1 text-xs text-slate-500">{getCustomerEmail(booking)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      <div className="font-medium text-white">{getEventName(booking)}</div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <FiMapPin className="h-3.5 w-3.5" />
                        <span>{getEventLocation(booking)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">{getTicketCount(booking)}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{formatCurrency(getAmountValue(booking))}</td>
                    <td className="px-4 py-3">
                      <Badge label={getPaymentStatus(booking)} variant="payment" />
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={getBookingStatus(booking)} variant="status" />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">{formatDate(booking.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openView(booking)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-orange-400/40 hover:text-white"
                        >
                          <FiEye className="h-3.5 w-3.5 text-orange-300" />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(booking)}
                          className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-2 text-emerald-300 transition hover:bg-emerald-500/20"
                          aria-label="Edit booking"
                        >
                          <FiCheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteBooking(booking)}
                          className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-2 text-rose-300 transition hover:bg-rose-500/20"
                          aria-label="Delete booking"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedBooking && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-sm"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[28px] border border-white/10 bg-slate-900 shadow-[0_20px_120px_rgba(0,0,0,0.6)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-orange-400">Booking details</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">{getEventName(selectedBooking)}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="rounded-2xl border border-white/10 bg-slate-950/70 p-2 text-slate-300 transition hover:border-orange-400/40 hover:text-white"
              >
                <FiXCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-[1fr_0.95fr]">
              <div className="space-y-5">
                <div className="rounded-[22px] border border-white/10 bg-slate-950/60 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-400">Customer information</p>
                      <h3 className="mt-1 text-xl font-semibold text-white">{getCustomerName(selectedBooking)}</h3>
                    </div>
                    <Badge label={getBookingStatus(selectedBooking)} variant="status" />
                  </div>
                  <div className="mt-4 space-y-3 text-sm">
                    <DetailRow label="Name" value={getCustomerName(selectedBooking)} />
                    <DetailRow label="Email" value={getCustomerEmail(selectedBooking)} />
                  </div>
                </div>

                <div className="rounded-[22px] border border-white/10 bg-slate-950/60 p-5">
                  <p className="text-sm text-slate-400">Event information</p>
                  <div className="mt-4 space-y-3 text-sm">
                    <DetailRow label="Event" value={getEventName(selectedBooking)} />
                    <DetailRow label="Location" value={getEventLocation(selectedBooking)} />
                    <DetailRow label="Booking date" value={formatDate(selectedBooking.createdAt)} />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-[22px] border border-white/10 bg-slate-950/60 p-5">
                  <p className="text-sm text-slate-400">Booking summary</p>
                  <div className="mt-4 space-y-3 text-sm">
                    <DetailRow label="Tickets" value={getTicketCount(selectedBooking)} />
                    <DetailRow label="Amount" value={formatCurrency(getAmountValue(selectedBooking))} />
                    <DetailRow label="Payment" value={getPaymentStatus(selectedBooking)} />
                    <DetailRow label="Status" value={getBookingStatus(selectedBooking)} />
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="flex flex-col gap-3 border-t border-white/10 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-white transition hover:border-orange-400/40"
              >
                Close
              </button>
            </div> */}
          </div>
        </div>
      )}

      {editBooking && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-sm"
          onClick={() => setEditBooking(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[28px] border border-white/10 bg-slate-900 shadow-[0_20px_120px_rgba(0,0,0,0.6)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-orange-400">Edit booking</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">{getEventName(editBooking)}</h2>
              </div>
              <button
                type="button"
                onClick={() => setEditBooking(null)}
                className="rounded-2xl border border-white/10 bg-slate-950/70 p-2 text-slate-300 transition hover:border-orange-400/40 hover:text-white"
              >
                <FiXCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-[1fr_0.95fr]">
              <div className="space-y-5">
                <div className="rounded-[22px] border border-white/10 bg-slate-950/60 p-5">
                  <p className="text-sm text-slate-400">Customer information</p>
                  <div className="mt-4 space-y-3 text-sm">
                    <DetailRow label="Name" value={getCustomerName(editBooking)} />
                    <DetailRow label="Email" value={getCustomerEmail(editBooking)} />
                  </div>
                </div>

                <div className="rounded-[22px] border border-white/10 bg-slate-950/60 p-5">
                  <p className="text-sm text-slate-400">Booking details</p>
                  <div className="mt-4 space-y-3 text-sm">
                    <DetailRow label="Tickets" value={getTicketCount(editBooking)} />
                    <DetailRow label="Amount" value={formatCurrency(getAmountValue(editBooking))} />
                    <DetailRow label="Event" value={getEventName(editBooking)} />
                  </div>
                </div>
              </div>

              <div className="space-y-8">

  {/* Header */}
  <div>
    <span className="inline-flex rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-orange-400">
      Booking Actions
    </span>

    <h2 className="mt-4 text-3xl font-bold text-white">
      Update Booking
    </h2>

    <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
      Manage the booking and payment status before saving your changes
    </p>
  </div>

  {/* Booking Status */}
  <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/40 px-6 py-5 transition-all duration-300 hover:border-orange-500/30 hover:bg-slate-900/60">

    <div>
      <h4 className="text-base font-semibold text-white">
        Booking Status
      </h4>

      <p className="mt-1 text-sm text-slate-500">
        Select the current <br /> reservation status
      </p>
    </div>

    <div className="w-60">
      <StatusDropdown
        value={editStatus}
        onChange={setEditStatus}
        options={[
          "Confirmed",
          "Pending",
          "Cancelled",
        ]}
      />
    </div>

  </div>

  {/* Payment Status */}
  <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/40 px-6 py-5 transition-all duration-300 hover:border-orange-500/30 hover:bg-slate-900/60">

    <div>
      <h4 className="text-base font-semibold text-white">
        Payment Status
      </h4>

      <p className="mt-1 text-sm text-slate-500">
        Update the payment information
      </p>
    </div>

    <div className="w-60">
      <StatusDropdown
        value={editPayment}
        onChange={setEditPayment}
        options={[
          "Paid",
          "Unpaid",
          "Refunded",
        ]}
      />
    </div>

  </div>

</div>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/10 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setEditBooking(null)}
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-white transition hover:border-orange-400/40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await handleUpdateBooking(editBooking._id, editStatus, editPayment);
                  setEditBooking(null);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
              >
                <FiCheckCircle className="h-4 w-4" />
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteBooking && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-sm"
          onClick={() => setDeleteBooking(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[28px] border border-white/10 bg-slate-900 shadow-[0_20px_120px_rgba(0,0,0,0.6)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-300 mt-6">
              <FiTrash2 className="h-6 w-6" />
            </div>
            <div className="p-6 text-center">
              <h3 className="text-xl font-semibold text-white">Delete this booking?</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                This will permanently remove the reservation for {getEventName(deleteBooking)}.
              </p>
            </div>
            <div className="mx-6 rounded-[20px] bg-slate-950/60 p-4 text-sm text-slate-200">
              <p className="font-medium text-white">{getCustomerName(deleteBooking)}</p>
              <p className="mt-1 text-slate-400">{getTicketCount(deleteBooking)} ticket{getTicketCount(deleteBooking) === 1 ? "" : "s"}</p>
            </div>
            <div className="mt-6 flex flex-col gap-3 px-6 pb-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteBooking(null)}
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-white transition hover:border-orange-400/40"
              >
                Keep booking
              </button>
              <button
                type="button"
                onClick={handleDeleteBooking}
                className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-400"
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
