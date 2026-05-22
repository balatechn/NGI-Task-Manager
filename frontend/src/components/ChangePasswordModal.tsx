'use client';
import { useState } from 'react';
import { authApi } from '@/lib/api';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState('');
  const [next,    setNext]    = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving,  setSaving]  = useState(false);

  async function save() {
    if (!current || !next) { toast.error('All fields required'); return; }
    if (next !== confirm)  { toast.error('Passwords do not match'); return; }
    if (next.length < 6)   { toast.error('Min 6 characters'); return; }
    setSaving(true);
    try {
      await authApi.changePassword(current, next);
      toast.success('Password updated');
      onClose();
    } catch {
      toast.error('Current password incorrect');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Change Password</h2>
          <button onClick={onClose}><X size={16} /></button>
        </div>
        <div className="space-y-3">
          <div><label className="label">Current Password</label><input className="input" type="password" value={current} onChange={e => setCurrent(e.target.value)} /></div>
          <div><label className="label">New Password</label><input className="input" type="password" value={next} onChange={e => setNext(e.target.value)} /></div>
          <div><label className="label">Confirm New Password</label><input className="input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Update'}</button>
        </div>
      </div>
    </div>
  );
}
