import { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [contacts, setContacts] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    // SELL TICKETS
    fetch(
      "https://event-management-and-selling.onrender.com/api/admin/sell-tickets",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
      .then((res) => res.json())
      .then(setTickets)
      .catch(console.error);

    // CONTACT MESSAGES
    fetch(
      "https://event-management-and-selling.onrender.com/api/contact/admin",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
      .then((res) => res.json())
      .then(setContacts)
      .catch(console.error);
  }, [token]);

  return (
    <div className="page pt-20 px-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-10">
        Admin <span className="text-orange-500">Dashboard</span>
      </h1>

      {/* SELL TICKETS */}
      <h2 className="text-2xl font-semibold mb-4">Sell Ticket Requests</h2>

      {tickets.length === 0 ? (
        <p className="text-gray-400">No sell ticket requests</p>
      ) : (
        tickets.map((t) => (
          <div key={t._id} className="bg-zinc-900 p-5 rounded-xl mb-4">
            <p className="font-semibold">{t.eventName}</p>
            <p className="text-gray-400 text-sm">
              {t.user?.name} • ₹{t.expectedPrice}
            </p>
            <p className="text-sm text-orange-400 mt-1">Reason: {t.reason}</p>
            <p className="mt-2 font-semibold text-green-500">{t.status}</p>
          </div>
        ))
      )}

      {/* CONTACT MESSAGES */}
      <h2 className="text-2xl font-semibold mt-12 mb-4">Contact Messages</h2>

      {contacts.length === 0 ? (
        <p className="text-gray-400">No messages yet</p>
      ) : (
        contacts.map((c) => (
          <div key={c._id} className="bg-black p-5 rounded-xl mb-4">
            <p className="font-semibold">{c.name}</p>
            <p className="text-gray-400 text-sm">{c.email}</p>
            <p className="text-sm mt-2">{c.message}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminDashboard;
