import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { History, Calendar, MapPin, User, CheckCircle2, Clock, AlertTriangle, Image as ImageIcon, Wrench } from 'lucide-react';
import { formatAppDate } from '../../utils/date';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const fetchMyComplaints = async () => {
    try {
      const res = await api.get('/complaints/my');
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const renderStepper = (status) => {
    const steps = [
      { key: 'Pending', label: 'Report Logged' },
      { key: 'In Progress', label: 'Assigned to Staff' },
      { key: 'Completed', label: 'Repaired & Verified' }
    ];

    let currentStep = 0;
    if (status === 'In Progress') currentStep = 1;
    if (status === 'Completed') currentStep = 2;

    return (
      <div className="w-full py-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-amber-500 via-blue-500 to-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `${(currentStep / 2) * 100}%` }}
          />

          {steps.map((step, idx) => {
            const isDone = idx <= currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div key={step.key} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isDone
                      ? 'bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {idx + 1}
                </div>
                <span className={`text-[11px] font-medium mt-1.5 ${isCurrent ? 'text-white font-bold' : 'text-slate-400'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
            <History className="w-7 h-7 text-amber-400 mr-2" />
            My Fault Complaints & Status Tracker
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track real-time progress and maintenance actions taken for your reported street lights.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="glass-card rounded-2xl p-12 text-center text-slate-400">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full mb-3"></div>
          <p className="text-sm font-medium">Loading your complaint records...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-slate-800">
          <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Complaints Logged Yet</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            You haven't reported any faulty street lights. If you notice a dark street pole in your area, submit a report.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-2xl p-5 border border-white/10 hover:border-amber-500/30 transition shadow-lg"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-start space-x-3">
                  <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-bold text-sm">
                    {item.pole_number}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center">
                      <MapPin className="w-4 h-4 text-slate-400 mr-1" />
                      {item.area}
                    </h3>
                    <div className="flex items-center text-xs text-slate-400 mt-0.5 space-x-3">
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        Reported: {formatAppDate(item.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <StatusBadge status={item.status} />
                </div>
              </div>

              {/* Status Timeline Stepper */}
              {renderStepper(item.status)}

              {/* Complaint Details */}
              <div className="mt-2 pt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">Issue Description</span>
                  <p className="text-slate-200">{item.description}</p>
                  {item.image_url && (
                    <div className="mt-2">
                      <a
                        href={item.image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-amber-400 hover:underline"
                      >
                        <ImageIcon className="w-3.5 h-3.5 mr-1" />
                        View Attached Fault Photo
                      </a>
                    </div>
                  )}
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">Maintenance Status & Notes</span>
                  {item.assigned_staff_name ? (
                    <div className="space-y-1">
                      <div className="text-slate-300 flex items-center">
                        <Wrench className="w-3.5 h-3.5 text-blue-400 mr-1" />
                        Assigned Tech: <span className="font-semibold text-white ml-1">{item.assigned_staff_name}</span>
                      </div>
                      {item.repair_notes && (
                        <p className="text-slate-300 italic mt-1 bg-slate-950/60 p-2 rounded border border-slate-800">
                          "{item.repair_notes}"
                        </p>
                      )}
                      {item.repair_image_url && (
                        <div className="mt-2">
                          <a
                            href={item.repair_image_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center text-emerald-400 hover:underline"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            View Technician Repair Proof Photo
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">Pending assignment by city administrator.</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyComplaints;
