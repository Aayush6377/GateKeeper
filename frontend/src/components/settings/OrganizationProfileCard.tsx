import React, { useState } from 'react';
import { tenantService } from '../../services/tenantService';
import { Building2, Save, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  initialName: string;
  slug: string;
  onUpdate: (newName: string) => void;
}

export const OrganizationProfileCard: React.FC<Props> = ({ initialName, slug, onUpdate }) => {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const updated = await tenantService.updateOrganization({ name });
      onUpdate(updated.name);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update organization name.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shrink-0">
          <Building2 size={20} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Organization Profile</h3>
          <p className="text-xs text-slate-500">Update your company or workspace display name</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Organization Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={150}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Slug (Read-Only)
          </label>
          <input
            type="text"
            value={slug}
            disabled
            className="w-full px-3.5 py-2.5 text-sm bg-slate-100 text-slate-500 border border-slate-200 rounded-xl cursor-not-allowed font-mono text-xs"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          {success ? (
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold">
              <CheckCircle2 size={16} /> Updated successfully!
            </div>
          ) : (
            <div />
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-xs disabled:opacity-50 cursor-pointer w-full sm:w-auto"
          >
            <Save size={15} /> {saving ? 'Saving...' : 'Save Organization'}
          </button>
        </div>
      </form>
    </div>
  );
};