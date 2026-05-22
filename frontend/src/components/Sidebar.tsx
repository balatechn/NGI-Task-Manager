'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CheckSquare, LayoutDashboard, GitBranch, Columns3, List, LogOut, Key, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import ChangePasswordModal from './ChangePasswordModal';

const NAV = [
  { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/gantt',     label: 'Gantt Chart', icon: GitBranch       },
  { href: '/kanban',    label: 'Kanban Board', icon: Columns3       },
  { href: '/list',      label: 'Task List',   icon: List            },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [user, setUser]   = useState('');
  const [pwOpen, setPwOpen] = useState(false);

  useEffect(() => {
    setUser(localStorage.getItem('tm_user') || 'admin');
  }, []);

  function logout() {
    localStorage.removeItem('tm_token');
    localStorage.removeItem('tm_user');
    router.push('/login');
  }

  return (
    <>
      <aside className="w-56 flex-shrink-0 bg-slate-800 flex flex-col h-full">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">NGI Tasks</p>
              <p className="text-slate-400 text-[10px]">IT Infra 2026</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = !!pathname && (pathname === href || pathname.startsWith(href + '/'));
            return (
              <Link
                key={href}
                href={href}
                className={`sidebar-link ${active ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
              >
                <Icon size={16} className="flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight size={12} />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-slate-700 space-y-1">
          <button
            onClick={() => setPwOpen(true)}
            className="sidebar-link sidebar-link-inactive w-full text-left"
          >
            <Key size={14} /> Change Password
          </button>
          <button
            onClick={logout}
            className="sidebar-link w-full text-left text-red-400 hover:bg-red-900/30 hover:text-red-300"
          >
            <LogOut size={14} /> Sign Out
          </button>
          <div className="px-3 pt-2 text-[11px] text-slate-500">
            Logged in as <span className="text-slate-400 font-medium">{user}</span>
          </div>
        </div>
      </aside>

      {pwOpen && <ChangePasswordModal onClose={() => setPwOpen(false)} />}
    </>
  );
}
