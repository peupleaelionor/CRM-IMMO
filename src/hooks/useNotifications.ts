import { useCallback, useMemo } from 'react';
import type { Notification } from '../types';
import { useLocalStorage } from './useLocalStorage';

export function useNotifications() {
  const [notifications, setNotifications] = useLocalStorage<Notification[]>(
    'estateflow_notifications',
    [],
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const markAsRead = useCallback(
    (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    },
    [setNotifications],
  );

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
      const newNotification: Notification = {
        ...notification,
        id: `n_${Date.now()}`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotification, ...prev]);
    },
    [setNotifications],
  );

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, [setNotifications]);

  return { notifications, unreadCount, markAsRead, addNotification, clearAll };
}
