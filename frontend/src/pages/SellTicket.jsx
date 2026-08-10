import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import PremiumUpload from "../components/PremiumUpload";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    Number(value || 0),
  );

const SellTicket = () => {
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [expectedPrice, setExpectedPrice] = useState("");
  const [reason, setReason] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem("token");

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API}/api/users/profile`, { headers: { Authorization: `Bearer ${token}` } });
        setProfile(res.data);
      } catch (err) {
        // ignore
      }
    };

    const fetchBookings = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API}/api/bookings/my`, { headers: { Authorization: `Bearer ${token}` } });
        setBookings(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setBookings([]);
      }
    };

    fetchProfile();
    fetchBookings();
  }, [token]);

  const selectedBooking = useMemo(() => bookings.find((b) => String(b._id) === String(selectedBookingId)), [bookings, selectedBookingId]);

  useEffect(() => {
    if (selectedBooking) {
      setLocation(selectedBooking.location || "");
    }
  }, [selectedBooking]);

  const originalPrice = useMemo(() => {
    if (!selectedBooking) return "";
    const count = selectedBooking.ticketCount || selectedBooking.tickets || 1;
    const total = selectedBooking.totalPrice || selectedBooking.totalAmount || 0;
    const per = count ? Math.round(Number(total) / Number(count)) : 0;
    return per || "";
  }, [selectedBooking]);

  const handleSubmit = async () => {
    if (!token) return showToast("Please login first", "error");

    // Validation
    if (!selectedBookingId) return showToast("Please choose an event", "error");
    if (!phone) return showToast("Phone number is required", "error");
    if (!expectedPrice) return showToast("Expected selling price is required", "error");
    if (!file) return showToast("Please upload ticket proof", "error");
    if (Number(expectedPrice) >= Number(originalPrice)) return showToast("Expected price must be lower than original price", "error");

    const formData = new FormData();
    formData.append("eventName", selectedBooking.event?.title || selectedBooking.eventName || "");
    formData.append("location", location || selectedBooking.location || "");
    formData.append("eventDate", selectedBooking.event?.date || selectedBooking.eventDate || "");
    formData.append("originalPrice", originalPrice);
    formData.append("expectedPrice", expectedPrice);
    formData.append("reason", reason || "");
    formData.append("proof", file);

    try {
      setLoading(true);
      const res = await axios.post(`${API}/api/sell-ticket`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      if (res.status === 201) {
        showToast("Ticket submitted for review", "success");
        // reset
        setSelectedBookingId("");
        setPhone("");
        setLocation("");
        setExpectedPrice("");
        setReason("");
        setFile(null);
      } else {
        showToast("Submission failed", "error");
      }
    } catch (err) {
      showToast(err?.response?.data?.message || "Server error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page pt-20 px-4 flex justify-center">
      <div className="w-full max-w-3xl">
        {toast && (
          <div className={`fixed right-4 top-6 z-50 rounded-lg px-4 py-2 text-sm ${toast.type === "success" ? "bg-emerald-500/10 border border-emerald-400/20 text-emerald-200" : "bg-rose-500/10 border border-rose-400/20 text-rose-200"}`}>
            {toast.message}
          </div>
        )}

        <header className="mb-6 text-center">
          <h1 className="text-3xl font-semibold text-white">Sell Your Tickets</h1>
          <p className="mt-2 text-sm text-slate-400">Select an event you booked and submit a ticket resale request.</p>
        </header>

        <div className="rounded-2xl bg-slate-900/70 border border-white/10 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          <div className="space-y-6">
            {/* Section 1: Seller Info */}
            <section className="rounded-xl border border-white/6 bg-slate-950/50 p-4">
              <h3 className="text-sm font-medium text-slate-300">Seller Information</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-slate-400">Full name</label>
                  <input readOnly value={profile?.name || ""} className="mt-1 w-full rounded-lg bg-slate-900/60 px-3 py-2 text-white outline-none" />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Email</label>
                  <input readOnly value={profile?.email || ""} className="mt-1 w-full rounded-lg bg-slate-900/60 px-3 py-2 text-white outline-none" />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Phone</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Your phone number" className="mt-1 w-full rounded-lg bg-slate-900/60 px-3 py-2 text-white outline-none" />
                </div>
                <div>
                  <label className="text-xs text-slate-400">City / Location</label>
                  <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City or location" className="mt-1 w-full rounded-lg bg-slate-900/60 px-3 py-2 text-white outline-none" />
                </div>
              </div>
            </section>

            {/* Section 2: Ticket Info */}
            <section className="rounded-xl border border-white/6 bg-slate-950/50 p-4">
              <h3 className="text-sm font-medium text-slate-300">Ticket Information</h3>
              <div className="mt-3 space-y-3">
                <label className="text-xs text-slate-400">Event (booked events only)</label>
                <select value={selectedBookingId} onChange={(e) => setSelectedBookingId(e.target.value)} className="mt-1 w-full rounded-lg bg-slate-900/60 px-3 py-2 text-white outline-none">
                  <option value="">Choose an event</option>
                  {bookings.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.event?.title || b.eventName} — {formatDate(b.event?.date || b.eventDate)}
                    </option>
                  ))}
                </select>

                {selectedBooking && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs text-slate-400">Event Name</label>
                      <div className="mt-1 text-white">{selectedBooking.event?.title || selectedBooking.eventName}</div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Purchase Date</label>
                      <div className="mt-1 text-white">{formatDate(selectedBooking.event?.date || selectedBooking.eventDate)}</div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Ticket Quantity</label>
                      <div className="mt-1 text-white">{selectedBooking.ticketCount || selectedBooking.tickets}</div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Original Ticket Price</label>
                      <div className="mt-1 text-white">{formatCurrency(originalPrice)}</div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs text-slate-400">Expected Selling Price</label>
                  <input value={expectedPrice} onChange={(e) => setExpectedPrice(e.target.value)} type="number" placeholder="Enter expected price" className="mt-1 w-full rounded-lg bg-slate-900/60 px-3 py-2 text-white outline-none" />
                </div>

                <div>
                  <label className="text-xs text-slate-400">Reason for Selling</label>
                  <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="mt-1 w-full rounded-lg bg-slate-900/60 px-3 py-2 text-white outline-none" placeholder="Optional" />
                </div>
              </div>
            </section>

            {/* Section 3: Upload */}
            <section className="rounded-xl border border-white/6 bg-slate-950/50 p-4">
              <h3 className="text-sm font-medium text-slate-300">Ticket Proof</h3>
              <div className="mt-3">
                <PremiumUpload file={file} onChange={setFile} />
              </div>
            </section>

            <div className="flex items-center justify-end gap-3">
              <button onClick={handleSubmit} disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2 text-black font-semibold hover:bg-orange-600 disabled:opacity-60">
                {loading ? "Submitting..." : "Submit Ticket for Review"}
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-500 text-center">Tickets are verified before approval. Uploaded files are securely reviewed.</p>
      </div>
    </div>
  );
};

export default SellTicket;
