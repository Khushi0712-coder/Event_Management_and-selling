import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiCheckCircle,
  FiClock,
  FiEye,
  FiImage,
  FiInbox,
  FiRefreshCcw,
  FiSearch,
  FiTag,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";
import StatusDropdown from "../components/StatusDropdown";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const statusStyles = {
  Pending: "border border-amber-400/20 bg-amber-500/10 text-amber-300",
  Approved: "border border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
  Rejected: "border border-rose-400/20 bg-rose-500/10 text-rose-300",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const buildProofUrl = (proofFile) => {
  if (!proofFile) return null;
  if (proofFile.startsWith("http")) return proofFile;
  if (proofFile.startsWith("/")) return `${API}${proofFile}`;
  return `${API}/uploads/${proofFile}`;
};

const getSellerName = (request) =>
  request?.user?.name || request?.seller?.name || request?.sellerName || "Unknown seller";

const getSellerEmail = (request) =>
  request?.user?.email || request?.seller?.email || request?.sellerEmail || "—";

const getSellerPhone = (request) => request?.seller?.phone || request?.sellerPhone || "—";

const getLocation = (request) => request?.location || request?.seller?.location || "—";

const getEventName = (request) => request?.eventName || request?.event?.name || "—";

const getTicketQuantity = (request) =>
  request?.ticketQuantity ?? request?.quantity ?? request?.ticketCount ?? 0;

const getOriginalPrice = (request) =>
  request?.originalPrice ?? request?.basePrice ?? request?.ticketPrice ?? 0;

const getSellingPrice = (request) =>
  request?.expectedPrice ?? request?.sellingPrice ?? request?.price ?? request?.requestedPrice ?? 0;

const getPurchaseDate = (request) => request?.purchaseDate || request?.purchasedAt || request?.bookedAt || null;

const getRequestDate = (request) => request?.createdAt || request?.updatedAt || request?.requestedAt || null;

const getReason = (request) => request?.reason || request?.notes || "No reason provided.";

const getStatus = (request) => request?.status || "Pending";

const StatCard = ({ title, value, icon: Icon, accent }) => (
  <article className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:border-orange-400/30">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm text-slate-400">{title}</p>
        <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      </div>
      <div className={`rounded-2xl border border-white/10 bg-white/5 p-2.5 ${accent}`}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
  </article>
);

const EmptyState = ({ title, subtitle }) => (
  <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-slate-950/60 px-8 py-12 text-center">
    <div className="rounded-2xl border border-orange-400/20 bg-orange-400/10 p-3 text-orange-300">
      <FiInbox className="h-7 w-7" />
    </div>
    <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 text-sm">
    <span className="text-slate-500">{label}</span>
    <span className="text-right font-medium text-slate-200">{value}</span>
  </div>
);

const SellTickets = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem("token");

  const showToast = (type, message) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 2600);
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/api/admin/sell-tickets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = response.data;
      const data = Array.isArray(payload)
        ? payload
        : payload?.requests || payload?.data || [];

      setRequests(data);
    } catch (error) {
      setRequests([]);
      showToast("error", error?.response?.data?.message || "Unable to load seller requests right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedRequest || previewImage ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedRequest, previewImage]);

  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((item) => getStatus(item) === "Pending").length;
    const approved = requests.filter((item) => getStatus(item) === "Approved").length;
    const rejected = requests.filter((item) => getStatus(item) === "Rejected").length;

    return [
      { title: "Total Requests", value: total, icon: FiUsers, accent: "text-orange-300" },
      { title: "Pending", value: pending, icon: FiClock, accent: "text-amber-300" },
      { title: "Approved", value: approved, icon: FiCheckCircle, accent: "text-emerald-300" },
      { title: "Rejected", value: rejected, icon: FiXCircle, accent: "text-rose-300" },
    ];
  }, [requests]);

  const filteredRequests = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return requests.filter((request) => {
      const sellerName = getSellerName(request).toLowerCase();
      const eventName = getEventName(request).toLowerCase();
      const matchesSearch = !query || sellerName.includes(query) || eventName.includes(query);
      const matchesStatus = statusFilter === "All" || getStatus(request) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  const updateRequestStatus = async (id, status) => {
    try {
      await axios.put(
        `${API}/api/admin/sell-ticket/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setRequests((current) =>
        current.map((request) => (request._id === id ? { ...request, status } : request)),
      );
      showToast("success", `Request ${status.toLowerCase()} successfully.`);
    } catch (error) {
      showToast("error", error?.response?.data?.message || "Unable to update the request status.");
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`fixed right-4 top-4 z-50 rounded-2xl border px-4 py-3 text-sm shadow-2xl shadow-black/30 ${
            toast.type === "success"
              ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
              : "border-rose-400/20 bg-rose-500/10 text-rose-100"
          }`}
        >
          {toast.message}
        </div>
      )}

      <section className="rounded-[28px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-400">Sell Ticket Requests</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Review and manage ticket resale requests submitted by users.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Review seller submissions, verify request details, and approve or reject them from one place.
            </p>
          </div>
          <button
            type="button"
            onClick={() => fetchRequests()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-sm font-semibold text-white transition hover:border-orange-400/40 hover:bg-slate-900"
          >
            <FiRefreshCcw className="h-4 w-4 text-orange-300" />
            Refresh
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return <StatCard key={item.title} {...item} icon={Icon} />;
        })}
      </section>

      <section className="rounded-[24px] border border-white/10 bg-slate-900/70 p-4 shadow-[0_12px_35px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-3">
            <FiSearch className="h-4 w-4 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search seller or event..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-3 text-sm text-slate-300">
            <FiTag className="h-4 w-4 text-orange-300" />
            <StatusDropdown value={statusFilter} onChange={setStatusFilter} />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-white/10 bg-slate-900/70 shadow-[0_12px_35px_rgba(0,0,0,0.25)]">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-950/80">
              <tr>
                {[
                  "Seller",
                  "Event",
                  "Ticket Qty",
                  "Selling Price",
                  "Status",
                  "Request Date",
                  "Actions",
                ].map((header) => (
                  <th key={header} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10 bg-slate-900/70">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-14">
                    <div className="flex items-center justify-center gap-3 text-sm text-slate-400">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-400/30 border-t-orange-400" />
                      Loading requests...
                    </div>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-16">
                    <EmptyState
                      title="No ticket resale requests found."
                      subtitle="Seller requests will appear here once users submit them."
                    />
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request, index) => (
                  <tr key={request._id || index} className="transition hover:bg-slate-800/70">
                    <td className="px-4 py-3 text-sm text-white">
                      <div className="font-medium">{getSellerName(request)}</div>
                      <div className="mt-1 text-xs text-slate-500">{getSellerEmail(request)}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">{getEventName(request)}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{getTicketQuantity(request)}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{formatCurrency(getSellingPrice(request))}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[getStatus(request)] || statusStyles.Pending}`}>
                        {getStatus(request)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">{formatDate(getRequestDate(request))}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedRequest(request)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-orange-400/40 hover:text-white"
                        >
                          <FiEye className="h-3.5 w-3.5 text-orange-300" />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => updateRequestStatus(request._id, "Approved")}
                          className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-2 text-emerald-300 transition hover:bg-emerald-500/20"
                          aria-label="Approve request"
                        >
                          <FiCheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateRequestStatus(request._id, "Rejected")}
                          className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-2 text-rose-300 transition hover:bg-rose-500/20"
                          aria-label="Reject request"
                        >
                          <FiXCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedRequest && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-sm"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[28px] border border-white/10 bg-slate-900 shadow-[0_20px_120px_rgba(0,0,0,0.6)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-orange-400">Request details</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">
                  {getEventName(selectedRequest) || "Seller request"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="rounded-2xl border border-white/10 bg-slate-950/70 p-2 text-slate-300 transition hover:border-orange-400/40 hover:text-white"
              >
                <FiXCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-[1fr_0.95fr]">
              <div className="space-y-5">
                <div className="rounded-[22px] border border-white/10 bg-slate-950/60 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-400">Seller Information</p>
                      <h3 className="mt-1 text-xl font-semibold text-white">{getSellerName(selectedRequest)}</h3>
                    </div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[getStatus(selectedRequest)] || statusStyles.Pending}`}>
                      {getStatus(selectedRequest)}
                    </span>
                  </div>
                  <div className="mt-4 space-y-3 text-sm">
                    <DetailRow label="Name" value={getSellerName(selectedRequest)} />
                    <DetailRow label="Email" value={getSellerEmail(selectedRequest)} />
                    <DetailRow label="Phone" value={getSellerPhone(selectedRequest)} />
                    <DetailRow label="Location" value={getLocation(selectedRequest)} />
                  </div>
                </div>

                <div className="rounded-[22px] border border-white/10 bg-slate-950/60 p-5">
                  <p className="text-sm text-slate-400">Ticket Information</p>
                  <div className="mt-4 space-y-3 text-sm">
                    <DetailRow label="Event Name" value={getEventName(selectedRequest)} />
                    <DetailRow label="Ticket Quantity" value={getTicketQuantity(selectedRequest)} />
                    <DetailRow label="Original Price" value={formatCurrency(getOriginalPrice(selectedRequest))} />
                    <DetailRow label="Selling Price" value={formatCurrency(getSellingPrice(selectedRequest))} />
                    <DetailRow label="Purchase Date" value={formatDate(getPurchaseDate(selectedRequest))} />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-[22px] border border-white/10 bg-slate-950/60 p-5">
                  <p className="text-sm text-slate-400">Reason for Selling</p>
                  <div className="mt-3 rounded-2xl border border-orange-400/20 bg-orange-500/10 p-4 text-sm leading-6 text-slate-300">
                    {getReason(selectedRequest)}
                  </div>
                </div>

                <div className="rounded-[22px] border border-white/10 bg-slate-950/60 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">Uploaded Ticket Proof</p>
                    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-2 text-orange-300">
                      <FiImage className="h-4 w-4" />
                    </div>
                  </div>
                  {buildProofUrl(selectedRequest.proofFile) ? (
                    <img
                      src={buildProofUrl(selectedRequest.proofFile)}
                      alt="Ticket proof"
                      onClick={() => setPreviewImage(buildProofUrl(selectedRequest.proofFile))}
                      className="mt-4 h-56 w-full cursor-zoom-in rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="mt-4 flex h-56 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-900/70 text-sm text-slate-400">
                      No proof uploaded.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/10 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  updateRequestStatus(selectedRequest._id, "Rejected");
                  setSelectedRequest(null);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20"
              >
                <FiXCircle className="h-4 w-4" />
                Reject
              </button>
              <button
                type="button"
                onClick={() => {
                  updateRequestStatus(selectedRequest._id, "Approved");
                  setSelectedRequest(null);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
              >
                <FiCheckCircle className="h-4 w-4" />
                Approve
              </button>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-white transition hover:border-orange-400/40"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/90 px-4 py-6"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative w-full max-w-4xl">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute right-3 top-3 rounded-full border border-white/10 bg-slate-900/80 p-2 text-white"
            >
              <FiXCircle className="h-5 w-5" />
            </button>
            <img src={previewImage} alt="Proof preview" className="max-h-[80vh] w-full rounded-[24px] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};

export default SellTickets;
