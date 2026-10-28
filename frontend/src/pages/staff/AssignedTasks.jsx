import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { Wrench, CheckCircle2, Clock, MapPin, User, Upload, AlertCircle, Phone, FileText, Image as ImageIcon, X } from 'lucide-react';

const AssignedTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status Update Modal State
  const [selectedTask, setSelectedTask] = useState(null);
  const [status, setStatus] = useState('In Progress');
  const [repairNotes, setRepairNotes] = useState('');
  const [repairImage, setRepairImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalError, setModalError] = useState('');

  const fetchAssignedTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints/assigned');
      setTasks(res.data.complaints || []);
    } catch (err) {
      console.error('Failed to fetch assigned tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedTasks();
  }, []);

  const openUpdateModal = (task) => {
    setSelectedTask(task);
    setStatus(task.status === 'Pending' ? 'In Progress' : task.status);
    setRepairNotes(task.repair_notes || '');
    setRepairImage(null);
    setImagePreview(task.repair_image_url || null);
    setModalSuccess('');
    setModalError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRepairImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalSuccess('');
    setModalError('');

    try {
      const formData = new FormData();
      formData.append('status', status);
      formData.append('repair_notes', repairNotes);
      if (repairImage) {
        formData.append('image', repairImage);
      }

      await api.put(`/complaints/${selectedTask.id}/status`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setModalSuccess(`Task #${selectedTask.id} status updated to '${status}' successfully!`);
      setTimeout(() => {
        setSelectedTask(null);
        fetchAssignedTasks();
      }, 1200);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update task status.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTaskDecision = async (taskId, action) => {
    try {
      await api.put(`/complaints/${taskId}/${action}`);
      fetchAssignedTasks();
    } catch (err) {
      console.error(`Failed to ${action} task:`, err);
      alert(err.response?.data?.message || `Unable to ${action} this task.`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center">
          <Wrench className="w-7 h-7 text-blue-400 mr-2" />
          Maintenance Staff Workbench
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          View assigned street light fault repairs, log inspection notes, and upload repair completion proof photos.
        </p>
      </div>

      {loading ? (
        <div className="glass-card rounded-2xl p-12 text-center text-slate-400">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full mb-3"></div>
          <p className="text-sm font-medium">Loading your assigned tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-slate-800">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Active Assigned Work Orders</h3>
          <p className="text-sm text-slate-400 mt-1">
            You currently have no pending assigned tasks. Check back later when admin assigns new streetlight repairs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="glass-card rounded-2xl p-6 border border-white/10 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                      {task.pole_number}
                    </span>
                    <span className="text-xs font-semibold text-white">{task.area}</span>
                  </div>
                  <StatusBadge status={task.status} />
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 uppercase font-semibold block mb-0.5">Citizen Reporter:</span>
                    <div className="text-white font-medium flex items-center">
                      <User className="w-3.5 h-3.5 text-slate-400 mr-1" />
                      {task.citizen_name}
                      {task.citizen_phone && (
                        <a href={`tel:${task.citizen_phone}`} className="ml-2 text-blue-400 hover:underline flex items-center">
                          <Phone className="w-3 h-3 mr-0.5" /> {task.citizen_phone}
                        </a>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase font-semibold block mb-0.5">Fault Description:</span>
                    <p className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-slate-200">{task.description}</p>
                    {task.image_url && (
                      <div className="mt-1.5">
                        <a
                          href={task.image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-400 hover:underline inline-flex items-center"
                        >
                          <ImageIcon className="w-3.5 h-3.5 mr-1" /> View Fault Photo Uploaded by Citizen
                        </a>
                      </div>
                    )}
                  </div>

                  {task.repair_notes && (
                    <div>
                      <span className="text-slate-400 uppercase font-semibold block mb-0.5">Your Repair Notes:</span>
                      <p className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-emerald-300 italic">
                        "{task.repair_notes}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 mt-5 space-y-3">
                {task.status === 'Pending' && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleTaskDecision(task.id, 'accept')}
                      className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTaskDecision(task.id, 'decline')}
                      className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition"
                    >
                      Decline
                    </button>
                  </div>
                )}

                <button
                  onClick={() => openUpdateModal(task)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition flex items-center justify-center"
                >
                  <Wrench className="w-4 h-4 mr-2" />
                  Update Repair Status & Notes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Repair Update Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-2xl p-6 border border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedTask(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center mb-1">
              <Wrench className="w-5 h-5 text-blue-400 mr-2" />
              Update Repair Work Order #{selectedTask.id}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Street light no <span className="font-mono text-amber-400 font-bold">{selectedTask.pole_number}</span> ({selectedTask.area})
            </p>

            {modalSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
                <span>{modalSuccess}</span>
              </div>
            )}

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleStatusSubmit} className="space-y-4 text-xs">
              {/* Status Radio / Select */}
              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-2">Work Progress Status</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus('In Progress')}
                    className={`py-2.5 rounded-xl font-bold border flex items-center justify-center transition ${
                      status === 'In Progress'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    <Clock className="w-4 h-4 mr-1.5" /> In Progress
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('Completed')}
                    className={`py-2.5 rounded-xl font-bold border flex items-center justify-center transition ${
                      status === 'Completed'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Completed
                  </button>
                </div>
              </div>

              {/* Repair Notes */}
              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Repair Inspection & Action Notes <span className="text-amber-400">*</span>
                </label>
                <textarea
                  required
                  rows="3"
                  value={repairNotes}
                  onChange={(e) => setRepairNotes(e.target.value)}
                  placeholder="Detail work performed (e.g. Replaced faulty LED ballast, re-wired junction box, restored power grid line...)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                ></textarea>
              </div>

              {/* Repair Photo Upload */}
              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Upload Repair Completion Photo (Proof of Fix)
                </label>
                <label className="w-full px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 cursor-pointer flex items-center justify-center text-slate-300 transition">
                  <Upload className="w-4 h-4 mr-2 text-blue-400" />
                  <span>Attach Repair Photo</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>

                {imagePreview && (
                  <div className="mt-3 relative w-36 h-36 rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
                    <img src={imagePreview} alt="Repair proof" className="w-full h-full object-cover" />
                    <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-slate-950/80 text-[9px] text-emerald-400 font-bold">
                      Proof Photo
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 transition"
                >
                  {submitting ? 'Saving Updates...' : 'Submit Status Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedTasks;
