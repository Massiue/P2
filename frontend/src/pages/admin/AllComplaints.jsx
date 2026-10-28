import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { AlertOctagon, Filter, Search, UserCheck, CheckCircle2, AlertCircle, X, Wrench, Image as ImageIcon } from 'lucide-react';

const AllComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State for Staff Assignment
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalError, setModalError] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      let url = `/complaints/all?`;
      if (statusFilter) url += `status=${statusFilter}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}`;
      
      const res = await api.get(url);
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await api.get('/users?role=staff');
      setStaffList(res.data.users || []);
    } catch (err) {
      console.error('Failed to fetch staff list:', err);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchStaff();
  }, []);

  const openAssignModal = (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedStaffId(complaint.assigned_staff_id || '');
    setModalSuccess('');
    setModalError('');
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaffId) {
      setModalError('Please select a maintenance staff member.');
      return;
    }

    setAssigning(true);
    setModalError('');
    setModalSuccess('');

    try {
      await api.put(`/complaints/${selectedComplaint.id}/assign`, {
        staff_id: selectedStaffId
      });

      setModalSuccess('Complaint assigned successfully!');
      setTimeout(() => {
        setSelectedComplaint(null);
        fetchComplaints();
      }, 1200);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to assign complaint.');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center">
          <AlertOctagon className="w-7 h-7 text-amber-400 mr-2" />
          Street Light Fault Complaints Matrix
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Track real-time progress and maintenance actions uploaded by staff, and assign citizen fault reports to maintenance teams.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Declined">Declined</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

          <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Street light no, Area, or Citizen..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Complaints Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/10 shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Loading complaints data...
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No complaints found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Street light no</th>
                  <th className="p-4">Area</th>
                  <th className="p-4">Citizen Info</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Assigned Staff</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {complaints.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 text-slate-500 font-mono">#{item.id}</td>
                    <td className="p-4 font-mono font-bold text-amber-400">{item.pole_number}</td>
                    <td className="p-4 font-semibold text-white">{item.area}</td>
                    <td className="p-4 text-slate-300">
                      <div className="font-semibold text-white">{item.citizen_name}</div>
                      <div className="text-[11px] text-slate-400">{item.citizen_phone || item.citizen_email}</div>
                    </td>
                    <td className="p-4 text-slate-300 max-w-xs">
                      <p className="truncate">{item.description}</p>
                      {item.image_url && (
                        <a
                          href={item.image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-amber-400 hover:underline flex items-center mt-1"
                        >
                          <ImageIcon className="w-3 h-3 mr-1" /> Photo
                        </a>
                      )}
                    </td>
                    <td className="p-4"><StatusBadge status={item.status} /></td>
                    <td className="p-4 text-slate-300">
                      {item.staff_name ? (
                        <span className="inline-flex items-center text-xs text-blue-300 font-semibold bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                          <Wrench className="w-3 h-3 mr-1" />
                          {item.staff_name}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {item.status === 'Completed' ? (
                        <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold">
                          Completed
                        </span>
                      ) : (
                        <button
                          onClick={() => openAssignModal(item)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-semibold border border-amber-500/30 transition text-xs"
                        >
                          {item.assigned_staff_id ? 'Reassign Staff' : 'Assign Staff'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Staff Assignment Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-2xl p-6 border border-white/10 shadow-2xl relative">
            <button
              onClick={() => setSelectedComplaint(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center mb-1">
              <UserCheck className="w-5 h-5 text-amber-400 mr-2" />
              Assign Maintenance Staff
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Complaint #{selectedComplaint.id} - Street light no <span className="font-mono text-amber-400 font-bold">{selectedComplaint.pole_number}</span> ({selectedComplaint.area})
            </p>

            {modalSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                <span>{modalSuccess}</span>
              </div>
            )}

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select Technician / Maintenance Staff
                </label>
                <select
                  required
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="">-- Choose Technician --</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.phone || s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50 transition"
                >
                  {assigning ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllComplaints;
