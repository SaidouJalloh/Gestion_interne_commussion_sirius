import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProfileContext } from '../../context/ProfileContext';
import { useTheme } from '../../context/ThemeContext';
import type { ReactNode } from 'react';

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, signOut } = useAuth();
    const { profile } = useProfileContext();
    const { darkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    // Menu simple pour superadmin
    const menuItems = useMemo(() => [
        {
            name: 'Organisations',
            path: '/superadmin/organizations',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
        },
        {
            name: 'Utilisateurs',
            path: '/superadmin/utilisateurs',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
        },
        {
            name: 'Paramètres',
            path: '/superadmin/parametres',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
        },
    ], []);

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            {/* Sidebar simple */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 dark:bg-gray-950 text-white transition-all duration-300 ease-in-out shadow-lg relative`}>
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
                    {sidebarOpen && (
                        <h1 className="text-xl font-bold">Sirius Assurance</h1>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
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
                                ? 'bg-gray-700 text-white shadow-md'
                                : 'hover:bg-gray-700 text-gray-300'
                                }`}
                        >
                            {item.icon}
                            {sidebarOpen && (
                                <span className="font-medium">{item.name}</span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-700">
                    <button
                        onClick={handleSignOut}
                        className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-700 rounded-lg transition-colors ${!sidebarOpen && 'justify-center'}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {sidebarOpen && <span>Déconnexion</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-between px-6 transition-colors">
                    <div className="flex items-center gap-6 flex-1">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                            {menuItems.find(item => item.path === location.pathname)?.name || 'Administration'}
                        </h2>
                    </div>

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

                        {/* Informations utilisateur */}
                        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            {profile?.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt="Avatar"
                                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-400"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-lg">
                                    {profile?.prenom?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'S'}
                                </div>
                            )}

                            <div className="text-left">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {profile?.prenom && profile?.nom
                                        ? `${profile.prenom} ${profile.nom}`
                                        : user?.email}
                                </p>
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                    Super Admin
                                </span>
                            </div>
                        </div>

                        {/* Bouton déconnexion */}
                        <button
                            onClick={handleSignOut}
                            className="p-2.5 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
                            title="Déconnexion"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
                    {children}
                </main>
            </div>
        </div>
    );
}
