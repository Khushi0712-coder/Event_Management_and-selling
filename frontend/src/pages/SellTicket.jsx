import { useState } from "react";

const SellTicket = () => {
  const [eventName, setEventName] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [expectedPrice, setExpectedPrice] = useState("");
  const [reason, setReason] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const submitTicket = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    if (
      !eventName ||
      !location ||
      !eventDate ||
      !originalPrice ||
      !expectedPrice ||
      !file
    ) {
      alert("Please fill all required fields");
      return;
    }

    if (Number(expectedPrice) >= Number(originalPrice)) {
      alert("Expected price must be lower than original price");
      return;
    }

    const formData = new FormData();
    formData.append("eventName", eventName);
    formData.append("location", location);
    formData.append("eventDate", eventDate);
    formData.append("originalPrice", originalPrice);
    formData.append("expectedPrice", expectedPrice);
    formData.append("reason", reason);
    formData.append("proof", file);

    try {
      setLoading(true);

      const res = await fetch(
        "https://event-management-and-selling.onrender.com/api/sell-ticket",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (res.ok) {
        alert("Ticket submitted for review ✅");

        // Reset form
        setEventName("");
        setLocation("");
        setEventDate("");
        setOriginalPrice("");
        setExpectedPrice("");
        setReason("");
        setFile(null);
      } else {
        alert("Submission failed ❌");
      }
    } catch (err) {
      alert("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page pt-20 px-4 flex justify-center">
      <div className="w-full max-w-lg">
        {/* Heading */}
        <h1 className="text-4xl font-bold text-center mb-3">
          Sell Your <span className="text-orange-500">Tickets</span>
        </h1>

        <p className="text-gray-400 text-center mb-10 text-sm">
          Can’t attend an event? Sell your ticket to us at a fair price and get
          quick confirmation.
        </p>

        {/* Card */}
        <div className="relative bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/5">
          <div className="absolute -inset-1 bg-orange-500/10 blur-2xl rounded-2xl"></div>

          <div className="relative space-y-5">
            <input
              type="text"
              placeholder="Event Name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full p-3 bg-black/60 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            />

            <input
              type="text"
              placeholder="Event Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-3 bg-black/60 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            />

            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full p-3 bg-black/60 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Original Price (₹)"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="w-full p-3 bg-black/60 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              />

              <input
                type="number"
                placeholder="Expected Price (₹)"
                value={expectedPrice}
                onChange={(e) => setExpectedPrice(e.target.value)}
                className="w-full p-3 bg-black/60 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Upload Ticket Proof */}
            <label className="block">
              <span className="text-sm text-gray-400 mb-2 block">
                Upload Ticket Proof (PDF / Image)
              </span>

              <div className="flex items-center justify-between gap-4 bg-black/60 p-3 rounded-lg border border-dashed border-gray-600 hover:border-orange-500 transition cursor-pointer">
                <span className="text-sm text-gray-400 truncate">
                  {file ? file.name : "Click to upload ticket proof"}
                </span>

                <span className="text-xs bg-orange-500 text-black px-3 py-1 rounded">
                  Browse
                </span>

                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />
              </div>
            </label>

            <textarea
              placeholder="Reason for selling (optional)"
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 bg-black/60 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            ></textarea>

            <button
              onClick={submitTicket}
              disabled={loading}
              className="w-full mt-4 bg-orange-500 text-black py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Ticket for Review"}
            </button>
          </div>
        </div>

        {/* Trust note */}
        <p className="text-xs text-gray-500 text-center mt-6">
          Tickets are verified before approval. Uploaded files are securely
          reviewed.
        </p>
      </div>
    </div>
  );
};

export default SellTicket;
