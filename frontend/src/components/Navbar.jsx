import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Lightbulb, LogOut, User, Shield, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      return undefined;
    }

    let active = true;
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        if (active) setNotifications(response.data.notifications || []);
      } catch {
        if (active) setNotifications([]);
      }
    };

    fetchNotifications();
    const intervalId = window.setInterval(fetchNotifications, 15000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [user?.id]);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;

  const openNotification = async (notification) => {
    if (!notification.is_read) {
      setNotifications((current) => current.map((item) => (
        item.id === notification.id ? { ...item, is_read: 1 } : item
      )));
      try {
        await api.patch(`/notifications/${notification.id}/read`);
      } catch {
        setNotifications((current) => current.map((item) => (
          item.id === notification.id ? { ...item, is_read: 0 } : item
        )));
      }
    }

    setNotificationsOpen(false);
    navigate(user?.role === 'admin' ? '/admin/complaints' : '/my-complaints');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-purple-400 mr-1" />;
      case 'staff':
        return <Wrench className="w-4 h-4 text-blue-400 mr-1" />;
      default:
        return <User className="w-4 h-4 text-emerald-400 mr-1" />;
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Lightbulb className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">Smart Light Grid</h1>
            <p className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">Fault & Maintenance System</p>
          </div>
        </div>
      </div>

      {user && (
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={() => setNotificationsOpen((open) => !open)}
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
              aria-expanded={notificationsOpen}
              className="relative p-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-slate-900">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <section className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/40">
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                  <h2 className="text-sm font-semibold text-white">Notifications</h2>
                  {unreadCount > 0 && <span className="text-xs text-amber-300">{unreadCount} unread</span>}
                </div>
                <div className="max-h-[min(24rem,70vh)] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-slate-400">You’re all caught up.</p>
                  ) : notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => openNotification(notification)}
                      className={`block w-full border-b border-slate-800/80 px-4 py-3 text-left transition hover:bg-slate-800/80 ${notification.is_read ? 'opacity-75' : 'bg-slate-800/40'}`}
                    >
                      <span className="flex items-center gap-2">
                        {!notification.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />}
                        <span className="text-sm font-semibold text-slate-100">{notification.title}</span>
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-slate-300">{notification.message}</span>
                      <span className="mt-2 block text-[11px] text-slate-500">
                        {new Date(notification.created_at).toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60">
            {getRoleIcon()}
            <span className="text-xs font-semibold text-white">{user.name}</span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700">
              {user.role}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-2 rounded-xl transition border border-rose-500/20"
          >
            <LogOut className="w-4 h-4 mr-1.5" />
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
