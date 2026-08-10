import { FiChevronRight } from "react-icons/fi";

const getInitials = (name = "User") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const formatPreview = (contact) => {
  const raw = contact.subject || contact.message || "";
  const subject = contact.subject || raw.slice(0, 60).trim();
  const preview = raw.slice(subject.length).trim().replace(/\s+/g, " ").slice(0, 64);
  return preview;
};

const statusStyles = {
  Unread: "bg-orange-500/10 text-orange-200 border-orange-500/15",
  Read: "bg-slate-700/70 text-slate-200 border-white/10",
  Replied: "bg-emerald-500/10 text-emerald-200 border-emerald-400/15",
  Pending: "bg-amber-500/10 text-amber-200 border-amber-400/15",
};

const priorityStyles = {
  Normal: "bg-slate-700/70 text-slate-100 border-white/10",
  Important: "bg-orange-500/10 text-orange-200 border-orange-400/15",
  Urgent: "bg-rose-500/10 text-rose-200 border-rose-400/15",
};

const ContactListItem = ({ contact, metadata = {}, selected, onSelect, onClick, active }) => {
  const status = metadata.status || (metadata.read ? "Read" : "Unread");
  const priority = metadata.priority || "Normal";
  const unread = status === "Unread";
  const preview = formatPreview(contact);
  const date = contact.createdAt ? new Date(contact.createdAt) : null;
  const formattedDate = date
    ? date.toLocaleDateString("en-US", { month: "short", day: "2-digit" })
    : "--";

  return (
    <div
      onClick={onClick}
      className={`group flex cursor-pointer items-start gap-4 rounded-3xl border border-white/10 p-4 text-left transition duration-200 ${
        active
          ? "bg-slate-800/80 ring-1 ring-orange-400/20"
          : unread
          ? "bg-slate-900/80 hover:bg-slate-900/95"
          : "bg-slate-950/70 hover:bg-slate-900/90"
      }`}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(contact._id, e.target.checked);
          }}
          className="h-4 w-4 cursor-pointer rounded border-white/20 bg-slate-900 text-orange-500 focus:ring-2 focus:ring-orange-400/20"
        />
      </div>

      <div className="flex h-full w-full items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-3xl bg-slate-950/80 text-base font-semibold uppercase text-white">
          {getInitials(contact.name)}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={`truncate text-sm ${unread ? "font-semibold text-white" : "text-slate-300"}`}>
                {contact.name || "Unknown user"}
              </p>
              <p className="truncate text-xs text-slate-500">{contact.email || "No email"}</p>
            </div>
            <span className="whitespace-nowrap text-xs font-medium text-slate-400">{formattedDate}</span>
          </div>

          <div>
            <p className={`truncate text-sm ${unread ? "font-semibold text-white" : "text-slate-300"}`}>
              {getInitials(contact.name)} {contact.subject || contact.message?.slice(0, 48) || "No subject"}
            </p>
            {preview ? <p className="mt-1 truncate text-sm text-slate-500">{preview}</p> : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${statusStyles[status] || statusStyles.Read}`}>
              {status}
            </span>
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${priorityStyles[priority] || priorityStyles.Normal}`}>
              {priority}
            </span>
          </div>
        </div>

        <FiChevronRight className="mt-2 h-4 w-4 text-slate-500 transition group-hover:text-orange-300" />
      </div>
    </div>
  );
};

export default ContactListItem;
