import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Award, CheckCircle2, History, Wrench } from 'lucide-react';
import { formatAppDateTime } from '../../utils/date';

const CreditPoints = () => {
  const [summary, setSummary] = useState({ creditPoints: 0, completedWorks: 0, history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCreditHistory = async () => {
      try {
        const res = await api.get('/complaints/credits');
        setSummary(res.data || { creditPoints: 0, completedWorks: 0, history: [] });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load credit point history.');
      } finally {
        setLoading(false);
      }
    };

    fetchCreditHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center">
          <Award className="w-7 h-7 text-amber-400 mr-2" />
          Credit Points
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Track the points earned from successfully completed maintenance work.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="glass-card rounded-2xl p-6 border border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Credit Points</p>
              <p className="text-3xl font-extrabold text-white mt-1">
                {loading ? '...' : summary.creditPoints}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Works</p>
              <p className="text-3xl font-extrabold text-white mt-1">
                {loading ? '...' : summary.completedWorks}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">Each successful completion earns 20 points.</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <div className="flex items-center mb-4">
          <History className="w-5 h-5 text-blue-400 mr-2" />
          <div>
            <h2 className="text-lg font-bold text-white">Credit Points History</h2>
            <p className="text-xs text-slate-400">Completed work orders that generated your points.</p>
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-slate-400 text-sm">Loading credit history...</div>
        ) : summary.history.length === 0 ? (
          <div className="py-10 text-center">
            <Wrench className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No completed work has generated credit points yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Work Order</th>
                  <th className="p-3">Street Light</th>
                  <th className="p-3">Area</th>
                  <th className="p-3">Completed On</th>
                  <th className="p-3 text-right">Points Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {summary.history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-white">#{item.complaint_id}</td>
                    <td className="p-3 font-mono text-amber-400">{item.pole_number}</td>
                    <td className="p-3 text-slate-300">{item.area}</td>
                    <td className="p-3 text-slate-400">{formatAppDateTime(item.completed_at)}</td>
                    <td className="p-3 text-right font-bold text-emerald-400">+{item.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditPoints;
