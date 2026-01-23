import { useEffect, useState } from "react";

const Profile = () => {
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [bookingCount, setBookingCount] = useState(0);
  const [sellTickets, setSellTickets] = useState([]);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        /* PROFILE */
        const profileRes = await fetch(
          "http://localhost:5000/api/users/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!profileRes.ok) throw new Error("Profile load failed");
        const profileData = await profileRes.json();
        setUser(profileData);
        setName(profileData.name);
        setEmail(profileData.email);

        /* BOOKINGS */
        const bookingRes = await fetch(
          "http://localhost:5000/api/bookings/my",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const bookings = await bookingRes.json();
        setBookingCount(bookings.length);

        /* SELL TICKETS */
        const sellRes = await fetch(
          "http://localhost:5000/api/sell-ticket/my",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const sellData = await sellRes.json();
        setSellTickets(sellData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const updateProfile = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      setUser(updated);
      setEdit(false);
      alert("Profile updated ✅");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading)
    return (
      <div className="page pt-20 text-center text-gray-400">
        Loading profile...
      </div>
    );

  if (error)
    return <div className="page pt-20 text-center text-red-500">{error}</div>;

  return (
    <div className="page pt-20 px-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">
        My <span className="text-orange-500">Profile</span>
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="bg-zinc-900 rounded-xl p-6 text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-orange-500 text-black flex items-center justify-center text-3xl font-bold mb-4">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-gray-400">{user.email}</p>
          <button
            onClick={() => setEdit(true)}
            className="mt-4 text-orange-500 underline"
          >
            Edit Profile
          </button>
        </div>

        {/* RIGHT */}
        <div className="md:col-span-2 bg-zinc-900 rounded-xl p-6">
          {!edit ? (
            <>
              <p className="mb-2">Bookings: {bookingCount}</p>
              <p className="mb-4">Role: {user.role}</p>
            </>
          ) : (
            <>
              <input
                className="w-full mb-3 p-2 bg-black rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="w-full mb-3 p-2 bg-black rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                onClick={updateProfile}
                className="bg-orange-500 px-4 py-2 rounded"
              >
                Save
              </button>
            </>
          )}
        </div>
      </div>

      {/* SELL TICKETS */}
      <div className="bg-zinc-900 rounded-xl p-6 mt-8">
        <h3 className="text-xl font-semibold mb-4">
          My <span className="text-orange-500">Sell Tickets</span>
        </h3>

        {sellTickets.length === 0 ? (
          <p className="text-gray-400">No sell tickets yet.</p>
        ) : (
          sellTickets.map((t) => (
            <div
              key={t._id}
              className="bg-black p-4 rounded mb-3 flex justify-between"
            >
              <div>
                <p className="font-semibold">{t.eventName}</p>
                <p className="text-sm text-gray-400">
                  ₹{t.expectedPrice} • {t.eventDate}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded ${
                  t.status === "Approved"
                    ? "bg-green-700"
                    : t.status === "Rejected"
                      ? "bg-red-700"
                      : "bg-yellow-700"
                }`}
              >
                {t.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;
