import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Users, Trash2 } from 'lucide-react';
import { formatAppDate } from '../../utils/date';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const confirmed = window.confirm(`Delete ${userName}? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter((u) => u.id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center">
          <Users className="w-7 h-7 text-purple-400 mr-2" />
          User & Maintenance Staff Management
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Register new field technicians and manage municipal user roles.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-xl">
          <h3 className="text-lg font-bold text-white flex items-center mb-4">
            <Users className="w-5 h-5 text-purple-400 mr-2" />
            Registered System Users Directory
          </h3>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-sm">Loading users list...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">User Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Joined Date</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-white">{u.name}</td>
                      <td className="p-3 text-slate-300">{u.email}</td>
                      <td className="p-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-bold border focus:outline-none cursor-pointer uppercase transition ${
                            u.role === 'admin'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                              : u.role === 'staff'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          <option value="citizen" className="bg-slate-900 text-emerald-400 font-semibold">Citizen</option>
                          <option value="staff" className="bg-slate-900 text-blue-400 font-semibold">Staff</option>
                          <option value="admin" className="bg-slate-900 text-purple-400 font-semibold">Admin</option>
                        </select>
                      </td>
                      <td className="p-3 text-slate-400">{u.phone || 'N/A'}</td>
                      <td className="p-3 text-slate-500">{formatAppDate(u.created_at)}</td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 transition text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
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

export default ManageUsers;
