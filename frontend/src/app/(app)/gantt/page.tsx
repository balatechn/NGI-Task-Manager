'use client';
import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api';
import { Task } from '@/types';
import TaskGanttView  from '@/components/TaskGanttView';
import TaskDetailPanel from '@/components/TaskDetailPanel';
import TaskFormModal   from '@/components/TaskFormModal';
import { Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const LOCATIONS = ['All Locations', 'Mangaluru', 'Shivamogga', 'Hassan', 'Chikkamagaluru'];
const STATUSES  = ['All', 'Planned', 'In Progress', 'Waiting Approval', 'Completed', 'On Hold', 'Delayed'];

export default function GanttPage() {
  const qc = useQueryClient();
  const [locationF, setLocationF] = useState('All Locations');
  const [statusF,   setStatusF]   = useState('All');
  const [selected,  setSelected]  = useState<Task | null>(null);
  const [editing,   setEditing]   = useState<Task | null>(null);
  const [newTask,   setNewTask]   = useState(false);

  const { data: tasks = [], isFetching } = useQuery({
    queryKey: ['tasks', locationF, statusF],
    queryFn: () => tasksApi.list({
      location: locationF !== 'All Locations' ? locationF : undefined,
      status:   statusF   !== 'All'           ? statusF   : undefined,
    }).then(r => r.data),
  });

  const refresh = useCallback(() => qc.invalidateQueries({ queryKey: ['tasks'] }), [qc]);

  async function handleStatusChange(id: number, status: string) {
    try { await tasksApi.update(id, { status }); refresh(); } catch { toast.error('Failed'); }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-gray-200 flex-shrink-0 flex-wrap">
        <h1 className="text-base font-semibold text-gray-800">Gantt Chart</h1>
        <div className="flex items-center gap-2 ml-2 flex-wrap">
          <select className="input w-auto text-xs py-1.5" value={locationF} onChange={e => setLocationF(e.target.value)}>
            {LOCATIONS.map(l => <option key={l}>{l}</option>)}
          </select>
          <select className="input w-auto text-xs py-1.5" value={statusF} onChange={e => setStatusF(e.target.value)}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={refresh} className="btn-secondary text-xs py-1.5" disabled={isFetching}>
            <RefreshCw size={12} className={isFetching ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setNewTask(true)} className="btn-primary text-xs py-1.5">
            <Plus size={12} /> New Task
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <TaskGanttView
            tasks={tasks}
            locationFilter={locationF}
            onTaskClick={setSelected}
            onTaskEdit={t => { setEditing(t); setSelected(null); }}
          />
        </div>
        {selected && (
          <TaskDetailPanel
            task={selected}
            onClose={() => setSelected(null)}
            onEdit={() => { setEditing(selected); setSelected(null); }}
            onUpdated={() => { refresh(); }}
          />
        )}
      </div>

      {(newTask || editing) && (
        <TaskFormModal
          task={editing}
          allTasks={tasks}
          onClose={() => { setNewTask(false); setEditing(null); }}
          onSaved={() => { setNewTask(false); setEditing(null); refresh(); }}
        />
      )}
    </div>
  );
}
