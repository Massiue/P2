import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Lightbulb, Pencil, Trash2, Plus, CheckCircle2, X } from 'lucide-react';

const StreetLights = () => {
  const [lights, setLights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLight, setSelectedLight] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ pole_number: '', area: '', status: 'working', latitude: '', longitude: '' });
  const [modalMessage, setModalMessage] = useState('');
  const [modalError, setModalError] = useState('');

  const fetchLights = async () => {
    try {
      setLoading(true);
      const res = await api.get('/lights');
      setLights(res.data.streetLights || []);
    } catch (err) {
      console.error('Failed to fetch street lights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLights();
  }, []);

  const openEdit = (light) => {
    setSelectedLight(light);
    setIsAdding(false);
    setFormData({
      pole_number: light.pole_number || '',
      area: light.area || '',
      status: light.status || 'working',
      latitude: light.latitude || '',
      longitude: light.longitude || ''
    });
    setModalMessage('');
    setModalError('');
  };

  const openAdd = () => {
    setSelectedLight(null);
    setIsAdding(true);
    setFormData({ pole_number: '', area: '', status: 'working', latitude: '', longitude: '' });
    setModalMessage('');
    setModalError('');
  };

  const closeModal = () => {
    setSelectedLight(null);
    setIsAdding(false);
    setFormData({ pole_number: '', area: '', status: 'working', latitude: '', longitude: '' });
    setModalMessage('');
    setModalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isAdding) {
        await api.post('/lights', {
          pole_number: formData.pole_number,
          area: formData.area,
          latitude: formData.latitude || null,
          longitude: formData.longitude || null
        });
        setModalMessage('Street light added successfully.');
      } else {
        await api.put(`/lights/${selectedLight.id}`, {
          area: formData.area,
          status: formData.status,
          latitude: formData.latitude || null,
          longitude: formData.longitude || null
        });
        setModalMessage('Street light updated successfully.');
      }
      fetchLights();
      setTimeout(closeModal, 1200);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update street light.');
    }
  };

  const handleDelete = async (light) => {
    const confirmed = window.confirm(`Remove street light ${light.pole_number} from inventory?`);
    if (!confirmed) return;

    try {
      await api.delete(`/lights/${light.id}`);
      setLights(lights.filter((item) => item.id !== light.id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove street light.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center">
          <Lightbulb className="w-7 h-7 text-amber-400 mr-2" />
          Street Light Inventory Management
        </h1>
        <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
          <p className="text-sm text-slate-400">
            Add street lights, update details, and remove faulty nodes from the inventory.
          </p>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" /> Add Street Light
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4 border border-slate-800">
        {loading ? (
          <div className="p-10 text-center text-slate-400">Loading street light inventory...</div>
        ) : lights.length === 0 ? (
          <div className="p-10 text-center text-slate-400">No street lights found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Pole #</th>
                  <th className="p-4">Area</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {lights.map((light) => (
                  <tr key={light.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-mono text-amber-400">{light.pole_number}</td>
                    <td className="p-4 text-white">{light.area}</td>
                    <td className="p-4 text-slate-200 capitalize">{light.status}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openEdit(light)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/20 hover:bg-blue-500/20 transition text-xs"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Update
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(light)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 transition text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(selectedLight || isAdding) && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-2xl p-6 border border-white/10 shadow-2xl relative">
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center mb-2">
              {isAdding ? <Plus className="w-5 h-5 text-amber-400 mr-2" /> : <Pencil className="w-5 h-5 text-blue-400 mr-2" />}
              {isAdding ? 'Add Street Light' : `Update Street Light ${selectedLight.pole_number}`}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {isAdding ? 'Register a new light node in the municipal inventory.' : 'Edit area, status, or coordinates for this light node.'}
            </p>

            {modalMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                <span>{modalMessage}</span>
              </div>
            )}
            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center">
                <X className="w-4 h-4 mr-2" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {isAdding && (
                <div>
                  <label className="block text-slate-300 uppercase tracking-wider text-[11px] font-semibold mb-2">Pole Number</label>
                  <input
                    required
                    value={formData.pole_number}
                    onChange={(e) => setFormData({ ...formData, pole_number: e.target.value })}
                    placeholder="e.g. SL-501"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}
              <div>
                <label className="block text-slate-300 uppercase tracking-wider text-[11px] font-semibold mb-2">Area</label>
                <input
                  required
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              {!isAdding && <div>
                <label className="block text-slate-300 uppercase tracking-wider text-[11px] font-semibold mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-400"
                >
                  <option value="working">Working</option>
                  <option value="faulty">Faulty</option>
                  <option value="under_maintenance">Under Maintenance</option>
                </select>
              </div>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 uppercase tracking-wider text-[11px] font-semibold mb-2">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 uppercase tracking-wider text-[11px] font-semibold mb-2">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-bold hover:from-blue-500 hover:to-indigo-400"
                >
                  {isAdding ? 'Add Street Light' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreetLights;
