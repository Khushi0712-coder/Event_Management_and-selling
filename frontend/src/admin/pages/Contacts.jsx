import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiArrowRight,
  FiMail,
  FiPlus,
  FiRefreshCcw,
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiTrash2,
} from "react-icons/fi";
import { isThisMonth, isThisWeek, isToday } from "date-fns";
import api from "../../services/api";
import ContactDetails from "../components/ContactDetails";
import ContactListItem from "../components/ContactListItem";

const FILTER_OPTIONS = ["All", "Unread", "Read", "Replied", "Pending"];
const PRIORITY_OPTIONS = ["All", "Normal", "Important", "Urgent"];
const DATE_OPTIONS = ["All time", "Today", "This week", "This month"];
const SORT_OPTIONS = ["Newest", "Oldest", "Unread first", "Priority"];

const getInitialMetadata = (contacts) => {
  return contacts.reduce((memo, item) => {
    const read = item.read ?? false;
    const status = item.status || (read ? "Read" : "Unread");
    memo[item._id] = {
      read,
      status,
      priority: item.priority || "Normal",
      replied: item.status === "Replied" || item.replied === true || false,
    };
    return memo;
  }, {});
};

const getPriorityWeight = (priority) => {
  if (priority === "Urgent") return 0;
  if (priority === "Important") return 1;
  return 2;
};

