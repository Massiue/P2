import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { History, Image as ImageIcon } from 'lucide-react';
import { formatAppDateTime } from '../../utils/date';

const StaffActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const res = await api.get('/complaints/all');
        const complaints = res.data.complaints || [];
        // Keep only complaints that have maintenance logs or assigned staff
        const filtered = complaints.filter(c => c.repair_notes || c.repair_image_url || c.assigned_staff_id);
        setActivities(filtered);
      } catch (err) {
        console.error('Failed to load staff activity:', err);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center">
          <History className="w-7 h-7 text-amber-400 mr-2" />
          Staff Activity & Maintenance Actions
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Track real-time maintenance actions uploaded by field staff: repair notes, photos, and completion timestamps.
        </p>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-white/10 shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading staff activity...</div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No maintenance activity recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Street light no</th>
                  <th className="p-3">Assigned Staff</th>
                  <th className="p-3">Repair Notes</th>
                  <th className="p-3">Photo</th>
                  <th className="p-3">Completed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activities.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 text-slate-500 font-mono">#{a.id}</td>
                    <td className="p-3 font-mono font-bold text-amber-400">{a.pole_number}</td>
                    <td className="p-3 text-white font-medium">{a.staff_name || '—'}</td>
                    <td className="p-3 text-slate-300 max-w-md">{a.repair_notes || '—'}</td>
                    <td className="p-3">
                      {a.repair_image_url ? (
                        <a href={a.repair_image_url} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline inline-flex items-center">
                          <ImageIcon className="w-4 h-4 mr-1" /> View Photo
                        </a>
                      ) : (
                        <span className="text-slate-500 italic">No photo</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-400">
                      {a.completed_at ? formatAppDateTime(a.completed_at) : (a.status === 'In Progress' ? 'In Progress' : '—')}
                    </td>
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

export default StaffActivity;
