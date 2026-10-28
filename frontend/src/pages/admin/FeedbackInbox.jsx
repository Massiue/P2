import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Inbox, MessageSquareText, User, Calendar } from 'lucide-react';
import { formatAppDateTime } from '../../utils/date';

const FeedbackInbox = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await api.get('/feedback');
        setFeedback(res.data.feedback || []);
      } catch (err) {
        console.error('Failed to fetch feedback:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center">
          <Inbox className="w-7 h-7 text-amber-400 mr-2" />
          Citizen Feedback Inbox
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review suggestions and service comments submitted by citizens.
        </p>
      </div>

      {loading ? (
        <div className="glass-card rounded-2xl p-12 text-center text-slate-400 text-sm">
          Loading citizen feedback...
        </div>
      ) : feedback.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-slate-800">
          <MessageSquareText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Feedback Submitted Yet</h3>
          <p className="text-sm text-slate-400 mt-1">
            Citizen feedback will appear here after submission.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {feedback.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-2xl p-5 border border-white/10 shadow-lg"
            >
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">{item.subject}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                    <span className="flex items-center">
                      <User className="w-3.5 h-3.5 mr-1" />
                      {item.citizen_name}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      {formatAppDateTime(item.created_at)}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-bold">
                  #{item.id}
                </span>
              </div>

              <p className="text-sm text-slate-200 mt-4 whitespace-pre-line">{item.message}</p>

              <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
                Contact: {item.citizen_phone || item.citizen_email}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackInbox;
