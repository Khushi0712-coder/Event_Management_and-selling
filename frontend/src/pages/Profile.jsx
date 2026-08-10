import React, { useEffect, useMemo, useState } from "react";
import { FiCalendar, FiMapPin, FiEye, FiSearch } from "react-icons/fi";

/*
  Redesigned Profile page — Event Experience Dashboard
  - Inline small components: ProfileHero, EventPassCard, StatusPill
  - Uses real API data; preserves edit & view-ticket functionality
*/

const API = import.meta.env.VITE_API_URL || "";

const getImageUrl = (image) => {
  if (!image) return "";
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  if (image.startsWith("/uploads/")) return `${API}${image}`;
  return `${API.replace(/\/$/, "")}/uploads/${image}`;
};

const StatusPill = ({ status }) => {
  const base = "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold";
  if (!status) return <span className={`${base} bg-amber-600/10 text-amber-300 border border-amber-600/10`}>● {"Awaiting"}</span>;
  if (status === "Confirmed") return <span className={`${base} text-emerald-300 bg-emerald-700/6`}>✓ Confirmed</span>;
  if (status === "Cancelled") return <span className={`${base} text-red-300 bg-red-700/6`}>✕ Cancelled</span>;
  return <span className={`${base} text-amber-300 bg-amber-600/8`}>● Awaiting confirmation</span>;
};

const PaymentPill = ({ payment }) => {
  const base = "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold";
  if (!payment) return <span className={`${base} bg-red-700/6 text-red-300`}>● Unpaid</span>;
  if (payment === "Paid") return <span className={`${base} bg-emerald-700/6 text-emerald-300`}>● Paid</span>;
  return <span className={`${base} bg-red-700/6 text-red-300`}>● {payment}</span>;
};

