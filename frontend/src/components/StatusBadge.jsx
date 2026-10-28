import React from 'react';
import { AlertTriangle, Clock, CheckCircle2, XCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  switch (status) {
    case 'Pending':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertTriangle className="w-3.5 h-3.5 mr-1 animate-pulse" />
          Pending
        </span>
      );
    case 'Accepted':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
          Accepted
        </span>
      );
    case 'Declined':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <XCircle className="w-3.5 h-3.5 mr-1" />
          Declined
        </span>
      );
    case 'In Progress':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Clock className="w-3.5 h-3.5 mr-1" />
          In Progress
        </span>
      );
    case 'Completed':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
          Completed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
          {status}
        </span>
      );
  }
};

export default StatusBadge;
