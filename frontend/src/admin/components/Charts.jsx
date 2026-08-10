const Charts = () => {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">Performance</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Revenue overview</h2>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-300">+18.2%</span>
      </div>

      <div className="mt-6 flex h-56 items-end gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        {[42, 68, 54, 82, 76, 92, 110].map((height, index) => (
          <div key={index} className="flex-1 rounded-t-2xl bg-gradient-to-t from-orange-600 to-amber-400" style={{ height: `${height}%` }} />
        ))}
      </div>
    </div>
  );
};

export default Charts;
