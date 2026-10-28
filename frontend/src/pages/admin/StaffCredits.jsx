import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Award, CheckCircle2, History } from 'lucide-react';
import { formatAppDateTime } from '../../utils/date';

const StaffCredits = () => {
  const [staffCredits, setStaffCredits] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStaffCredits = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          api.get('/complaints/stats'),
          api.get('/complaints/credits')
        ]);
        setStaffCredits(statsRes.data.stats?.staffCredits || []);
        setHistory(historyRes.data.history || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load staff credit points.');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffCredits();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center">
          <Award className="w-7 h-7 text-amber-400 mr-2" />
          Staff Credit Points
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review completed works and credit points earned by each maintenance staff member.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      <div className="glass-card rounded-2xl p-6 border border-amber-500/20">
        <div className="flex items-center mb-4">
          <Award className="w-5 h-5 text-amber-400 mr-2" />
          <div>
            <h2 className="text-lg font-bold text-white">Staff Credit Summary</h2>
            <p className="text-xs text-slate-400">Each successfully completed work earns exactly 20 points.</p>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-sm">Loading staff credit points...</div>
        ) : staffCredits.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">No maintenance staff found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Staff Name</th>
                  <th className="p-3">Completed Works</th>
                  <th className="p-3 text-right">Total Credit Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {staffCredits.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-white">{staff.name}</td>
                    <td className="p-3 text-slate-300">{staff.completed_works}</td>
                    <td className="p-3 text-right font-bold text-amber-400">{staff.credit_points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <div className="flex items-center mb-4">
          <History className="w-5 h-5 text-blue-400 mr-2" />
          <div>
            <h2 className="text-lg font-bold text-white">Credit Points History</h2>
            <p className="text-xs text-slate-400">Completed work orders that generated staff credit points.</p>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-sm">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No completed work has generated credit points yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Staff Name</th>
                  <th className="p-3">Work Order</th>
                  <th className="p-3">Street Light</th>
                  <th className="p-3">Completed On</th>
                  <th className="p-3 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-white">{item.staff_name}</td>
                    <td className="p-3 text-slate-300">#{item.complaint_id}</td>
                    <td className="p-3 font-mono text-amber-400">{item.pole_number}</td>
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

export default StaffCredits;
