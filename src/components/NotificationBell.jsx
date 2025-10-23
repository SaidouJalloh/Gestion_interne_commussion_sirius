// import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabaseClient';
// import { useNavigate } from 'react-router-dom';

// export default function NotificationBell() {
//     const [notifications, setNotifications] = useState([]);
//     const [showDropdown, setShowDropdown] = useState(false);
//     const [unreadCount, setUnreadCount] = useState(0);
//     const navigate = useNavigate();

//     useEffect(() => {
//         fetchNotifications();

//         // S'abonner aux nouvelles notifications en temps réel
//         const subscription = supabase
//             .channel('notifications')
//             .on('postgres_changes',
//                 { event: 'INSERT', schema: 'public', table: 'notifications' },
//                 (payload) => {
//                     setNotifications(prev => [payload.new, ...prev]);
//                     setUnreadCount(prev => prev + 1);
//                 }
//             )
//             .subscribe();

//         return () => {
//             subscription.unsubscribe();
//         };
//     }, []);

//     const fetchNotifications = async () => {
//         try {
//             const { data, error } = await supabase
//                 .from('notifications')
//                 .select('*')
//                 .order('created_at', { ascending: false })
//                 .limit(20);

//             if (error) throw error;

//             setNotifications(data || []);
//             setUnreadCount(data?.filter(n => n.statut === 'non_lu').length || 0);
//         } catch (error) {
//             console.error('Erreur notifications:', error);
//         }
//     };

//     const marquerCommeLu = async (id) => {
//         try {
//             await supabase
//                 .from('notifications')
//                 .update({ statut: 'lu' })
//                 .eq('id', id);

//             setNotifications(prev =>
//                 prev.map(n => n.id === id ? { ...n, statut: 'lu' } : n)
//             );
//             setUnreadCount(prev => Math.max(0, prev - 1));
//         } catch (error) {
//             console.error('Erreur marquer comme lu:', error);
//         }
//     };

//     const marquerToutCommeLu = async () => {
//         try {
//             await supabase
//                 .from('notifications')
//                 .update({ statut: 'lu' })
//                 .eq('statut', 'non_lu');

//             setNotifications(prev =>
//                 prev.map(n => ({ ...n, statut: 'lu' }))
//             );
//             setUnreadCount(0);
//         } catch (error) {
//             console.error('Erreur marquer tout comme lu:', error);
//         }
//     };

//     const supprimerNotification = async (id) => {
//         try {
//             await supabase
//                 .from('notifications')
//                 .delete()
//                 .eq('id', id);

//             setNotifications(prev => prev.filter(n => n.id !== id));
//         } catch (error) {
//             console.error('Erreur suppression:', error);
//         }
//     };

//     const getIconByType = (type) => {
//         const icons = {
//             contrat_expirant: '⏰',
//             paiement_retard: '❗',
//             commission_recue: '💰',
//             nouveau_contrat: '📋'
//         };
//         return icons[type] || '🔔';
//     };

//     const getPriorityColor = (priorite) => {
//         const colors = {
//             urgente: 'bg-red-100 dark:bg-red-900 border-red-500',
//             haute: 'bg-orange-100 dark:bg-orange-900 border-orange-500',
//             normale: 'bg-blue-100 dark:bg-blue-900 border-blue-500',
//             basse: 'bg-gray-100 dark:bg-gray-700 border-gray-500'
//         };
//         return colors[priorite] || colors.normale;
//     };

//     const handleNotificationClick = (notification) => {
//         marquerCommeLu(notification.id);
//         if (notification.contrat_id) {
//             navigate('/contrats');
//         }
//         setShowDropdown(false);
//     };

//     return (
//         <div className="relative">
//             {/* Bouton cloche */}
//             <button
//                 onClick={() => setShowDropdown(!showDropdown)}
//                 className="relative p-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//                 title="Notifications"
//             >
//                 <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
//                 </svg>

//                 {/* Badge nombre de notifications non lues */}
//                 {unreadCount > 0 && (
//                     <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
//                         {unreadCount > 9 ? '9+' : unreadCount}
//                     </span>
//                 )}
//             </button>

//             {/* Dropdown notifications */}
//             {showDropdown && (
//                 <>
//                     {/* Overlay pour fermer en cliquant à l'extérieur */}
//                     <div
//                         className="fixed inset-0 z-40"
//                         onClick={() => setShowDropdown(false)}
//                     ></div>

//                     {/* Panel notifications */}
//                     <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[600px] overflow-hidden flex flex-col">
//                         {/* Header */}
//                         <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
//                             <h3 className="font-bold text-gray-900 dark:text-white">
//                                 Notifications ({unreadCount} non lues)
//                             </h3>
//                             {unreadCount > 0 && (
//                                 <button
//                                     onClick={marquerToutCommeLu}
//                                     className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
//                                 >
//                                     Tout marquer comme lu
//                                 </button>
//                             )}
//                         </div>

//                         {/* Liste notifications */}
//                         <div className="overflow-y-auto flex-1">
//                             {notifications.length === 0 ? (
//                                 <div className="p-8 text-center text-gray-500 dark:text-gray-400">
//                                     <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
//                                     </svg>
//                                     <p>Aucune notification</p>
//                                 </div>
//                             ) : (
//                                 notifications.map((notif) => (
//                                     <div
//                                         key={notif.id}
//                                         onClick={() => handleNotificationClick(notif)}
//                                         className={`p-4 border-l-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${notif.statut === 'non_lu' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
//                                             } ${getPriorityColor(notif.priorite)}`}
//                                     >
//                                         <div className="flex items-start gap-3">
//                                             <span className="text-2xl">{getIconByType(notif.type)}</span>
//                                             <div className="flex-1 min-w-0">
//                                                 <div className="flex items-start justify-between gap-2">
//                                                     <h4 className={`text-sm font-semibold ${notif.statut === 'non_lu' ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
//                                                         }`}>
//                                                         {notif.titre}
//                                                     </h4>
//                                                     <button
//                                                         onClick={(e) => {
//                                                             e.stopPropagation();
//                                                             supprimerNotification(notif.id);
//                                                         }}
//                                                         className="text-gray-400 hover:text-red-500 transition-colors"
//                                                     >
//                                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                                         </svg>
//                                                     </button>
//                                                 </div>
//                                                 <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
//                                                     {notif.message}
//                                                 </p>
//                                                 <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
//                                                     {new Date(notif.created_at).toLocaleDateString('fr-FR', {
//                                                         day: '2-digit',
//                                                         month: 'short',
//                                                         hour: '2-digit',
//                                                         minute: '2-digit'
//                                                     })}
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))
//                             )}
//                         </div>

//                         {/* Footer */}
//                         {notifications.length > 0 && (
//                             <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
//                                 <button
//                                     onClick={() => {
//                                         setShowDropdown(false);
//                                         navigate('/notifications');
//                                     }}
//                                     className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
//                                 >
//                                     Voir toutes les notifications
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// }