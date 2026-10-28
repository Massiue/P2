import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, Calendar, CheckCircle2, BadgeCheck, Mail, Phone, Save, ShieldCheck, User } from 'lucide-react';
import { formatAppDate } from '../../utils/date';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formState, setFormState] = useState({ name: '', email: '', phone: '' });
  const [status, setStatus] = useState({ success: '', error: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormState({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ success: '', error: '' });
    setSubmitting(true);

    try {
      await updateProfile(formState.name, formState.email, formState.phone);
      setStatus({ success: 'Profile updated successfully.', error: '' });
    } catch (err) {
      setStatus({
        success: '',
        error: err.response?.data?.message || 'Unable to update profile.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const roleStyles = {
    admin: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    staff: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    citizen: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
  };

  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-amber-400" />
          User Profile
        </h1>
        <p className="text-sm text-slate-400 mt-1">View and update your account contact details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 max-w-5xl">
        <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5">
            <User className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-extrabold text-white">{user?.name || 'User'}</h2>
          <p className="text-sm text-slate-400 mt-1">{user?.email || 'No email available'}</p>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3 py-3 border-t border-slate-800">
              <span className="text-slate-400 flex items-center">
                <BadgeCheck className="w-4 h-4 mr-2" />
                Role
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${roleStyles[user?.role] || roleStyles.citizen}`}>
                {roleLabel}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 py-3 border-t border-slate-800">
              <span className="text-slate-400 flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                Phone
              </span>
              <span className="text-white font-semibold">{user?.phone || 'Not added'}</span>
            </div>
            <div className="flex items-center justify-between gap-3 py-3 border-t border-slate-800">
              <span className="text-slate-400 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Joined
              </span>
              <span className="text-white font-semibold">
                {user?.created_at ? formatAppDate(user.created_at) : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-1">Edit Contact Details</h3>
          <p className="text-sm text-slate-400 mb-5">Keep your name, email, and phone number up to date.</p>

          {status.error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              <span>{status.error}</span>
            </div>
          )}
          {status.success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
              <span>{status.success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={formState.phone}
                  onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold transition disabled:opacity-50 inline-flex items-center justify-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {submitting ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
