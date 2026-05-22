'use client';
import { useState } from 'react';
import { Task } from '@/types';
import { tasksApi } from '@/lib/api';
import { Eye, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  tasks: Task[];
  onTaskClick: (t: Task) => void;
  onTaskEdit:  (t: Task) => void;
  onDeleted:   () => void;
}

type SortKey = 'id' | 'taskName' | 'location' | 'status' | 'priority' | 'startDate' | 'endDate' | 'completionPct';

const PRIORITY_ORDER: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };

const STATUS_COLORS: Record<string, string> = {
  'Planned':          'bg-orange-100 text-orange-700',
  'In Progress':      'bg-blue-100 text-blue-700',
  'Completed':        'bg-green-100 text-green-700',
  'Delayed':          'bg-red-100 text-red-700',
  'On Hold':          'bg-gray-100 text-gray-600',
  'Waiting Approval': 'bg-purple-100 text-purple-700',
};

const PRIORITY_COLORS: Record<string, string> = {
  Critical: 'text-red-600 font-semibold',
  High:     'text-orange-500 font-semibold',
  Medium:   'text-yellow-600',
  Low:      'text-gray-400',
};

export default function TaskListView({ tasks, onTaskClick, onTaskEdit, onDeleted }: Props) {
  const [sortKey,  setSortKey]  = useState<SortKey>('startDate');
  const [sortDir,  setSortDir]  = useState<'asc' | 'desc'>('asc');
  const [search,   setSearch]   = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  const filtered = tasks.filter(t => {
    if (!search) return true;
    const q = search.toLowerCase();
    return t.taskName.toLowerCase().includes(q) || (t.assignedTo || '').toLowerCase().includes(q) || (t.location || '').toLowerCase().includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'id':            cmp = a.id - b.id; break;
      case 'taskName':      cmp = a.taskName.localeCompare(b.taskName); break;
      case 'location':      cmp = (a.location||'').localeCompare(b.location||''); break;
      case 'status':        cmp = a.status.localeCompare(b.status); break;
      case 'priority':      cmp = (PRIORITY_ORDER[a.priority]||0) - (PRIORITY_ORDER[b.priority]||0); break;
      case 'startDate':     cmp = new Date(a.startDate).getTime() - new Date(b.startDate).getTime(); break;
      case 'endDate':       cmp = new Date(a.endDate).getTime()   - new Date(b.endDate).getTime();   break;
      case 'completionPct': cmp = a.completionPct - b.completionPct; break;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await tasksApi.delete(deleteId);
      toast.success('Task deleted');
      onDeleted();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleteId(null); }
  }

  const Th = ({ label, k }: { label: string; k: SortKey }) => (
    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap cursor-pointer hover:text-gray-700 select-none"
        onClick={() => toggleSort(k)}>
      <span className="inline-flex items-center gap-1">
        {label}
        {sortKey === k ? (sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />) : <ChevronDown size={10} className="opacity-20" />}
      </span>
    </th>
  );

  const now = new Date();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search */}
      <div className="px-4 py-2 bg-white border-b border-gray-100 flex-shrink-0">
        <input
          className="input max-w-xs text-sm"
          placeholder="Search tasks, assignee, location…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <Th label="#"          k="id"            />
              <Th label="Task"       k="taskName"      />
              <Th label="Location"   k="location"      />
              <Th label="Status"     k="status"        />
              <Th label="Priority"   k="priority"      />
              <Th label="Start"      k="startDate"     />
              <Th label="End"        k="endDate"       />
              <Th label="Progress"   k="completionPct" />
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Assigned</th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(t => {
              const overdue = new Date(t.endDate) < now && !['Completed','On Hold'].includes(t.status);
              return (
                <tr key={t.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${overdue ? 'bg-red-50/40' : ''}`}>
                  <td className="px-3 py-2 text-gray-400 text-xs">{t.id}</td>
                  <td className="px-3 py-2 max-w-[220px]">
                    <p className="font-medium text-gray-800 truncate">{t.taskName}</p>
                    {t.dependencyIds && <p className="text-[10px] text-gray-400">Deps: {t.dependencyIds}</p>}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{t.location || '—'}</td>
                  <td className="px-3 py-2">
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${STATUS_COLORS[t.status] || 'bg-gray-100 text-gray-600'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className={`px-3 py-2 text-xs whitespace-nowrap ${PRIORITY_COLORS[t.priority] || ''}`}>{t.priority}</td>
                  <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{new Date(t.startDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}</td>
                  <td className={`px-3 py-2 text-xs whitespace-nowrap ${overdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                    {new Date(t.endDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-14 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${t.completionPct}%` }} />
                      </div>
                      <span className="text-[10px] text-gray-400">{t.completionPct}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{t.assignedTo || '—'}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onTaskClick(t)} className="p-1 hover:bg-blue-50 rounded text-blue-500" title="View"><Eye size={13} /></button>
                      <button onClick={() => onTaskEdit(t)}  className="p-1 hover:bg-brand-50 rounded text-brand-500" title="Edit"><Pencil size={13} /></button>
                      <button onClick={() => setDeleteId(t.id)} className="p-1 hover:bg-red-50 rounded text-red-400" title="Delete"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr><td colSpan={10} className="text-center py-12 text-gray-400 text-sm">No tasks found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-semibold text-gray-800 mb-2">Delete Task?</h3>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancel</button>
              <button onClick={confirmDelete} className="btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
