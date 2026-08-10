import { FiUsers, FiShield, FiLayers, FiStar } from "react-icons/fi";

const UserStats = ({ totals }) => {
  const cards = [
    {
      title: "Total users",
      value: totals.totalUsers,
      description: "All registered accounts",
      icon: FiUsers,
      accent: "text-orange-300",
    },
    {
      title: "Admin users",
      value: totals.adminUsers,
      description: "Privileged access",
      icon: FiShield,
      accent: "text-emerald-300",
    },
    {
      title: "Regular users",
      value: totals.regularUsers,
      description: "Standard accounts",
      icon: FiLayers,
      accent: "text-slate-300",
    },
    {
      title: "Other roles",
      value: totals.otherRoles,
      description: "Custom or unsupported roles",
      icon: FiStar,
      accent: "text-violet-300",
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ title, value, description, icon: Icon, accent }) => (
        <article
          key={title}
          className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.2)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{title}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
            </div>
            <div className={`rounded-3xl border border-white/10 bg-slate-950/80 p-3 ${accent}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-400">{description}</p>
        </article>
      ))}
    </section>
  );
};

export default UserStats;