const ProfileHero = ({ user, stats, onEdit }) => {
  const initials = (user?.name || user?.email || "").split(" ").map(p => p[0]).slice(0,2).join("").toUpperCase() || "U";

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/6 bg-slate-900/80 p-6 shadow-[0_16px_50px_rgba(0,0,0,0.6)]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_rgba(59,130,246,0.02),_transparent_30%)]" />
      <div className="absolute -left-16 -top-10 h-60 w-60 rounded-full bg-orange-500/6 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-slate-800/40 to-slate-900/40 flex items-center justify-center text-3xl font-semibold text-white ring-1 ring-white/6">
              {initials}
            </div>
            <div className="absolute inset-0 rounded-full blur-[10px] bg-orange-500/8 -z-10" />
          </div>

          <div className="min-w-0">
            <p className="text-sm text-slate-400">Welcome back,</p>
            <h2 className="truncate text-2xl md:text-3xl font-semibold text-white">{user?.name || user?.email}</h2>
            <p className="mt-1 text-sm text-slate-400 truncate">{user?.email}</p>

            <div className="mt-3 flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-slate-800/60 px-3 py-1 text-xs font-semibold text-slate-300 border border-white/6">{user?.role || "member"}</span>
              <button
                onClick={onEdit}
                className="inline-flex items-center gap-2 rounded-full bg-transparent border border-white/8 px-3 py-1 text-sm font-semibold text-orange-400 hover:bg-orange-500/6 transition"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-center">
          {stats.map((s) => (
            <div key={s.title} className="min-w-[84px]">
              <p className="text-2xl md:text-3xl font-extrabold text-white leading-none">{s.value}</p>
              <p className="mt-1 text-xs tracking-wide text-slate-400">{s.title.toUpperCase()}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const EventPassCard = ({ booking, onView }) => {
  const formatDate = (v) => {
    if (!v) return "—";
    const d = new Date(v);
    if (Number.isNaN(d.valueOf())) return v;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  const formatCurrency = (value) => `₹ ${Number(value || 0).toLocaleString()}`;

  const poster = getImageUrl(booking?.event?.image || booking?.event?.imageUrl || booking?.event?.poster || null);
  const tickets = booking.ticketCount ?? booking.tickets ?? 1;
  const amountFromBooking = booking.totalAmount ?? booking.totalPrice;
  const fallback = tickets * (booking.event?.price ?? 0);
  const amount = amountFromBooking || fallback || 0;

  return (
    <article className="group overflow-hidden rounded-[1.8rem] border border-white/10 bg-slate-950/90 shadow-[0_24px_80px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden bg-slate-900/10">
        {poster ? (
          <img src={poster} alt={booking.event?.title || booking.eventName} className="h-72 w-full object-cover object-center sm:h-80" />
        ) : (
          <div className="flex h-72 w-full items-center justify-center bg-slate-900 text-slate-500 text-xs uppercase tracking-[0.18em] sm:h-80">No poster available</div>
        )}
        <div className="absolute inset-x-0 top-4 flex items-center justify-between px-4">
          <span className="rounded-full bg-slate-950/90 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-300 border border-white/10">Event Pass</span>
          <StatusPill status={booking.bookingStatus} />
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <div className="min-w-0">
          <h3 className="text-xl font-semibold text-white sm:text-2xl">{booking.event?.title || booking.eventName}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-slate-400">{booking.event?.location || booking.location || "Location not specified"}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-900/80 p-4">
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Date</p>
            <p className="mt-2 text-sm font-semibold text-white">{formatDate(booking.event?.date || booking.eventDate)}{booking.event?.time ? ` • ${booking.event.time}` : ""}</p>
          </div>
          <div className="rounded-2xl bg-slate-900/80 p-4">
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Tickets</p>
            <p className="mt-2 text-sm font-semibold text-white">{tickets} {tickets === 1 ? "seat" : "seats"}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Total</p>
            <p className="mt-2 text-2xl font-semibold text-orange-300">{formatCurrency(amount)}</p>
            <p className="mt-1 text-xs text-slate-500">{booking.paymentStatus ? `Payment ${booking.paymentStatus}` : "Payment pending"}</p>
          </div>

          <button
            onClick={() => onView(booking)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-orange-600"
          >
            <FiEye className="h-4 w-4" /> View pass
          </button>
        </div>
      </div>
    </article>
  );
};

const Profile = () => {
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [sellTickets, setSellTickets] = useState([]);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filterMode, setFilterMode] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState("Latest");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [profileRes, bookingRes, sellRes] = await Promise.all([
        fetch(`${API}/api/users/profile`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/bookings/my`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/sell-ticket/my`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!profileRes.ok) throw new Error("Failed to load profile");
      const profileData = await profileRes.json();
      setUser(profileData);
      setName(profileData.name);
      setEmail(profileData.email);

      const bookingsData = await bookingRes.json();
      setBookings(bookingsData || []);

      const sellData = await sellRes.json();
      setSellTickets(sellData || []);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const updateProfile = async () => {
    try {
      const res = await fetch(`${API}/api/users/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      setUser(updated);
      setEdit(false);
      alert("Profile updated ✅");
    } catch (err) {
      alert(err.message || String(err));
    }
  };

  const stats = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.bookingStatus === "Confirmed").length;
    const pending = bookings.filter(b => b.bookingStatus === "Pending").length;
    return [
      { title: "Bookings", value: String(total).padStart(2, "0") },
      { title: "Confirmed", value: String(confirmed).padStart(2, "0") },
      { title: "Pending", value: String(pending).padStart(2, "0") },
    ];
  }, [bookings]);

  const eventCounts = useMemo(() => {
    const now = new Date();
    const upcoming = bookings.filter((b) => {
      const d = new Date(b.event?.date || b.eventDate);
      return !Number.isNaN(d.valueOf()) && d >= now;
    }).length;
    const past = bookings.filter((b) => {
      const d = new Date(b.event?.date || b.eventDate);
      return !Number.isNaN(d.valueOf()) && d < now;
    }).length;
    return {
      all: bookings.length,
      upcoming,
      past,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const now = new Date();
    const list = bookings.filter((b) => {
      if (filterMode === "Upcoming") {
        const d = new Date(b.event?.date || b.eventDate);
        return !Number.isNaN(d.valueOf()) && d >= now;
      }
      if (filterMode === "Past") {
        const d = new Date(b.event?.date || b.eventDate);
        return !Number.isNaN(d.valueOf()) && d < now;
      }
      return true;
    }).filter((b) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.trim().toLowerCase();
      const title = (b.event?.title || b.eventName || "").toLowerCase();
      const location = (b.event?.location || b.location || "").toLowerCase();
      return title.includes(query) || location.includes(query);
    });

    return [...list].sort((a, b) => {
      const dateA = new Date(a.event?.date || a.eventDate).valueOf() || 0;
      const dateB = new Date(b.event?.date || b.eventDate).valueOf() || 0;
      const totalA = Number(a.totalAmount ?? a.totalPrice ?? (a.ticketCount ?? a.tickets ?? 1) * (a.event?.price ?? 0));
      const totalB = Number(b.totalAmount ?? b.totalPrice ?? (b.ticketCount ?? b.tickets ?? 1) * (b.event?.price ?? 0));
      if (sortMode === "Earliest") return dateA - dateB;
      if (sortMode === "Amount") return totalB - totalA;
      if (sortMode === "Title") return String(a.event?.title || a.eventName || "").localeCompare(String(b.event?.title || b.eventName || ""));
      return dateB - dateA;
    });
  }, [bookings, filterMode, searchQuery, sortMode]);

  if (loading) return <div className="page pt-20 text-center text-slate-400">Loading profile…</div>;
  if (error) return <div className="page pt-20 text-center text-red-500">{error}</div>;

  return (
    <div className="page pt-20 px-6 max-w-6xl mx-auto">
      <ProfileHero user={user} stats={stats} onEdit={() => setEdit(true)} />

      {/* MY EVENTS header + filters */}
      <div className="mt-6 space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-white">MY EVENTS</h3>
            <p className="text-slate-400 mt-1">Your event wallet, now with instant search and premium pass previews.</p>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-[1fr_auto] lg:w-auto">
            <label className="relative block w-full">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events or venues"
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-orange-500"
              />
            </label>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 py-3 px-4 text-sm text-white outline-none transition focus:border-orange-500"
            >
              <option value="Latest">Latest</option>
              <option value="Earliest">Earliest</option>
              <option value="Amount">Highest value</option>
              <option value="Title">A → Z</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Upcoming', 'Past'].map((mode) => {
            const count = mode === 'All' ? eventCounts.all : mode === 'Upcoming' ? eventCounts.upcoming : eventCounts.past;
            return (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${filterMode === mode ? 'bg-orange-500 text-black' : 'bg-slate-900/60 text-slate-300'}`}
              >
                {mode} <span className="ml-2 inline-flex rounded-full bg-white/5 px-2 py-1 text-[10px] font-medium text-slate-300">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Event Passes */}
      <div className="mt-5 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {filteredBookings.length === 0 ? (
          <div className="col-span-full rounded-2xl bg-slate-900/70 p-8 text-center text-slate-400">No events match your search or selected filter.</div>
        ) : (
          filteredBookings.map((b) => (
            <EventPassCard
              key={b._id}
              booking={b}
              onView={(booking) => {
                setSelectedBooking(booking);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ))
        )}
      </div>

      {/* Modal: View Pass / Ticket */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-8">
          <div className="w-full max-w-3xl rounded-2xl border border-white/8 bg-slate-950/95 shadow-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-orange-400">Booking</p>
                <h2 className="mt-1 text-xl font-semibold text-white">{selectedBooking.event?.title || selectedBooking.eventName}</h2>
                <p className="mt-1 text-xs text-slate-400">Ref: {String(selectedBooking._id).slice(0,10)}</p>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-300 p-2 rounded hover:bg-slate-900">×</button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-900/80 p-4">
                <p className="text-xs text-slate-400">When</p>
                <p className="text-sm font-semibold text-white mt-1">{selectedBooking.event?.date || selectedBooking.eventDate} {selectedBooking.event?.time ? `• ${selectedBooking.event.time}` : ''}</p>
                <p className="text-xs text-slate-400 mt-2">{selectedBooking.event?.location || selectedBooking.location}</p>
              </div>

              <div className="rounded-xl bg-slate-900/80 p-4">
                <p className="text-xs text-slate-400">Status</p>
                <div className="mt-2 flex items-center gap-3">
                  <StatusPill status={selectedBooking.bookingStatus} />
                  <PaymentPill payment={selectedBooking.paymentStatus} />
                </div>

                <div className="mt-4">
                  <p className="text-xs text-slate-400">Total</p>
                  <p className="text-lg font-semibold text-orange-300">
                    {(() => {
                      const tickets = selectedBooking.ticketCount ?? selectedBooking.tickets ?? 1;
                      const a = (selectedBooking.totalAmount ?? selectedBooking.totalPrice) || tickets * (selectedBooking.event?.price ?? 0) || 0;
                      return `₹ ${Number(a).toLocaleString()}`;
                    })()}
                  </p>
                </div>
              </div>

              <div className="sm:col-span-2 rounded-xl bg-slate-900/80 p-4 text-center">
                {selectedBooking.bookingStatus === 'Confirmed' ? (
                  <>
                    <p className="text-sm font-semibold text-emerald-300">✓ Booking confirmed</p>
                    <p className="text-xs text-slate-400 mt-2">Present this QR at the venue.</p>
                    <div className="mt-3 inline-block bg-white p-2 rounded">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(String(selectedBooking._id))}`} alt="QR code" className="h-44 w-44" />
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-amber-300">● Confirmation in progress</p>
                    <p className="text-xs text-slate-400 mt-2">Your digital ticket will appear here after confirmation.</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SELL TICKETS section preserved */}
      <div className="bg-slate-900/80 rounded-2xl p-6 mt-8 border border-white/6 shadow-sm">
        <h3 className="text-xl font-semibold mb-2">My <span className="text-orange-500">Sell Tickets</span></h3>
        {sellTickets.length === 0 ? (
          <p className="text-slate-400">No sell tickets yet.</p>
        ) : (
          sellTickets.map(t => (
            <div key={t._id} className="bg-black p-4 rounded mb-3 flex justify-between">
              <div>
                <p className="font-semibold">{t.eventName}</p>
                <p className="text-sm text-slate-400">₹{t.expectedPrice} • {t.eventDate}</p>
              </div>
              <span className={`px-3 py-1 rounded ${t.status === 'Approved' ? 'bg-green-700' : t.status === 'Rejected' ? 'bg-red-700' : 'bg-yellow-700'}`}>{t.status}</span>
            </div>
          ))
        )}
      </div>

      {/* Edit profile drawer (simple inline) */}
      {edit && (
        <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-md rounded-2xl bg-slate-950 p-6 border border-white/8">
            <h4 className="text-lg font-semibold text-white">Edit profile</h4>
            <p className="text-sm text-slate-400 mt-1">Update your name and email.</p>
            <div className="mt-4 space-y-3">
              <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl bg-slate-900/70 px-4 py-3 text-white outline-none" />
              <input value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl bg-slate-900/70 px-4 py-3 text-white outline-none" />
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setEdit(false)} className="rounded-full px-4 py-2 text-sm bg-slate-800 text-slate-300">Cancel</button>
              <button onClick={updateProfile} className="rounded-full px-4 py-2 text-sm bg-orange-500 text-black">Save changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
