// import { useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { useTheme } from '../context/ThemeContext';
// import NotificationBell from './NotificationBell';
// import Footer from './Footer';

// export default function Layout({ children }) {
//     const [sidebarOpen, setSidebarOpen] = useState(true);
//     const { user, signOut } = useAuth();
//     const { darkMode, toggleTheme } = useTheme();
//     const navigate = useNavigate();
//     const location = useLocation();

//     const handleSignOut = async () => {
//         await signOut();
//         navigate('/login');
//     };

//     const menuItems = [
//         {
//             name: 'Dashboard',
//             path: '/dashboard',
//             icon: (
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
//                 </svg>
//             ),
//         },
//         {
//             name: 'Clients',
//             path: '/clients',
//             icon: (
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                 </svg>
//             ),
//         },
//         {
//             name: 'Compagnies',
//             path: '/compagnies',
//             icon: (
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                 </svg>
//             ),
//         },
//         {
//             name: 'Contrats',
//             path: '/contrats',
//             icon: (
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//             ),
//         },
//         {
//             name: 'Paiements',
//             path: '/paiements',
//             icon: (
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
//                 </svg>
//             ),
//         },
//         {
//             name: 'Médias',
//             path: '/medias',
//             icon: (
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
//                 </svg>
//             ),
//         },
//         {
//             name: 'Paramètres',
//             path: '/parametres',
//             icon: (
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                 </svg>
//             ),
//         },
//     ];

//     const isActive = (path) => location.pathname === path;

//     return (
//         <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
//             {/* Sidebar */}
//             <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-primary-600 to-primary-800 dark:from-gray-800 dark:to-gray-950 text-white transition-all duration-300 ease-in-out shadow-strong relative`}>
//                 {/* Logo */}
//                 <div className="h-16 flex items-center justify-between px-4 border-b border-primary-700 dark:border-gray-700">
//                     {sidebarOpen && (
//                         <h1 className="text-xl font-bold animate-fade-in">Sirius Assurance</h1>
//                     )}
//                     <button
//                         onClick={() => setSidebarOpen(!sidebarOpen)}
//                         className="p-2 rounded-lg hover:bg-primary-700 dark:hover:bg-gray-700 transition-colors"
//                     >
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                         </svg>
//                     </button>
//                 </div>

//                 {/* Menu */}
//                 <nav className="mt-6 px-3 pb-32 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
//                     {menuItems.map((item) => (
//                         <button
//                             key={item.path}
//                             onClick={() => navigate(item.path)}
//                             className={`w-full flex items-center gap-3 px-3 py-3 mb-2 rounded-lg transition-all duration-200 ${isActive(item.path)
//                                     ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-white shadow-medium'
//                                     : 'hover:bg-primary-700 dark:hover:bg-gray-700 text-white'
//                                 }`}
//                         >
//                             {item.icon}
//                             {sidebarOpen && (
//                                 <span className="font-medium animate-fade-in">{item.name}</span>
//                             )}
//                         </button>
//                     ))}
//                 </nav>

//                 {/* User section au bas - CORRIGÉ */}
//                 <div className="absolute bottom-0 left-0 w-full p-4 border-t border-primary-700 dark:border-gray-700" style={{ width: sidebarOpen ? '16rem' : '5rem' }}>
//                     <button
//                         onClick={handleSignOut}
//                         className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-primary-700 dark:hover:bg-gray-700 rounded-lg transition-colors ${!sidebarOpen && 'justify-center'}`}
//                     >
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                         </svg>
//                         {sidebarOpen && <span className="animate-fade-in">Déconnexion</span>}
//                     </button>
//                 </div>
//             </aside>

//             {/* Main Content */}
//             <div className="flex-1 flex flex-col overflow-hidden">
//                 {/* Header */}
//                 <header className="h-16 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-between px-6 transition-colors">
//                     <div>
//                         <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
//                             {menuItems.find(item => item.path === location.pathname)?.name || 'Page'}
//                         </h2>
//                     </div>

//                     <div className="flex items-center gap-4">
//                         {/* Bouton Mode Jour/Nuit */}
//                         <button
//                             onClick={toggleTheme}
//                             className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//                             title={darkMode ? 'Mode Jour' : 'Mode Nuit'}
//                         >
//                             {darkMode ? (
//                                 <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
//                                     <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
//                                 </svg>
//                             ) : (
//                                 <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
//                                     <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
//                                 </svg>
//                             )}
//                         </button>

//                         {/* Informations utilisateur */}
//                         <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
//                             <div className="relative">
//                                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
//                                     {user?.email?.[0]?.toUpperCase()}
//                                 </div>
//                                 <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success-500 border-2 border-white dark:border-gray-700 rounded-full"></div>
//                             </div>

//                             <div className="text-left">
//                                 <p className="text-sm font-semibold text-gray-900 dark:text-white">
//                                     {user?.email}
//                                 </p>
//                                 <span className="flex items-center gap-1 text-xs text-success-600 dark:text-success-400">
//                                     <span className="w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse"></span>
//                                     Actif
//                                 </span>
//                             </div>
//                         </div>

