import { useEffect, useState } from "react";

const AdminContacts = () => {
  const token = localStorage.getItem("token");
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    fetch("https://event-management-and-selling.onrender.com/api/contact", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(setContacts);
  }, []);

  const markRead = async (id) => {
    await fetch(
      `https://event-management-and-selling.onrender.com/api/contact/${id}/read`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    setContacts((prev) =>
      prev.map((c) => (c._id === id ? { ...c, status: "Read" } : c)),
    );
  };

  return (
    <div className="page pt-20 px-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">
        Contact <span className="text-orange-500">Requests</span>
      </h1>

      {contacts.length === 0 ? (
        <p className="text-gray-400">No messages yet.</p>
      ) : (
        <div className="space-y-4">
          {contacts.map((c) => (
            <div
              key={c._id}
              className="bg-zinc-900 p-6 rounded flex justify-between"
            >
              <div>
                <h3 className="font-semibold">{c.name}</h3>
                <p className="text-sm text-gray-400">{c.email}</p>
                <p className="mt-2">{c.message}</p>
              </div>

              <div>
                {c.status === "New" ? (
                  <button
                    onClick={() => markRead(c._id)}
                    className="bg-green-600 px-4 py-2 rounded"
                  >
                    Mark Read
                  </button>
                ) : (
                  <span className="text-green-500">Read</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminContacts;
