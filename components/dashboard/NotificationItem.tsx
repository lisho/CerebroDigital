import React from 'react';
import { Notification } from '../../types';
import BellIcon from '../icons/BellIcon'; 

interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  return (
    <div className="flex items-start space-x-3 p-3 bg-theme-bg-card hover:bg-theme-bg-tertiary rounded-lg transition-colors duration-150">
      <div className="flex-shrink-0 mt-1">
        {notification.icon || <BellIcon className="w-5 h-5 text-theme-accent-primary" />}
      </div>
      <div>
        <p className="text-sm text-theme-text-primary">{notification.message}</p>
        <p className="text-xs text-theme-text-secondary">{notification.time}</p>
      </div>
    </div>
  );
};

export default NotificationItem;