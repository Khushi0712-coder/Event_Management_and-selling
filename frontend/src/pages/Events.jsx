import { useState } from "react";
import TicketEventCard from "../components/TicketEventCard";
import BookingModal from "../components/BookingModal";

const Events = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  // ✅ REAL AUTH CHECK
  const isLoggedIn = !!localStorage.getItem("token");

  const events = [
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

      <div className="grid md:grid-cols-3 gap-10">
        {events.map((e, i) => (
          <TicketEventCard key={i} event={e} onBook={handleBook} />
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
