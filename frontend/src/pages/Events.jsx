import { useEffect, useState } from "react";
import TicketEventCard from "../components/TicketEventCard";
import BookingModal from "../components/BookingModal";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const staticEvents = [
  {
    title: "Music Night Live",
    image: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc",
    date: "25 Feb 2026",
    location: "Mumbai",
    price: 999,
  },
  {
    title: "DJ Night Party",
    image: "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2",
    date: "28 Feb 2026",
    location: "Delhi",
    price: 799,
  },
  {
    title: "Rock Concert",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
    date: "5 Mar 2026",
    location: "Bangalore",
    price: 1499,
  },
];

const Events = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState(staticEvents);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ REAL AUTH CHECK
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API}/api/events`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load events");
        }

        const publishedEvents = Array.isArray(data)
          ? data.filter((event) => event.status === "Published")
          : [];
        const mergedEvents = [...staticEvents, ...publishedEvents];
        setEvents(mergedEvents);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleBook = (event) => {
    if (!isLoggedIn) {
      alert("Please login to book tickets");
      return;
    }
    setSelectedEvent(event);
  };

  return (
    <div className="page pt-20 px-10">
      <h1 className="text-4xl text-center mb-12">
        Live <span className="text-orange-500">Events</span>
      </h1>

      {loading && <p className="text-center text-gray-400">Loading events...</p>}
      {error && <p className="text-center text-red-400">{error}</p>}

      {!loading && !error && events.length === 0 && (
        <p className="text-center text-gray-400">No published events available right now.</p>
      )}

      <div className="grid md:grid-cols-3 gap-10">
        {events.map((event, index) => (
          <TicketEventCard key={event._id || `${event.title}-${index}`} event={event} onBook={handleBook} />
        ))}
      </div>

      {selectedEvent && (
        <BookingModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default Events;
