import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowUpRight, FiCalendar, FiCreditCard, FiMessageSquare, FiUsers, FiDollarSign } from "react-icons/fi";
import DashboardCard from "../components/DashboardCard";
import Charts from "../components/Charts";
import Table from "../components/Table";
import api from "../../services/api";
import { clearToken, isValidAdminSession } from "../../services/auth";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isValidAdminSession()) {
      clearToken();
      navigate("/login", { replace: true });
      return;
    }

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/api/admin/dashboard");
        setDashboardData(response.data);
      } catch (err) {
        const message = err?.response?.data?.message || err.message || "Unable to load dashboard data";
        setError(message);

        if (err?.response?.status === 401) {
          clearToken();
          navigate("/login", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  const stats = useMemo(() => {
    if (!dashboardData) {
      return [
        { title: "Total Users", value: "--", icon: FiUsers, trend: "Loading" },
        { title: "Total Events", value: "--", icon: FiCalendar, trend: "Loading" },
        { title: "Total Bookings", value: "--", icon: FiCreditCard, trend: "Loading" },
        { title: "Total Revenue", value: "--", icon: FiDollarSign, trend: "Loading" },
        { title: "Pending Requests", value: "--", icon: FiMessageSquare, trend: "Loading" },
      ];
    }

    return [
      { title: "Total Users", value: dashboardData.totalUsers.toLocaleString(), icon: FiUsers, trend: "+12.3%" },
      { title: "Total Events", value: dashboardData.totalEvents.toLocaleString(), icon: FiCalendar, trend: "+8.2%" },
      { title: "Total Bookings", value: dashboardData.totalBookings.toLocaleString(), icon: FiCreditCard, trend: "+24.1%" },
      { title: "Total Revenue", value: `$${dashboardData.totalRevenue.toLocaleString()}`, icon: FiDollarSign, trend: "+18.6%" },
      { title: "Pending Requests", value: dashboardData.pendingSellTickets.toLocaleString(), icon: FiMessageSquare, trend: "Needs review" },
    ];
  }, [dashboardData]);

  const recentBookings = useMemo(() => {
    if (!dashboardData?.recentBookings?.length) {
      return [];
    }

    return dashboardData.recentBookings.map((booking) => ({
      customer: booking.user?.name || "Unknown user",
      event: booking.eventName,
      tickets: booking.ticketCount,
      amount: `$${booking.totalPrice}`,
      date: new Date(booking.createdAt).toLocaleDateString(),
    }));
  }, [dashboardData]);

  const pendingSellTickets = useMemo(() => {
    if (!dashboardData?.recentSellTickets?.length) {
      return [];
    }

    return dashboardData.recentSellTickets.map((ticket) => ({
      customer: ticket.user?.name || "Unknown user",
      event: ticket.eventName,
      price: `$${ticket.expectedPrice}`,
      status: ticket.status,
    }));
  }, [dashboardData]);

  const recentMessages = useMemo(() => {
    if (!dashboardData?.recentContacts?.length) {
      return [];
    }

    return dashboardData.recentContacts.map((contact) => ({
      sender: contact.name,
      subject: contact.message,
      time: new Date(contact.createdAt).toLocaleDateString(),
    }));
  }, [dashboardData]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-orange-400">Admin Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Welcome back, Admin</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Monitor bookings, manage events, and keep your audience engagement growing with a seamless control center.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-300">
            <FiArrowUpRight /> This week is trending 16% above target
          </div>
        </div>
      </div>

      {loading && (
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center text-slate-300 shadow-2xl shadow-black/20">
          Loading dashboard data...
        </div>
      )}

      {error && !loading && (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && dashboardData && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {stats.map((item, index) => (
              <DashboardCard
                key={item.title}
                title={item.title}
                value={item.value}
                icon={item.icon}
                trend={item.trend}
                accent={index === 0 ? "orange" : "slate"}
              />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
            <Charts />
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Audience Pulse</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">Peak booking hours</h2>
                </div>
                <span className="rounded-full bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-300">7 PM</span>
              </div>
              <div className="mt-6 space-y-4">
                {[
                  { label: "Morning", value: "42%" },
                  { label: "Afternoon", value: "68%" },
                  { label: "Evening", value: "84%" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
                      <span>{item.label}</span>
                      <span className="font-semibold text-white">{item.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                        style={{ width: item.value }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20 xl:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Operations</p>
                  <h2 className="text-xl font-semibold text-white">Recent bookings</h2>
                </div>
                <button className="text-sm font-medium text-orange-400">View all</button>
              </div>
              {recentBookings.length ? (
                <Table
                  headers={["Customer", "Event", "Tickets", "Amount", "Date"]}
                  rows={recentBookings}
                  renderRow={(row) => (
                    <>
                      <td className="px-4 py-3 text-sm text-white">{row.customer}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{row.event}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{row.tickets}</td>
                      <td className="px-4 py-3 text-sm text-orange-300">{row.amount}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{row.date}</td>
                    </>
                  )}
                />
              ) : (
                <p className="text-sm text-slate-400">No recent bookings yet.</p>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Sell tickets</p>
                    <h2 className="text-xl font-semibold text-white">Pending requests</h2>
                  </div>
                </div>
                <div className="space-y-3">
                  {pendingSellTickets.length ? (
                    pendingSellTickets.map((item) => (
                      <div key={`${item.customer}-${item.event}`} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">{item.customer}</p>
                            <p className="text-xs text-slate-400">{item.event}</p>
                          </div>
                          <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300">{item.status}</span>
                        </div>
                        <p className="mt-2 text-sm text-orange-300">{item.price}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">No sell ticket requests.</p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Inbox</p>
                    <h2 className="text-xl font-semibold text-white">Latest contacts</h2>
                  </div>
                </div>
                <div className="space-y-3">
                  {recentMessages.length ? (
                    recentMessages.map((item) => (
                      <div key={`${item.sender}-${item.subject}`} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-white">{item.sender}</p>
                          <span className="text-xs text-slate-400">{item.time}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">{item.subject}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">No contact messages yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
