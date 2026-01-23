import { useState } from "react";

const BookingModal = ({ event, onClose }) => {
  const [count, setCount] = useState(1);
  const token = localStorage.getItem("token");

  const bookTicket = async () => {
    if (!token) {
      alert("Please login to book tickets");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventName: event.title,
          eventDate: event.date,
          location: event.location,
          ticketCount: count,
          totalPrice: count * event.price,
        }),
      });

      const data = await res.json(); // 🔥 capture backend message

      if (!res.ok) {
        alert(data.message || "Booking failed ❌");
        console.error("BOOKING ERROR:", data);
        return;
      }

      alert("Booking successful 🎉");
      onClose();
    } catch (error) {
      console.error("NETWORK ERROR:", error);
      alert("Server not reachable ❌");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-xl p-6 w-96 shadow-xl">
        <h2 className="text-xl font-semibold mb-1">{event.title}</h2>
        <p className="text-gray-400 mb-4">₹ {event.price} per ticket</p>

        {/* Ticket counter */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setCount(Math.max(1, count - 1))}
            className="px-3 py-1 bg-black rounded"
          >
            −
          </button>

          <span>{count}</span>

          <button
            onClick={() => setCount(count + 1)}
            className="px-3 py-1 bg-black rounded"
          >
            +
          </button>
        </div>

        <p className="mb-4 font-semibold">Total: ₹ {count * event.price}</p>

        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            Cancel
          </button>

          <button
            onClick={bookTicket}
            className="bg-orange-500 text-black px-4 py-2 rounded hover:bg-orange-600"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
