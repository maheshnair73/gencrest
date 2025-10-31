import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Settings, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  time: string;
  read: boolean;
  category: string;
}

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const userRole = user?.user_metadata?.role || 'MDO';
  const userId = user?.id || 'unknown';

  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId, userRole]);

  const fetchNotifications = async () => {
    try {
      // Fetch verification notifications
      const { data: verificationNotifs, error } = await supabase
        .from('verification_notifications')
        .select('*')
        .or(`recipient_id.eq.${userId},recipient_role.eq.${userRole}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Convert to notification format
      const formattedNotifs: Notification[] = (verificationNotifs || []).map((notif: any) => ({
        id: notif.id,
        title: notif.title,
        message: notif.message,
        type: notif.notification_type === 'verification_approved' ? 'success' :
              notif.notification_type === 'verification_rejected' ? 'alert' : 'info',
        time: getTimeAgo(notif.created_at),
        read: notif.is_read,
        category: 'Stock Verification'
      }));

      // Add mock notifications for demo
      const mockNotifs: Notification[]= [
        {
          id: 'mock-1',
          title: 'Travel Reimbursement Approved',
          message: 'Your travel reimbursement claim for ₹5,250 has been approved.',
          type: 'success',
          time: '2 hours ago',
          read: true,
          category: 'Finance'
        },
        {
          id: 'mock-2',
          title: 'Meeting Reminder',
          message: 'Regional review meeting scheduled for tomorrow at 10:00 AM.',
          type: 'info',
          time: '3 hours ago',
          read: true,
          category: 'Meetings'
        },
        {
          id: 'mock-3',
          title: 'Target Achievement Alert',
          message: 'You have achieved 85% of your monthly target. Keep up the good work!',
          type: 'success',
          time: '1 day ago',
          read: true,
          category: 'Performance'
        }
      ];

      setNotifications([...formattedNotifs, ...mockNotifs]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read && !notification.id.startsWith('mock')) {
      await supabase
        .from('verification_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notification.id);

      setNotifications(notifs =>
        notifs.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
    }

    // Navigate to Activity Tracker verifications tab
    if (notification.category === 'Stock Verification') {
      navigate('/activity-tracker/team-activity');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'alert': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Mark all as read</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-medium">Clear all</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Unread {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center card-shadow">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-600">
            {filter === 'unread' ? "You're all caught up! No unread notifications." : "You don't have any notifications yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`bg-white rounded-xl p-4 card-shadow transition-all hover:shadow-md cursor-pointer ${
                !notification.read ? 'border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getTypeColor(notification.type)}`}>
                      {notification.category}
                    </span>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                  <span className="text-xs text-gray-500">{notification.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl p-6 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Notification Preferences
          </h3>
        </div>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <span className="text-sm font-medium text-gray-700">Email notifications</span>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
          </label>
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <span className="text-sm font-medium text-gray-700">Work plan reminders</span>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
          </label>
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <span className="text-sm font-medium text-gray-700">Approval notifications</span>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
          </label>
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <span className="text-sm font-medium text-gray-700">Performance alerts</span>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
          </label>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
