import React from 'react';
import { Bell } from 'lucide-react';
import { getNotifications } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';

interface NotificationProps {
  showNotifications: boolean;
  setShowNotifications: (isOpen: boolean) => void;
}

const Notification: React.FC<NotificationProps> = ({ showNotifications, setShowNotifications }) => {
  const { user } = useAuth();
  const notifications = getNotifications().filter(n => n.userId === user?.id && !n.read);

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors relative"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No new notifications
              </div>
            ) : (
              notifications.slice(0, 5).map(notification => (
                <div key={notification.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <p className="text-sm text-gray-900">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;