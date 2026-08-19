import React from 'react';
import { Alert } from 'reactstrap';

export interface AppNotification {
  id: number;
  type: 'success' | 'danger';
  message: string;
}

interface NotificationStackProps {
  notifications: AppNotification[];
  onDismiss: (id: number) => void;
}

const stackStyle: React.CSSProperties = {
  position: 'fixed',
  top: '1rem',
  right: '1rem',
  zIndex: 1090, // au-dessus d'AppLoader (1080)
  width: 'min(360px, calc(100vw - 2rem))',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const NotificationStack: React.FC<NotificationStackProps> = ({ notifications, onDismiss }) => {
  if (notifications.length === 0) return null;

  return (
    <div style={stackStyle} aria-live="polite" aria-atomic="false">
      {notifications.map((n) => (
        <Alert
          key={n.id}
          color={n.type}
          toggle={() => onDismiss(n.id)}
          className="shadow-sm mb-0"
        >
          {n.message}
        </Alert>
      ))}
    </div>
  );
};

export default NotificationStack;