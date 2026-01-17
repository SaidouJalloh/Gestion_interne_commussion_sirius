// src/components/notifications/NotificationItem.jsx
import type { FC, MouseEvent } from 'react';
import { getNotificationIcon, getPriorityColor, getRelativeTime } from '../../utils/notificationHelpers';

type Notification = {
    id: string;
    statut?: string | null;
    priorite?: string | null;
    type?: string | null;
    titre?: string | null;
    message?: string | null;
    created_at: string;
};

type NotificationItemProps = {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
};

export const NotificationItem: FC<NotificationItemProps> = ({ notification, onMarkAsRead, onDelete }) => {
    const handleClick = () => {
        if (notification.statut === 'non_lu') {
            onMarkAsRead(notification.id);
        }
    };

    return (
        <div
            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer border-l-4 ${notification.statut === 'non_lu'
                    ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-900/20'
                    : 'border-transparent'
                }`}
            onClick={handleClick}
        >
            <div className="flex items-start gap-3">
                {/* Icône */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getPriorityColor(notification.priorite ?? 'normale')}`}>
                    <span className="text-xl">{getNotificationIcon(notification.type ?? '')}</span>
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {notification.titre ?? 'Notification'}
                        </p>
                        {notification.statut === 'non_lu' && (
                            <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1"></span>
                        )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {notification.message ?? ''}
                    </p>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                            {getRelativeTime(notification.created_at)}
                        </span>
                        <button
                            onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                e.stopPropagation();
                                onDelete(notification.id);
                            }}
                            className="text-xs text-danger-600 hover:text-danger-700 dark:text-danger-400"
                        >
                            Supprimer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};