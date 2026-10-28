import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { LayoutDashboard, AlertTriangle, Clock, CheckCircle2, Lightbulb, Users, ShieldAlert, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    completedComplaints: 0,
    totalStaff: 0,
    totalStreetLights: 0,
    faultyStreetLights: 0
  });

  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await api.get('/complaints/stats');
        setStats(statsRes.data.stats || {});

        const complaintsRes = await api.get('/complaints/all?status=Pending');
        setRecentComplaints((complaintsRes.data.complaints || []).slice(0, 5));
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center">
          <LayoutDashboard className="w-7 h-7 text-purple-400 mr-2" />
          Smart LED Grid Executive Dashboard
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Municipal control unit monitoring system performance, active streetlight outages, and real-time progress and maintenance actions uploaded by staff.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Complaints"
          value={stats.totalComplaints}
          icon={AlertTriangle}
          color="purple"
          subtext="Logged by citizens & sensors"
        />
        <StatCard
          title="Pending Action"
          value={stats.pendingComplaints}
          icon={ShieldAlert}
          color="yellow"
          subtext="Awaiting staff assignment"
        />
        <StatCard
          title="Under Repair"
          value={stats.inProgressComplaints}
          icon={Clock}
          color="blue"
          subtext="Dispatched maintenance staff"
        />
        <StatCard
          title="Completed Repairs"
          value={stats.completedComplaints}
          icon={CheckCircle2}
          color="green"
          subtext="Fully resolved & verified"
        />
      </div>

      {/* Infrastructure and staff overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Field Technicians</p>
              <h4 className="text-2xl font-extrabold text-white">{stats.totalStaff} Maintenance Staff</h4>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/users')}
            className="text-xs font-bold text-amber-400 hover:underline flex items-center"
          >
            Manage Staff <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      </div>

      {/* Urgent Pending Complaints Section */}
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center">
              <ShieldAlert className="w-5 h-5 text-amber-400 mr-2" />
              Pending Complaints Requiring Assignment
            </h3>
            <p className="text-xs text-slate-400">Assign open issues to maintenance technicians immediately</p>
          </div>
          <button
            onClick={() => navigate('/admin/complaints')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center transition"
          >
            View All Complaints Matrix <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-sm">Loading complaints...</div>
        ) : recentComplaints.length === 0 ? (
          <div className="py-8 text-center text-emerald-400 text-sm font-semibold">
            🎉 All complaints are assigned or resolved! No pending issues.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Street light no</th>
                  <th className="p-3">Area / Locality</th>
                  <th className="p-3">Reported By</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-amber-400">{c.pole_number}</td>
                    <td className="p-3 font-medium text-white">{c.area}</td>
                    <td className="p-3 text-slate-300">{c.citizen_name} ({c.citizen_phone || 'N/A'})</td>
                    <td className="p-3 text-slate-300 max-w-xs truncate">{c.description}</td>
                    <td className="p-3"><StatusBadge status={c.status} /></td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => navigate('/admin/complaints')}
                        className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 font-semibold"
                      >
                        Assign Staff
                      </button>
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

export default Dashboard;
