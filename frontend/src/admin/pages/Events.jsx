import { useEffect, useMemo, useState } from "react";
import { FiCalendar, FiImage, FiMapPin, FiPlus, FiSearch, FiEdit2, FiTrash2 } from "react-icons/fi";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const emptyForm = {
  title: "",
  date: "",
  location: "",
  price: "",
  status: "Published",
};

const getImageUrl = (image) => {
  if (!image) return "";
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  if (image.startsWith("/uploads/")) return `${API}${image}`;
  return image;
};

const Events = () => {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  useEffect(() => {
    if (!showModal) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API}/api/admin/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch events");
      }

      setEvents(data || []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const term = search.toLowerCase();
      return (
        event.title?.toLowerCase().includes(term) ||
        event.location?.toLowerCase().includes(term)
      );
    });
  }, [events, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API}/api/admin/events/${editingId}` : `${API}/api/admin/events`;
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("date", form.date);
      formData.append("location", form.location);
      formData.append("price", String(Number(form.price) || 0));
      formData.append("status", form.status);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Event action failed");
      }

      setSuccess(editingId ? "Event updated successfully" : "Event created successfully");
      setForm(emptyForm);
      setImageFile(null);
      setPreviewUrl("");
      setEditingId(null);
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (event) => {
    setForm({
      title: event.title || "",
      date: event.date || "",
      location: event.location || "",
      price: event.price ?? "",
      status: event.status || "Published",
    });
    setImageFile(null);
    setPreviewUrl(getImageUrl(event.image));
    setEditingId(event._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;

    try {
      const response = await fetch(`${API}/api/admin/events/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete event");
      }

      setSuccess("Event deleted successfully");
      fetchEvents();
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="space-y-6">
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .date-input { color-scheme: dark; accent-color: #f59e0b; } .date-input::-webkit-calendar-picker-indicator { filter: invert(1) brightness(2); opacity: 1; cursor: pointer; } .date-input::-webkit-datetime-edit-text, .date-input::-webkit-datetime-edit-month-field, .date-input::-webkit-datetime-edit-day-field, .date-input::-webkit-datetime-edit-year-field { color: #ffffff; }`}</style>

      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-orange-400">Manage Events</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Event management</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">Create, edit, and organize events from a dedicated admin view.</p>
          </div>

          <button
            onClick={() => {
              setForm(emptyForm);
              setImageFile(null);
              setPreviewUrl("");
              setEditingId(null);
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-2.5 font-medium text-white transition hover:bg-orange-600"
          >
            <FiPlus /> Add Event
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-2xl shadow-black/20 md:p-6">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-2.5 pl-10 pr-3 text-sm text-white outline-none ring-0"
            />
          </div>
          <div className="text-sm text-slate-400">{filteredEvents.length} events</div>
        </div>

        {error && <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
        {success && <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">{success}</div>}

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-8 text-center text-slate-400">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/50 p-8 text-center text-slate-400">No events found. Create your first event.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredEvents.map((event) => (
              <div key={event._id} className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/20">
                <div className="relative">
                  {event.image ? (
                    <img src={getImageUrl(event.image)} alt={event.title} className="h-56 w-full object-cover" />
                  ) : (
                    <div className="flex h-56 w-full items-center justify-center bg-slate-800 text-sm text-slate-500">No image</div>
                  )}
                  <span className="absolute right-3 top-3 rounded-full bg-orange-500/90 px-3 py-1 text-xs font-medium text-black">{event.status || "Published"}</span>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-semibold text-white">{event.title}</h3>
                  <p className="mt-2 flex items-center gap-2 text-sm text-gray-400"><FiCalendar className="text-orange-400" /> {event.date}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-gray-400"><FiMapPin className="text-orange-400" /> {event.location}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-bold text-orange-500">₹ {event.price || 0}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(event)} className="rounded bg-white/10 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/20"><FiEdit2 className="inline" /></button>
                      <button onClick={() => handleDelete(event._id)} className="rounded bg-red-500/15 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/25"><FiTrash2 className="inline" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 px-3 py-4 sm:px-4">
          <div className="mx-auto flex min-h-full w-full max-w-2xl items-center justify-center py-2">
            <div className="w-full max-h-[calc(100vh-2rem)] overflow-hidden rounded-[28px] border border-white/10 bg-slate-900 shadow-2xl shadow-black/40">
              <div className="no-scrollbar max-h-[calc(100vh-2rem)] overflow-y-auto">
                <div className="border-b border-white/10 px-5 py-4 sm:px-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.3em] text-orange-400">{editingId ? "Edit Event" : "Add Event"}</p>
                      <h2 className="mt-2 text-2xl font-semibold text-white">{editingId ? "Update event details" : "Create a new event"}</h2>
                      <p className="mt-1 text-sm text-slate-400">Fill in the event details and upload a cover image.</p>
                    </div>
                    <button onClick={() => setShowModal(false)} className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/10">Close</button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5 sm:px-6 sm:py-6" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-300">Event title</label>
                      <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Enter event title" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500" />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">Date</label>
                      <div className="relative">
                        <FiCalendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" />
                        <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="date-input w-full appearance-none rounded-2xl border border-white/10 bg-slate-950/70 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-orange-500" />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">Location</label>
                      <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Enter location" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500" />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">Price</label>
                      <input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500" />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">Status</label>
                      <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500">
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                      </select>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-dashed border-orange-500/20 bg-slate-950/70 p-4 text-sm text-slate-400">
                    <label className="mb-2 block font-medium text-slate-300">Event image</label>
                    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
                      <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0] || null; setImageFile(file); }} className="w-full text-sm text-slate-400 file:mr-4 file:rounded-full file:border-0 file:bg-orange-500/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-orange-300" />

                      {previewUrl ? (
                        <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
                          <img src={previewUrl} alt="Selected event preview" className="h-44 w-full object-cover" />
                        </div>
                      ) : (
                        <div className="mt-3 flex h-44 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-900/60 text-center text-xs text-slate-500">
                          <div className="flex flex-col items-center gap-2"><FiImage className="text-2xl text-orange-400" /><span>Preview will appear here after you choose an image</span></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-end">
                    <button type="button" onClick={() => setShowModal(false)} className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/10">Cancel</button>
                    <button type="submit" disabled={submitting} className="rounded-2xl bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600 disabled:opacity-60">{submitting ? "Saving..." : editingId ? "Update Event" : "Create Event"}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
