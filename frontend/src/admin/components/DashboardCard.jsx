const DashboardCard = ({ title, value, icon: Icon, trend, accent = "slate" }) => {
  const accentStyles = {
    orange: "from-orange-500/20 to-orange-500/5 text-orange-300",
    slate: "from-slate-700/40 to-slate-800/20 text-slate-300",
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-black/20">
      <div className={`inline-flex rounded-2xl bg-gradient-to-br ${accentStyles[accent]} p-3`}>
        <Icon className="text-xl" />
      </div>
      <p className="mt-4 text-sm text-slate-400">{title}</p>
      <div className="mt-2 flex items-end justify-between">
        <h3 className="text-2xl font-semibold text-white">{value}</h3>
        <span className="text-sm font-medium text-orange-300">{trend}</span>
      </div>
    </div>
  );
};

export default DashboardCard;
