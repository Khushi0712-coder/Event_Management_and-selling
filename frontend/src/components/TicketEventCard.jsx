const TicketEventCard = ({ event, onBook }) => {
  return (
    <div className="bg-zinc-900 rounded-xl overflow-hidden hover:scale-[1.02] transition">
      <img
        src={event.image}
        alt={event.title}
        className="h-56 w-full object-cover"
      />

      <div className="p-5">
        <h3 className="text-xl font-semibold">{event.title}</h3>
        <p className="text-gray-400 text-sm">
          📅 {event.date} • 📍 {event.location}
        </p>

        <div className="flex justify-between items-center mt-4">
          <span className="text-orange-500 font-bold">₹ {event.price}</span>
          <button
            onClick={() => onBook(event)}
            className="bg-orange-500 text-black px-4 py-2 rounded hover:bg-orange-600"
          >
            Book Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketEventCard;
