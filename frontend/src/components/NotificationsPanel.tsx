import { useState } from 'react';
import { IconBell, IconSparkles, IconUsers, IconTrendingUp, IconMessage } from '@tabler/icons-react';
import { cn } from '@/lib/cn';

interface Notification {
  id: string;
  icon: typeof IconSparkles;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    icon: IconSparkles,
    title: 'New pick ready',
    body: 'Your curator found something that scored a 92% fit against your goal.',
    time: '12m ago',
    read: false,
  },
  {
    id: 'n2',
    icon: IconMessage,
    title: 'Reply in a thread you upvoted',
    body: 'devon_k replied to "The obstacle doesn\'t go away, you just get faster at noticing you\'re stuck."',
    time: '1h ago',
    read: false,
  },
  {
    id: 'n3',
    icon: IconTrendingUp,
    title: 'Closing in on Breakthrough',
    body: 'Two more reflections and your curator will start serving harder, more specific content.',
    time: '5h ago',
    read: true,
  },
  {
    id: 'n4',
    icon: IconUsers,
    title: 'Struggle threads are trending',
    body: "d/thearc is weighted toward Struggle this week — you're well placed to help.",
    time: '1d ago',
    read: true,
  },
];

export function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(SEED_NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-full bg-surface text-white hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-spotlight focus:outline-none transition-colors"
      >
        <IconBell className="w-5 h-5" stroke={1.5} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-spotlight" aria-hidden="true" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            role="dialog"
            aria-label="Notifications"
            className="absolute right-0 mt-2 w-[340px] max-w-[90vw] bg-surface rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h2 className="text-sm font-semibold text-white">Notifications</h2>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs font-medium text-mint-300 hover:text-mint-200 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="text-sm text-muted text-center py-8">You're all caught up.</p>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => markRead(n.id)}
                    className={cn(
                      'w-full flex gap-3 px-4 py-3 text-left border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors',
                      !n.read && 'bg-white/[0.03]'
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      <n.icon className="w-4 h-4 text-white/70" stroke={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-spotlight shrink-0" aria-hidden="true" />}
                        <p className="text-sm font-medium text-white truncate">{n.title}</p>
                      </div>
                      <p className="text-xs text-muted leading-relaxed mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-[11px] text-white/30 mt-1">{n.time}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
