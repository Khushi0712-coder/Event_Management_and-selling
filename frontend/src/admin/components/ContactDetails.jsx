import {
  FiCheckCircle,
  FiMail,
  FiPhone,
  FiSend,
  FiTrash2,
  FiX,
} from "react-icons/fi";

const priorityOptions = ["Normal", "Important", "Urgent"];

const formatDateTime = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ContactDetails = ({
  contact,
  metadata = {},
  customerInfo,
  onClose,
  onMarkRead,
  onMarkReplied,
  onPriorityChange,
  onDelete,
  replyText,
  onReplyChange,
  onReplySend,
  replySending,
  replySupported,
}) => {
  if (!contact) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
        <div className="h-full min-h-[360px]">
          <p className="text-sm font-medium uppercase tracking-[0.35em] text-orange-400">Message details</p>
          <h2 className="mt-4 text-2xl font-semibold text-white">Choose a conversation</h2>
          <p className="mt-3 text-sm text-slate-400">
            Select a message from the inbox to review the full details and reply.
          </p>
        </div>
      </div>
    );
  }

  const status = metadata.status || (metadata.read ? "Read" : "Unread");
  const priority = metadata.priority || "Normal";
  const subject = contact.subject || contact.message?.split("\n")[0]?.slice(0, 72) || "No subject";
  const content = contact.message || "No message content provided.";

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950/80 text-2xl font-semibold text-white">
            {contact.name?.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "US"}
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.35em] text-orange-400">Customer</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{contact.name || "Unknown user"}</h2>
            <p className="mt-1 text-sm text-slate-400">{contact.email || "No email provided"}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-2 text-sm font-semibold text-white transition hover:border-orange-400/30 hover:bg-orange-500/10"
        >
          <FiX className="h-4 w-4 text-orange-300" /> Close
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-[1.18fr_0.82fr]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">Status</p>
                <p className="mt-2 text-lg font-semibold text-white">{status}</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-sm font-semibold text-slate-200">
                <FiCheckCircle className="h-4 w-4 text-orange-300" /> {priority}
              </span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onMarkRead}
                className="rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm font-semibold text-white transition hover:border-orange-400/30 hover:bg-orange-500/10"
              >
                {metadata.read ? "Mark unread" : "Mark read"}
              </button>
              <button
                type="button"
                onClick={onMarkReplied}
                className="rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm font-semibold text-white transition hover:border-orange-400/30 hover:bg-orange-500/10"
              >
                Mark replied
              </button>
              <select
                value={priority}
                onChange={(e) => onPriorityChange(e.target.value)}
                className="rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition hover:border-orange-400/30 focus:border-orange-400/30 focus:ring-2 focus:ring-orange-400/10"
              >
                {priorityOptions.map((option) => (
                  <option key={option} value={option} className="bg-slate-900 text-white">
                    {option}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={onDelete}
                className="ml-auto rounded-2xl bg-rose-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-400/90"
              >
                <FiTrash2 className="mr-2 inline h-4 w-4" /> Delete
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
            <p className="text-sm font-medium uppercase tracking-[0.35em] text-orange-400">Subject</p>
            <h3 className="mt-3 text-xl font-semibold text-white">{subject}</h3>
            <div className="mt-6 space-y-4 rounded-3xl bg-slate-900/80 p-4 text-sm leading-7 text-slate-200">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <FiMail className="h-4 w-4 text-orange-300" />
                <span>Message received</span>
              </div>
              <p>{content}</p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Received</p>
                <p className="mt-2 text-sm font-medium text-white">{formatDateTime(contact.createdAt)}</p>
              </div>
              <div className="rounded-2xl bg-slate-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Message ID</p>
                <p className="mt-2 truncate text-sm font-medium text-white">{contact._id}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.35em] text-orange-400">Reply</p>
                <p className="mt-2 text-sm text-slate-400">Write a response for the customer.</p>
              </div>
              <span className="text-xs uppercase tracking-[0.35em] text-slate-500">{replyText.length}/1200</span>
            </div>
            <textarea
              value={replyText}
              onChange={(e) => onReplyChange(e.target.value)}
              rows={5}
              placeholder="Write your reply..."
              className="mt-4 w-full resize-none rounded-3xl border border-white/10 bg-slate-900/80 p-4 text-sm text-white outline-none transition focus:border-orange-400/30 focus:ring-2 focus:ring-orange-400/10"
            />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">{replySupported ? "Send a timely response to the customer." : "Reply support is not available in the current API."}</p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onReplyChange("")}
                  className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-2 text-sm font-semibold text-white transition hover:border-orange-400/30 hover:bg-orange-500/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onReplySend}
                  disabled={!replyText.trim() || replySending || !replySupported}
                  className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-orange-500/40"
                >
                  <FiSend className="h-4 w-4" />
                  {replySending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
            <p className="text-sm font-medium uppercase tracking-[0.35em] text-orange-400">Customer information</p>
            <div className="mt-5 space-y-4">
              <div className="rounded-3xl bg-slate-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Name</p>
                <p className="mt-1 text-sm font-medium text-white">{contact.name || "Not available"}</p>
              </div>
              <div className="rounded-3xl bg-slate-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Email</p>
                <p className="mt-1 text-sm font-medium text-white">{contact.email || "Not available"}</p>
              </div>
              <div className="rounded-3xl bg-slate-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Phone</p>
                <p className="mt-1 text-sm font-medium text-white">{contact.phone || "Not available"}</p>
              </div>
              <div className="rounded-3xl bg-slate-900/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Previous messages</p>
                  <span className="rounded-full bg-slate-800/80 px-2.5 py-1 text-xs font-semibold uppercase text-slate-300">{customerInfo?.messages ?? 1}</span>
                </div>
                <p className="mt-3 text-sm text-slate-400">Last contacted {customerInfo?.lastContact || "Not available"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
            <p className="text-sm font-medium uppercase tracking-[0.35em] text-orange-400">Quick actions</p>
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={onMarkRead}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-left text-sm font-semibold text-white transition hover:border-orange-400/30 hover:bg-orange-500/10"
              >
                {metadata.read ? "Mark unread" : "Mark read"}
              </button>
              <button
                type="button"
                onClick={onMarkReplied}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-left text-sm font-semibold text-white transition hover:border-orange-400/30 hover:bg-orange-500/10"
              >
                Mark replied
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="w-full rounded-2xl bg-rose-500 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-rose-400/90"
              >
                Delete message
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ContactDetails;