//                         {/* Bouton déconnexion header */}
//                         <button
//                             onClick={handleSignOut}
//                             className="p-2.5 bg-danger-50 dark:bg-danger-900 text-danger-600 dark:text-danger-400 rounded-lg hover:bg-danger-100 dark:hover:bg-danger-800 transition-colors group"
//                             title="Déconnexion"
//                         >
//                             <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                             </svg>
//                         </button>
//                     </div>
//                 </header>

//                 {/* Main Content */}
//                 <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
//                     <div className="animate-slide-up">
//                         {children}
//                     </div>
//                 </main>

//                 {/* Footer */}
//                 <Footer />
//             </div>
//         </div>
//     );
// }













// CODE PRECEDENT AVEC TOUT SAUF NOTIF








// ce code marche bien sans la partie recherch
// import { useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { useTheme } from '../context/ThemeContext';
// import NotificationBell from './NotificationBell';
// import Footer from './Footer';

// export default function Layout({ children }) {
//     const [sidebarOpen, setSidebarOpen] = useState(true);
//     const { user, signOut } = useAuth();
//     const { darkMode, toggleTheme } = useTheme();
//     const navigate = useNavigate();
//     const location = useLocation();

//     const handleSignOut = async () => {
//         await signOut();
//         navigate('/login');
//     };

//     const menuItems = [
//         {
//             name: 'Dashboard',
//             path: '/dashboard',
//             icon: (
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
//                 </svg>
//             ),
//         },
//         {
//             name: 'Clients',
//             path: '/clients',
//             icon: (
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                 </svg>
//             ),
//         },
//         {
//             name: 'Compagnies',
//             path: '/compagnies',
//             icon: (
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                 </svg>
//             ),
//         },
//         {
//             name: 'Contrats',
//             path: '/contrats',
//             icon: (
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//             ),
//         },
//         {
//             name: 'Paiements',
//             path: '/paiements',
//             icon: (
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
//                 </svg>
//             ),
//         },
//         {
//             name: 'Médias',
//             path: '/medias',
//             icon: (
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
//                 </svg>
//             ),
//         },
//         {
//             name: 'Paramètres',
//             path: '/parametres',
//             icon: (
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                 </svg>
//             ),
//         },
//     ];

//     const isActive = (path) => location.pathname === path;

//     return (
//         <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
//             {/* Sidebar */}
//             <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-primary-600 to-primary-800 dark:from-gray-800 dark:to-gray-950 text-white transition-all duration-300 ease-in-out shadow-strong relative`}>
//                 <div className="h-16 flex items-center justify-between px-4 border-b border-primary-700 dark:border-gray-700">
//                     {sidebarOpen && (
//                         <h1 className="text-xl font-bold animate-fade-in">Sirius Assurance</h1>
//                     )}
//                     <button
//                         onClick={() => setSidebarOpen(!sidebarOpen)}
//                         className="p-2 rounded-lg hover:bg-primary-700 dark:hover:bg-gray-700 transition-colors"
//                     >
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                         </svg>
//                     </button>
//                 </div>

//                 <nav className="mt-6 px-3 pb-32 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
//                     {menuItems.map((item) => (
//                         <button
//                             key={item.path}
//                             onClick={() => navigate(item.path)}
//                             className={`w-full flex items-center gap-3 px-3 py-3 mb-2 rounded-lg transition-all duration-200 ${isActive(item.path)
//                                 ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-white shadow-medium'
//                                 : 'hover:bg-primary-700 dark:hover:bg-gray-700 text-white'
//                                 }`}
//                         >
//                             {item.icon}
//                             {sidebarOpen && (
//                                 <span className="font-medium animate-fade-in">{item.name}</span>
//                             )}
//                         </button>
//                     ))}
//                 </nav>

//                 <div className="absolute bottom-0 left-0 w-full p-4 border-t border-primary-700 dark:border-gray-700" style={{ width: sidebarOpen ? '16rem' : '5rem' }}>
//                     <button
//                         onClick={handleSignOut}
//                         className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-primary-700 dark:hover:bg-gray-700 rounded-lg transition-colors ${!sidebarOpen && 'justify-center'}`}
//                     >
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                         </svg>
//                         {sidebarOpen && <span className="animate-fade-in">Déconnexion</span>}
//                     </button>
//                 </div>
//             </aside>

//             {/* Main Content */}
//             <div className="flex-1 flex flex-col overflow-hidden">
//                 <header className="h-16 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-between px-6 transition-colors">
//                     <div>
//                         <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
//                             {menuItems.find(item => item.path === location.pathname)?.name || 'Page'}
//                         </h2>
//                     </div>

