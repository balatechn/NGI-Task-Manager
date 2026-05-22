'use client';
import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api';
import { Task } from '@/types';
import TaskKanbanView  from '@/components/TaskKanbanView';
import TaskDetailPanel from '@/components/TaskDetailPanel';
import TaskFormModal   from '@/components/TaskFormModal';
import { Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const LOCATIONS = ['All Locations', 'Mangaluru', 'Shivamogga', 'Hassan', 'Chikkamagaluru'];

export default function KanbanPage() {
  const qc = useQueryClient();
  const [locationF, setLocationF] = useState('All Locations');
  const [selected,  setSelected]  = useState<Task | null>(null);
  const [editing,   setEditing]   = useState<Task | null>(null);
  const [newTask,   setNewTask]   = useState(false);

  const { data: tasks = [], isFetching } = useQuery({
    queryKey: ['tasks', locationF],
    queryFn: () => tasksApi.list({
      location: locationF !== 'All Locations' ? locationF : undefined,
    }).then(r => r.data),
  });

  const refresh = useCallback(() => qc.invalidateQueries({ queryKey: ['tasks'] }), [qc]);

  async function handleStatusChange(id: number, status: string) {
    try { await tasksApi.update(id, { status }); refresh(); toast.success('Status updated'); } catch { toast.error('Failed'); }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-gray-200 flex-shrink-0">
        <h1 className="text-base font-semibold text-gray-800">Kanban Board</h1>
        <select className="input w-auto text-xs py-1.5 ml-2" value={locationF} onChange={e => setLocationF(e.target.value)}>
          {LOCATIONS.map(l => <option key={l}>{l}</option>)}
        </select>
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
        <div className="flex-1 overflow-auto">
          <TaskKanbanView
            tasks={tasks}
            onTaskClick={setSelected}
            onStatusChange={handleStatusChange}
          />
        </div>
        {selected && (
          <TaskDetailPanel
            task={selected}
            onClose={() => setSelected(null)}
            onEdit={() => { setEditing(selected); setSelected(null); }}
            onUpdated={refresh}
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
