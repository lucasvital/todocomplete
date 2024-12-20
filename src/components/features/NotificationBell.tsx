import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { db } from '../../config/firebase';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.email) return;

    // Escutar notificações em tempo real
    const q = query(
      collection(db, 'notifications'),
      where('toEmail', '==', user.email),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);

      // Solicitar permissão para notificações do navegador
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }

      // Mostrar notificação do navegador para novas notificações não lidas
      notifs.filter(n => !n.read).forEach(notif => {
        if (Notification.permission === 'granted') {
          new Notification('Nova Notificação', {
            body: notif.message,
          });
        }
      });
    });

    return () => unsubscribe();
  }, [user?.email]);

  const markAsRead = async (notificationId) => {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium">Notificações</h4>
          {notifications.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma notificação</p>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-2 hover:bg-slate-100 rounded-md cursor-pointer"
                onClick={() => markAsRead(notif.id)}
              >
                <p className="text-sm">{notif.message}</p>
                <span className="text-xs text-slate-500">
                  {new Date(notif.createdAt.toDate()).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
