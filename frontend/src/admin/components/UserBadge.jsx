const UserBadge = ({ label, variant = "default" }) => {
  const base = "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide uppercase";
  const styles = {
    admin: "bg-orange-500/15 text-orange-200 border border-orange-400/15",
    user: "bg-slate-700/70 text-slate-100 border border-white/10",
    manager: "bg-emerald-500/15 text-emerald-200 border border-emerald-400/15",
    active: "bg-emerald-500/10 text-emerald-200 border border-emerald-400/15",
    pending: "bg-amber-500/10 text-amber-200 border border-amber-400/15",
    suspended: "bg-rose-500/10 text-rose-200 border border-rose-400/15",
    blocked: "bg-rose-500/10 text-rose-200 border border-rose-400/15",
    default: "bg-slate-700/70 text-slate-100 border border-white/10",
  };

  return <span className={`${base} ${styles[variant] || styles.default}`}>{label}</span>;
};

export default UserBadge;
