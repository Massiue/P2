import React, { useState } from 'react';
import api from '../../api/client';
import { MessageSquareText, Send, CheckCircle2, AlertCircle } from 'lucide-react';

const Feedback = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!message.trim()) {
      setErrorMsg('Please enter your feedback before submitting.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/feedback', {
        subject: subject.trim() || 'General Feedback',
        message: message.trim()
      });

      setSubject('');
      setMessage('');
      setSuccessMsg('Feedback submitted successfully. Thank you for helping improve the service.');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
          <MessageSquareText className="w-7 h-7 text-amber-400 mr-2" />
          Citizen Feedback
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Share suggestions, concerns, or service experience with the municipal admin team when needed.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center">
          <CheckCircle2 className="w-5 h-5 mr-2 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Street light service suggestion"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Feedback <span className="text-amber-400">*</span>
            </label>
            <textarea
              required
              rows="7"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your feedback, suggestion, or concern..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-base shadow-lg shadow-amber-500/20 transition flex items-center justify-center disabled:opacity-50"
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Submitting Feedback...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
