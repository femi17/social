import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { fetchNotifications, markNotificationAsRead } from '../apiUtils';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchNotificationData = async () => {
      try {
        const data = await fetchNotifications();
        setNotifications(data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotificationData();
    // Set up a polling mechanism to fetch notifications periodically
    const intervalId = setInterval(fetchNotificationData, 60000); // Fetch every minute

    return () => clearInterval(intervalId);
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(notifications.map(notification => 
        notification.id === notificationId ? {...notification, is_read: true} : notification
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="p-1 rounded-full text-gray-400 hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
      >
        <Bell size={20} className="text-gray-500" />
        {notifications.some(notification => !notification.is_read) && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
          <div className="py-2">
            {notifications.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-700">No new notifications</div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`px-4 py-2 hover:bg-gray-100 ${notification.is_read ? 'bg-gray-50' : 'bg-white'}`}
                >
                  <p className="text-sm text-gray-900">{notification.message}</p>
                  <p className="text-xs text-gray-500">{new Date(notification.created_at).toLocaleString()}</p>
                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                    >
                      Mark as read
                    </button>
                  )}
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