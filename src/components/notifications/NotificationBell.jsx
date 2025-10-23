// src/components/notifications/NotificationBell.jsx
import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationItem } from './NotificationItem';

export const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

    // Fermer le dropdown en cliquant à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bouton cloche */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>

                {/* Badge compteur */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-strong border border-gray-200 dark:border-gray-700 z-50 max-h-[80vh] flex flex-col animate-scale-in">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                            >
                                Tout marquer comme lu
                            </button>
                        )}
                    </div>

                    {/* Liste */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-12">
                                <span className="text-4xl mb-2 block">🔔</span>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Aucune notification</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {notifications.slice(0, 10).map((notif) => (
                                    <NotificationItem
                                        key={notif.id}
                                        notification={notif}
                                        onMarkAsRead={markAsRead}
                                        onDelete={deleteNotification}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 10 && (
                        <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                            <button className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
                                Voir toutes les notifications ({notifications.length})
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};