const getContactSubject = (contact) => {
  if (contact.subject) return contact.subject;
  if (!contact.message) return "No subject";
  return contact.message.split("\n")[0].slice(0, 68) || "No subject";
};

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [metadata, setMetadata] = useState({});
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All time");
  const [sortBy, setSortBy] = useState("Newest");
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [deletePrompt, setDeletePrompt] = useState(null);
  const [toast, setToast] = useState(null);

  const replySupported = false;

  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/api/contact/admin");
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setContacts(data);
      setMetadata(getInitialMetadata(data));
      setSelectedContactId(data[0]?._id || null);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load messages. Please try again.");
      setContacts([]);
      setMetadata({});
      setSelectedContactId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const showToast = (type, message) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 2600);
  };

  const updateMetadata = (id, patch) => {
    setMetadata((current) => ({
      ...current,
      [id]: {
        ...(current[id] || { read: false, status: "Unread", priority: "Normal", replied: false }),
        ...patch,
      },
    }));
  };

  const contactsWithMeta = useMemo(
    () =>
      contacts.map((contact) => ({
        ...contact,
        meta: metadata[contact._id] || { read: false, status: "Unread", priority: "Normal", replied: false },
      })),
    [contacts, metadata],
  );

  const filteredContacts = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return contactsWithMeta
      .filter((contact) => {
        const raw = `${contact.name || ""} ${contact.email || ""} ${contact.subject || contact.message || ""}`.toLowerCase();
        const matchesSearch = !term || raw.includes(term);
        if (!matchesSearch) return false;

        const status = contact.meta.status || "Unread";
        if (statusFilter !== "All" && status !== statusFilter) return false;

        const priority = contact.meta.priority || "Normal";
        if (priorityFilter !== "All" && priority !== priorityFilter) return false;

        const created = new Date(contact.createdAt);
        if (dateFilter === "Today" && !isToday(created)) return false;
        if (dateFilter === "This week" && !isThisWeek(created, { weekStartsOn: 1 })) return false;
        if (dateFilter === "This month" && !isThisMonth(created)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "Newest") return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === "Oldest") return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortBy === "Unread first") {
          const aUnread = a.meta.status === "Unread" ? 0 : 1;
          const bUnread = b.meta.status === "Unread" ? 0 : 1;
          if (aUnread !== bUnread) return aUnread - bUnread;
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        if (sortBy === "Priority") {
          const diff = getPriorityWeight(a.meta.priority) - getPriorityWeight(b.meta.priority);
          return diff || new Date(b.createdAt) - new Date(a.createdAt);
        }
        return 0;
      });
  }, [contactsWithMeta, dateFilter, priorityFilter, searchQuery, sortBy, statusFilter]);

  useEffect(() => {
    if (!selectedContactId && filteredContacts.length > 0) {
      setSelectedContactId(filteredContacts[0]._id);
    }
    if (selectedContactId && !filteredContacts.some((item) => item._id === selectedContactId)) {
      setSelectedContactId(filteredContacts[0]?._id || null);
    }
  }, [filteredContacts, selectedContactId]);

  const activeContact = useMemo(
    () => contacts.find((item) => item._id === selectedContactId) || filteredContacts[0] || null,
    [contacts, filteredContacts, selectedContactId],
  );

  const stats = useMemo(() => {
    const total = contacts.length;
    const unread = contactsWithMeta.filter((item) => item.meta.status === "Unread").length;
    const replied = contactsWithMeta.filter((item) => item.meta.status === "Replied").length;
    const today = contactsWithMeta.filter((item) => isToday(new Date(item.createdAt))).length;
    return { total, unread, replied, today };
  }, [contactsWithMeta, contacts]);

  const customerThreadInfo = useMemo(() => {
    if (!activeContact) return null;
    const thread = contacts.filter((item) => item.email === activeContact.email);
    const lastContact = thread.reduce((latest, item) => {
      const current = new Date(item.createdAt);
      return current > latest ? current : latest;
    }, new Date(activeContact.createdAt));
    return {
      messages: thread.length,
      lastContact: lastContact.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    };
  }, [activeContact, contacts]);

  const selectedCount = selectedIds.length;

  const handleSelectOne = (id, checked) => {
    setSelectedIds((current) => {
      if (checked) {
        return current.includes(id) ? current : [...current, id];
      }
      return current.filter((item) => item !== id);
    });
  };

  const handleToggleAll = () => {
    if (selectedIds.length === filteredContacts.length) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(filteredContacts.map((item) => item._id));
  };

  const handleBulkUpdate = (patch, message) => {
    setMetadata((current) => {
      const next = { ...current };
      selectedIds.forEach((id) => {
        next[id] = {
          ...(next[id] || { read: false, status: "Unread", priority: "Normal", replied: false }),
          ...patch,
        };
      });
      return next;
    });
    showToast("success", message);
  };

  const handleDelete = (ids) => {
    setDeletePrompt({ ids, title: "Delete this message?", description: "This conversation will be permanently removed." });
  };

  const confirmDelete = () => {
    if (!deletePrompt) return;
    setContacts((current) => current.filter((item) => !deletePrompt.ids.includes(item._id)));
    setMetadata((current) => {
      const next = { ...current };
      deletePrompt.ids.forEach((id) => delete next[id]);
      return next;
    });
    setSelectedIds((current) => current.filter((id) => !deletePrompt.ids.includes(id)));
    if (deletePrompt.ids.includes(selectedContactId)) {
      setSelectedContactId(null);
    }
    showToast("success", `${deletePrompt.ids.length} message${deletePrompt.ids.length === 1 ? "" : "s"} deleted.`);
    setDeletePrompt(null);
  };

  const handleReplySend = async () => {
    if (!activeContact) return;
    if (!replyText.trim()) return;
    if (!replySupported) {
      showToast("error", "Reply support is not available in the current API.");
      return;
    }
    try {
      setReplySending(true);
      await api.post(`/api/contact/${activeContact._id}/reply`, { body: replyText });
      showToast("success", "Reply sent successfully.");
      setReplyText("");
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Unable to send reply.");
    } finally {
      setReplySending(false);
    }
  };

  const renderToolbar = () => (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-black/20">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium uppercase tracking-[0.35em] text-orange-400">Contacts</p>
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Contact inbox</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-400">
            Manage customer inquiries, support requests and contact messages from one place.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-2 text-sm text-orange-300">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
            Inbox connected
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => showToast("info", "Compose is coming soon for admin replies.")}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-2 text-sm font-semibold text-white transition hover:border-orange-400/30 hover:bg-orange-500/10"
          >
            <FiPlus className="h-4 w-4 text-orange-300" />
            Compose
          </button>
          <button
            type="button"
            onClick={loadContacts}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-2 text-sm font-semibold text-white transition hover:border-orange-400/30 hover:bg-orange-500/10"
          >
            <FiRefreshCcw className="h-4 w-4 text-orange-300" />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[
        { label: "Total Messages", value: stats.total, accent: "orange", icon: FiMail },
        { label: "Unread", value: stats.unread, accent: "slate", icon: FiMail },
        { label: "Replied", value: stats.replied, accent: "slate", icon: FiArrowRight },
        { label: "Today", value: stats.today, accent: "slate", icon: FiRefreshCcw },
      ].map((item) => (
        <div
          key={item.label}
          className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:border-orange-400/20"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/70 text-orange-300">
              <item.icon className="h-5 w-5" />
            </span>
            <span className="rounded-full border border-white/10 bg-slate-950/70 px-2.5 py-1.5 text-xs uppercase tracking-[0.25em] text-slate-400">
              {item.label}
            </span>
          </div>
          <p className="mt-6 text-4xl font-semibold text-white">{item.value}</p>
          <p className="mt-2 text-sm text-slate-400">{item.label} from inbox</p>
        </div>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center shadow-2xl shadow-black/20">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950/80 text-orange-300">
        <FiMail className="h-7 w-7" />
      </div>
      <h2 className="mt-6 text-2xl font-semibold text-white">No messages yet</h2>
      <p className="mt-3 text-sm text-slate-400">
        Customer inquiries will appear here when someone contacts you.
      </p>
      <button
        type="button"
        onClick={loadContacts}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-2 text-sm font-semibold text-white transition hover:border-orange-400/30 hover:bg-orange-500/10"
      >
        <FiRefreshCcw className="h-4 w-4 text-orange-300" />
        Refresh inbox
      </button>
    </div>
  );

  const renderNoResults = () => (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center shadow-2xl shadow-black/20">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950/80 text-orange-300">
        <FiFilter className="h-7 w-7" />
      </div>
      <h2 className="mt-6 text-2xl font-semibold text-white">No matching messages</h2>
      <p className="mt-3 text-sm text-slate-400">
        Try changing your filters or search query.
      </p>
      <button
        type="button"
        onClick={() => {
          setStatusFilter("All");
          setPriorityFilter("All");
          setDateFilter("All time");
          setSearchQuery("");
        }}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-2 text-sm font-semibold text-white transition hover:border-orange-400/30 hover:bg-orange-500/10"
      >
        Clear filters
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderToolbar()}

      {loading ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-32 animate-pulse rounded-3xl border border-white/10 bg-slate-900/70 p-5" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-black/20">
              <div className="mb-4 h-12 animate-pulse rounded-2xl bg-slate-950/80" />
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="mb-3 h-24 animate-pulse rounded-3xl bg-slate-950/80" />
              ))}
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-black/20">
              <div className="mb-4 h-12 animate-pulse rounded-2xl bg-slate-950/80" />
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-14 animate-pulse rounded-2xl bg-slate-950/80" />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6 shadow-2xl shadow-black/20">
          <h2 className="text-xl font-semibold text-white">Unable to load messages</h2>
          <p className="mt-2 text-sm text-slate-200">Something went wrong while loading the contact inbox.</p>
          <button
            type="button"
            onClick={loadContacts}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-2 text-sm font-semibold text-white transition hover:border-orange-400/30 hover:bg-orange-500/10"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {renderStats()}

          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.95fr]">
            <section className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-black/20">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-400">Inbox</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Messages</h2>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative min-w-[220px]">
                    <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-400" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search messages, name or email..."
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/80 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-orange-400/30 focus:ring-2 focus:ring-orange-400/10"
                    />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-3 text-sm text-white outline-none transition focus:border-orange-400/30 focus:ring-2 focus:ring-orange-400/10"
                    >
                      {FILTER_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-3 text-sm text-white outline-none transition focus:border-orange-400/30 focus:ring-2 focus:ring-orange-400/10"
                    >
                      {PRIORITY_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-3 text-sm text-white outline-none transition focus:border-orange-400/30 focus:ring-2 focus:ring-orange-400/10"
                    >
                      {DATE_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-950/50 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === filteredContacts.length}
                      onChange={handleToggleAll}
                      className="h-4 w-4 cursor-pointer rounded border-white/20 bg-slate-900 text-orange-500 focus:ring-2 focus:ring-orange-400/20"
                    />
                    Select all
                  </label>
                  <span>{filteredContacts.length} messages found</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-3 text-sm text-white outline-none transition focus:border-orange-400/30 focus:ring-2 focus:ring-orange-400/10"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {selectedCount > 0 && (
                    <div className="inline-flex flex-wrap items-center gap-2 rounded-2xl border border-orange-400/25 bg-orange-500/10 px-3 py-2 text-sm text-orange-200">
                      <span>{selectedCount} selected</span>
                      <button
                        type="button"
                        onClick={() => handleBulkUpdate({ read: true, status: "Read" }, "Marked selected messages as read.")}
                        className="rounded-full bg-slate-950/80 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-900/95"
                      >
                        Mark read
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBulkUpdate({ read: false, status: "Unread" }, "Marked selected messages as unread.")}
                        className="rounded-full bg-slate-950/80 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-900/95"
                      >
                        Mark unread
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(selectedIds)}
                        className="rounded-full bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {filteredContacts.length === 0 ? (
                renderNoResults()
              ) : (
                <div className="space-y-3">
                  {filteredContacts.map((contact) => (
                    <ContactListItem
                      key={contact._id}
                      contact={contact}
                      metadata={contact.meta}
                      selected={selectedIds.includes(contact._id)}
                      active={activeContact?._id === contact._id}
                      onSelect={handleSelectOne}
                      onClick={() => setSelectedContactId(contact._id)}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div className="hidden lg:block">
                <ContactDetails
                  contact={activeContact}
                  metadata={activeContact ? metadata[activeContact._id] : null}
                  customerInfo={customerThreadInfo}
                  onClose={() => setSelectedContactId(null)}
                  onMarkRead={() => activeContact && updateMetadata(activeContact._id, { read: !metadata[activeContact._id]?.read, status: metadata[activeContact._id]?.read ? "Unread" : "Read" })}
                  onMarkReplied={() => activeContact && updateMetadata(activeContact._id, { replied: true, status: "Replied" })}
                  onPriorityChange={(value) => activeContact && updateMetadata(activeContact._id, { priority: value })}
                  onDelete={() => activeContact && handleDelete([activeContact._id])}
                  replyText={replyText}
                  onReplyChange={setReplyText}
                  onReplySend={handleReplySend}
                  replySending={replySending}
                  replySupported={replySupported}
                />
              </div>

              {activeContact && (
                <div className="lg:hidden">
                  <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-2xl shadow-black/20">
                    <button
                      type="button"
                      onClick={() => setSelectedContactId(null)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white transition hover:border-orange-400/30 hover:bg-orange-500/10"
                    >
                      <FiChevronLeft className="h-4 w-4 text-orange-300" />
                      Back to inbox
                    </button>
                  </div>
                  <div className="mt-4">
                    <ContactDetails
                      contact={activeContact}
                      metadata={activeContact ? metadata[activeContact._id] : null}
                      customerInfo={customerThreadInfo}
                      onClose={() => setSelectedContactId(null)}
                      onMarkRead={() => activeContact && updateMetadata(activeContact._id, { read: !metadata[activeContact._id]?.read, status: metadata[activeContact._id]?.read ? "Unread" : "Read" })}
                      onMarkReplied={() => activeContact && updateMetadata(activeContact._id, { replied: true, status: "Replied" })}
                      onPriorityChange={(value) => activeContact && updateMetadata(activeContact._id, { priority: value })}
                      onDelete={() => activeContact && handleDelete([activeContact._id])}
                      replyText={replyText}
                      onReplyChange={setReplyText}
                      onReplySend={handleReplySend}
                      replySending={replySending}
                      replySupported={replySupported}
                    />
                  </div>
                </div>
              )}
            </section>
          </div>
        </>
      )}

      {toast && (
        <div className="fixed right-4 top-6 z-50 rounded-3xl border border-white/10 bg-slate-950/95 px-4 py-3 text-sm text-white shadow-2xl shadow-black/50">
          {toast.message}
        </div>
      )}

      {deletePrompt && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/90 px-4 py-6">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-slate-900/95 p-6 shadow-2xl shadow-black/40">
            <h3 className="text-xl font-semibold text-white">{deletePrompt.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">{deletePrompt.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setDeletePrompt(null)}
                className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-2 text-sm font-semibold text-white transition hover:border-orange-400/30 hover:bg-orange-500/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400/90"
              >
                Delete Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
