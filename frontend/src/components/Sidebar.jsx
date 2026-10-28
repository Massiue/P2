import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, AlertOctagon, History, Wrench, Users, PlusCircle, Lightbulb, ShieldCheck, BarChart3, MessageSquareText, Inbox, UserCircle, Award } from 'lucide-react';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user } = useAuth();

  if (!user) return null;

  const role = user.role;

  const citizenLinks = [
    { name: 'Report Faulty Light', path: '/report-fault', icon: PlusCircle },
    { name: 'My Complaints History', path: '/my-complaints', icon: History },
    { name: 'Submit Feedback', path: '/feedback', icon: MessageSquareText },
    { name: 'My Profile', path: '/profile', icon: UserCircle },
  ];

  const adminLinks = [
    { name: 'Executive Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Reports & Downloads', path: '/admin/reports', icon: BarChart3 },
    { name: 'All Complaints Grid', path: '/admin/complaints', icon: AlertOctagon },
    { name: 'Staff Activity', path: '/admin/staff-activity', icon: History },
    { name: 'Staff Credit Points', path: '/admin/staff-credits', icon: Award },
    { name: 'Citizen Feedback', path: '/admin/feedback', icon: Inbox },
    { name: 'Street Light Inventory', path: '/admin/lights', icon: Lightbulb },
    { name: 'User & Staff Management', path: '/admin/users', icon: Users },
    { name: 'User Profile', path: '/profile', icon: UserCircle },
  ];

  const staffLinks = [
    { name: 'My Assigned Tasks', path: '/staff/assigned', icon: Wrench },
    { name: 'Credit Points', path: '/staff/credits', icon: Award },
    { name: 'My Profile', path: '/profile', icon: UserCircle },
  ];

  let links = [];
  if (role === 'admin') links = adminLinks;
  else if (role === 'staff') links = staffLinks;
  else links = citizenLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div className="p-4 space-y-6">
          <div className="px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Logged in as</span>
            <div className="text-sm font-semibold text-white truncate">{user.name}</div>
            <div className="text-xs text-amber-400/90 font-medium capitalize mt-0.5">{user.role} Role</div>
          </div>

          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 mr-3 shrink-0" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-800/80 text-center">
          <div className="flex items-center justify-center space-x-1 text-slate-500 text-xs font-medium">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Smart LED Street Lighting v1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
