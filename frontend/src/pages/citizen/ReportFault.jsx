import React, { useState } from 'react';
import api from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

const ReportFault = () => {
  const [poleNumber, setPoleNumber] = useState('');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  const areasList = [
    'Downtown Sector 1',
    'Green Park Colony',
    'Industrial Area Zone B',
    'North Market Road',
    'East Residency Avenue',
    'South Terminal Boulevard'
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!poleNumber || !area || !description) {
      setErrorMsg('Please fill in Street light no, Area, and Description.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('pole_number', poleNumber);
      formData.append('area', area);
      formData.append('description', description);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccessMsg('Street light fault logged successfully! Redirecting to your complaint history...');
      setTimeout(() => {
        navigate('/my-complaints');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit complaint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
          <Lightbulb className="w-7 h-7 text-amber-400 mr-2" />
          Report Faulty Street Light
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Submit details of non-functional or damaged LED street light poles in your locality for fast municipal repair dispatch.
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pole Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Street light no <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={poleNumber}
                onChange={(e) => setPoleNumber(e.target.value)}
                placeholder="e.g. SL-101"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Usually painted on the light pole base.</span>
            </div>

            {/* Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Locality / Area <span className="text-amber-400">*</span>
              </label>
              
              <input
                type="text"
                required
                list="area-suggestions"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Downtown Sector 1"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
              />
              <datalist id="area-suggestions">
                {areasList.map((a, idx) => (
                  <option key={idx} value={a} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Fault Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Fault Description & Observations <span className="text-amber-400">*</span>
            </label>
            <textarea
              required
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe issue (e.g. Total light outage, flickering LED module, hanging wire, broken housing...)"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
            ></textarea>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Attach Fault Photo (Optional)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer flex items-center justify-center text-sm font-medium text-slate-200 transition">
                <Upload className="w-4 h-4 mr-2 text-amber-400" />
                <span>Choose Image File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imageFile && (
                <span className="text-xs text-slate-400 truncate max-w-xs">{imageFile.name}</span>
              )}
            </div>

            {imagePreview && (
              <div className="mt-4 relative w-44 h-44 rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
                <img src={imagePreview} alt="Fault preview" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] text-amber-400 font-semibold">
                  Photo Preview
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-base shadow-lg shadow-amber-500/20 transition flex items-center justify-center disabled:opacity-50"
            >
              {loading ? 'Submitting Fault Report...' : 'Submit Fault Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportFault;