//                     <div className="flex items-center gap-4">
//                         {/* Bouton Mode Jour/Nuit */}
//                         <button
//                             onClick={toggleTheme}
//                             className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//                             title={darkMode ? 'Mode Jour' : 'Mode Nuit'}
//                         >
//                             {darkMode ? (
//                                 <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
//                                     <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
//                                 </svg>
//                             ) : (
//                                 <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
//                                     <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
//                                 </svg>
//                             )}
//                         </button>

//                         {/* Notifications */}
//                         <NotificationBell />

//                         {/* Informations utilisateur */}
//                         <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
//                             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
//                                 {user?.email?.[0]?.toUpperCase()}
//                             </div>

//                             <div className="text-left">
//                                 <p className="text-sm font-semibold text-gray-900 dark:text-white">
//                                     {user?.email}
//                                 </p>
//                                 <span className="flex items-center gap-1 text-xs text-success-600 dark:text-success-400">
//                                     <span className="w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse"></span>
//                                     Actif
//                                 </span>
//                             </div>
//                         </div>

//                         {/* Bouton déconnexion */}
//                         <button
//                             onClick={handleSignOut}
//                             className="p-2.5 bg-danger-50 dark:bg-danger-900 text-danger-600 dark:text-danger-400 rounded-lg hover:bg-danger-100 dark:hover:bg-danger-800 transition-colors group"
//                             title="Déconnexion"
//                         >
//                             <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                             </svg>
//                         </button>
//                     </div>
//                 </header>

//                 <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
//                     <div className="animate-slide-up">
//                         {children}
//                     </div>
//                 </main>

//                 <Footer />
//             </div>
//         </div>
//     );
// }


















// code avec recherche
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';
import GlobalSearch from './GlobalSearch';
import Footer from './Footer';

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, signOut } = useAuth();
    const { darkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const menuItems = [
        {
            name: 'Dashboard',
            path: '/dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            name: 'Clients',
            path: '/clients',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
        },
        {
            name: 'Compagnies',
            path: '/compagnies',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
        },
        {
            name: 'Contrats',
            path: '/contrats',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
        },
        {
            name: 'Paiements',
            path: '/paiements',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            ),
        },
        {
            name: 'Médias',
            path: '/medias',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
            ),
        },
        {
            name: 'Paramètres',
            path: '/parametres',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
        },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-primary-600 to-primary-800 dark:from-gray-800 dark:to-gray-950 text-white transition-all duration-300 ease-in-out shadow-strong relative`}>
                <div className="h-16 flex items-center justify-between px-4 border-b border-primary-700 dark:border-gray-700">
                    {sidebarOpen && (
                        <h1 className="text-xl font-bold animate-fade-in">Sirius Assurance</h1>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-primary-700 dark:hover:bg-gray-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                <nav className="mt-6 px-3 pb-32 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-3 py-3 mb-2 rounded-lg transition-all duration-200 ${isActive(item.path)
                                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-white shadow-medium'
                                    : 'hover:bg-primary-700 dark:hover:bg-gray-700 text-white'
                                }`}
                        >
                            {item.icon}
                            {sidebarOpen && (
                                <span className="font-medium animate-fade-in">{item.name}</span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="absolute bottom-0 left-0 w-full p-4 border-t border-primary-700 dark:border-gray-700" style={{ width: sidebarOpen ? '16rem' : '5rem' }}>
                    <button
                        onClick={handleSignOut}
                        className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-primary-700 dark:hover:bg-gray-700 rounded-lg transition-colors ${!sidebarOpen && 'justify-center'}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {sidebarOpen && <span className="animate-fade-in">Déconnexion</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-between px-6 transition-colors">
                    {/* Partie gauche avec titre et recherche */}
                    <div className="flex items-center gap-6 flex-1">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                            {menuItems.find(item => item.path === location.pathname)?.name || 'Page'}
                        </h2>

                        {/* Recherche globale - AJOUTÉE ICI */}
                        <GlobalSearch />
                    </div>

                    {/* Partie droite avec boutons */}
                    <div className="flex items-center gap-4">
                        {/* Bouton Mode Jour/Nuit */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            title={darkMode ? 'Mode Jour' : 'Mode Nuit'}
                        >
                            {darkMode ? (
                                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                </svg>
                            )}
                        </button>

                        {/* Notifications */}
                        <NotificationBell />

                        {/* Informations utilisateur */}
                        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
                                {user?.email?.[0]?.toUpperCase()}
                            </div>

                            <div className="text-left">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {user?.email}
                                </p>
                                <span className="flex items-center gap-1 text-xs text-success-600 dark:text-success-400">
                                    <span className="w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse"></span>
                                    Actif
                                </span>
                            </div>
                        </div>

                        {/* Bouton déconnexion */}
                        <button
                            onClick={handleSignOut}
                            className="p-2.5 bg-danger-50 dark:bg-danger-900 text-danger-600 dark:text-danger-400 rounded-lg hover:bg-danger-100 dark:hover:bg-danger-800 transition-colors group"
                            title="Déconnexion"
                        >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
                    <div className="animate-slide-up">
                        {children}
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
}