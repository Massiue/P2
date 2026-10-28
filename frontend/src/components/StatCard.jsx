import React from 'react';

const StatCard = ({ title, value, icon: Icon, color, subtext }) => {
  const colorMap = {
    yellow: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/30',
    blue: 'from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/30',
    green: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30',
    purple: 'from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/30',
    red: 'from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/30',
  };

  const selectedColor = colorMap[color] || colorMap.blue;

  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 border bg-gradient-to-br ${selectedColor} glass-card transition-all duration-300 hover:scale-[1.02]`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-3xl font-extrabold text-white mt-1">{value}</h3>
          {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
