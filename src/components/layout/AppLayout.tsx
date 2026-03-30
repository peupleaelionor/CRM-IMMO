import { useState, useCallback, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Kanban,
  Sparkles,
  Bell,
  Menu,
  X,
  Hexagon,
  ChevronLeft,
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification } from '@/types';

const NAV_ITEMS = [
  { to: '/app', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/app/contacts', label: 'Contacts', icon: Users },
  { to: '/app/properties', label: 'Biens', icon: Building2 },
  { to: '/app/deals', label: 'Pipeline', icon: Kanban },
  { to: '/app/matching', label: 'Matching IA', icon: Sparkles },
] as const;

const TYPE_COLORS: Record<Notification['type'], string> = {
  info: 'bg-blue-500',
  warning: 'bg-amber-500',
  success: 'bg-emerald-500',
  ai_suggestion: 'bg-violet-500',
};

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSeconds = Math.floor((now - then) / 1000);

  if (diffSeconds < 60) return "à l'instant";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `il y a ${diffMinutes}min`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `il y a ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `il y a ${diffDays}j`;
  const diffMonths = Math.floor(diffDays / 30);
  return `il y a ${diffMonths}mo`;
}

// --- Sidebar ---

function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-gray-950 text-white
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <Hexagon className="h-7 w-7 text-brand-400" strokeWidth={1.8} />
            <span className="text-lg font-bold tracking-tight">EstateFlow</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white lg:hidden"
            aria-label="Fermer le menu"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon, ...rest }) => (
            <NavLink
              key={to}
              to={to}
              end={'end' in rest}
              onClick={onClose}
              className={({ isActive }) =>
                isActive ? 'sidebar-link-active' : 'sidebar-link'
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-gray-800 px-4 py-4">
          <p className="truncate text-xs text-gray-500">
            {location.pathname.replace('/app', '') || '/'}
          </p>
        </div>
      </aside>
    </>
  );
}

// --- Notification Panel ---

function NotificationPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { notifications, markAsRead } = useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);

  const markAllAsRead = useCallback(() => {
    notifications.filter((n) => !n.read).forEach((n) => markAsRead(n.id));
  }, [notifications, markAsRead]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
          aria-hidden="true"
        />
      )}

      <div
        ref={panelRef}
        className={`
          fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-5">
          <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllAsRead}
              className="text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              Tout marquer comme lu
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Fermer les notifications"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="overflow-y-auto" style={{ height: 'calc(100% - 4rem)' }}>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Bell className="mb-3 h-10 w-10 stroke-1" />
              <p className="text-sm">Aucune notification</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className={`
                      flex w-full gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50
                      ${!notification.read ? 'bg-brand-50/40' : ''}
                    `}
                  >
                    {/* Type indicator dot */}
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TYPE_COLORS[notification.type]}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p
                          className={`truncate text-sm ${
                            notification.read
                              ? 'font-medium text-gray-600'
                              : 'font-semibold text-gray-900'
                          }`}
                        >
                          {notification.title}
                        </p>
                        <span className="shrink-0 text-xs text-gray-400">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                        {notification.message}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

// --- AppLayout ---

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { unreadCount } = useNotifications();

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const closeNotif = useCallback(() => setNotifOpen(false), []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />

      {/* Main column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar (mobile) + notification trigger */}
        <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 lg:justify-end lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Right actions */}
          <button
            onClick={() => setNotifOpen((prev) => !prev)}
            className="relative rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <NotificationPanel open={notifOpen} onClose={closeNotif} />
    </div>
  );
}
