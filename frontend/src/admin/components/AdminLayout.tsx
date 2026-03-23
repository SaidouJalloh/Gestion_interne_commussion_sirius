
// code avec souscription
import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, FileText, CreditCard, FolderPlus, FolderOpen, UserCog, Settings, LogOut, Sun, Moon, Leaf, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProfileContext } from '../../context/ProfileContext';
import { useTheme } from '../../context/ThemeContext';
import { NotificationBell } from './notifications/NotificationBell';
// import NotificationBell from './notifications/NotificationBell';
import { OrganizationSelector } from '../../components/OrganizationSelector';

import GlobalSearch from './GlobalSearch';
import Footer from './Footer';

import type { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
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

    // Configuration complète du menu avec les rôles autorisés
    const allMenuItems = useMemo(() => ([
        {
            name: 'Dashboard',
            path: '/org/dashboard',
            icon: <LayoutDashboard className="w-5 h-5" />,
            allowedRoles: ['admin', 'superadmin']
        },
        {
            name: 'Clients',
            path: '/org/clients',
            icon: <Users className="w-5 h-5" />,
            allowedRoles: ['gestionnaire', 'admin', 'superadmin']
        },
        {
            name: 'Compagnies',
            path: '/org/compagnies',
            icon: <Building2 className="w-5 h-5" />,
            allowedRoles: ['admin', 'superadmin']
        },
        {
            name: 'Contrats',
            path: '/org/contrats',
            icon: <FileText className="w-5 h-5" />,
            allowedRoles: ['gestionnaire', 'admin', 'superadmin']
        },
        {
            name: 'Paiements',
            path: '/org/paiements',
            icon: <CreditCard className="w-5 h-5" />,
            allowedRoles: ['gestionnaire', 'admin', 'superadmin']
        },
        // ✅ NOUVEAU MENU: Souscription
        {
            name: 'Souscription',
            path: '/org/souscription',
            icon: <FolderPlus className="w-5 h-5" />,
            allowedRoles: ['gestionnaire', 'admin', 'superadmin']
        },
        {
            name: 'Médias',
            path: '/org/medias',
            icon: <FolderOpen className="w-5 h-5" />,
            allowedRoles: ['gestionnaire', 'admin', 'superadmin']
        },
        {
            name: 'Utilisateurs',
            path: '/org/utilisateurs',
            icon: <UserCog className="w-5 h-5" />,
            allowedRoles: ['admin', 'superadmin']
        },
        {
            name: 'Paramètres',
            path: '/org/parametres',
            icon: <Settings className="w-5 h-5" />,
            allowedRoles: ['gestionnaire', 'admin', 'superadmin', 'user']
        },
    ]), []);

    // Filtrer le menu selon le rôle de l'utilisateur
    const menuItems = useMemo(() => {
        if (!profile) return [];
        return allMenuItems.filter(item =>
            item.allowedRoles.includes(profile.role ?? '')
        );
    }, [profile, allMenuItems]);

    const isActive = (path: string) => location.pathname === path;

    // Badge de rôle avec couleurs
    const getRoleBadge = () => {
        if (!profile) return null;

        const roleConfig = {
            superadmin: { label: 'Super Admin', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
            admin: { label: 'Admin', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
            gestionnaire: { label: 'Gestionnaire', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
            user: { label: 'Utilisateur', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' }
        };

        const key = (profile.role ?? 'user') as keyof typeof roleConfig;
        const config = roleConfig[key] || roleConfig.user;

        return (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    return (
        <div className="flex h-screen bg-[#f8fafc] dark:bg-[#0B0C10] transition-colors">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-[260px]' : 'w-[80px]'} bg-[#0a3161] dark:bg-[#0B0C10] border-r border-transparent dark:border-white/5 text-white transition-all duration-300 ease-in-out relative z-20 flex flex-col`}>
                {/* Logo Area */}
                <div className="h-20 flex items-center justify-between px-5 border-b border-white/5">
                    {sidebarOpen && (
                        <div className="flex items-center gap-3 animate-fade-in">
                            <div className="w-10 h-10 rounded-full border border-white/20 bg-white/10 flex items-center justify-center shrink-0">
                                <Leaf className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-[17px] font-bold tracking-wide leading-tight">Sirius</h1>
                                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300">Assurance</span>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 mt-6 px-4 overflow-y-auto space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${isActive(item.path)
                                ? 'bg-[#184882] dark:bg-white/10 text-white font-medium shadow-sm'
                                : 'hover:bg-white/5 text-slate-300 hover:text-white'
                                }`}
                        >
                            {item.icon}
                            {sidebarOpen && (
                                <span className={`text-sm ${isActive(item.path) ? 'font-bold' : 'font-medium'} animate-fade-in`}>{item.name}</span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5 mt-auto">
                    <button
                        onClick={handleSignOut}
                        className={`w-full flex items-center gap-3 px-3 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors ${!sidebarOpen && 'justify-center'}`}
                    >
                        <LogOut className="w-5 h-5" />
                        {sidebarOpen && <span className="animate-fade-in font-medium text-sm">Déconnexion</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc] dark:bg-[#0B0C10]">
                <header className="h-20 bg-[#f8fafc] dark:bg-[#0B0C10] flex items-center justify-between px-8 py-4 transition-colors z-10 sticky top-0 border-b border-slate-200/50 dark:border-white/5">
                    <div className="flex justify-between items-center w-full gap-8">
                        {/* 1. Titre de la page (Gauche) */}
                        <div className="flex flex-col min-w-[200px]">
                            <h2 className="text-[22px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight font-serif">
                                {allMenuItems.find(item => item.path === location.pathname)?.name || 'Page'}
                            </h2>
                            <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Vue d'ensemble de votre activité</p>
                        </div>

                        {/* 2. Centre (Recherche + Actions rapides) */}
                        <div className="flex items-center gap-4 flex-1 justify-center">
                            {/* Search Bar - GlobalSearch component wrapping it to maintain functionality */}
                            <div className="w-full max-w-md hidden lg:block">
                                <GlobalSearch />
                            </div>

                            {/* Boutons Nouveau (Seulement sur le Dashboard) */}
                            {location.pathname === '/org/dashboard' && (
                                <>
                                    <button 
                                        onClick={() => navigate('/org/clients', { state: { openModal: true } })}
                                        className="hidden xl:flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#13151A] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-full hover:bg-slate-50 dark:hover:bg-white/5 transition-colors whitespace-nowrap shadow-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Nouveau client
                                    </button>
                                    <button 
                                        onClick={() => navigate('/org/contrats')}
                                        className="hidden xl:flex items-center gap-2 px-4 py-2 bg-[#0066FF] text-white font-bold text-sm rounded-full hover:bg-blue-600 transition-colors whitespace-nowrap shadow-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Nouveau contrat
                                    </button>
                                </>
                            )}
                        </div>

                        {/* 3. Droite (Outils et Profil) */}
                        <div className="flex items-center gap-3 shrink-0">
                            {/* Bouton Mode Jour/Nuit */}
                            <button
                                onClick={toggleTheme}
                                className="p-2.5 bg-white dark:bg-[#13151A] rounded-full hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-white/10"
                                title={darkMode ? 'Mode Jour' : 'Mode Nuit'}
                            >
                                {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
                            </button>

                            {/* Notifications avec indicateur vert (dans NotificationBell si possible) */}
                            <div className="relative">
                                <NotificationBell />
                            </div>

                            {/* Avatar Profil Bleu */}
                            <div className="flex items-center gap-3 ml-3">
                                {profile?.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt="Avatar"
                                        className="w-10 h-10 rounded-full object-cover shadow-sm bg-white"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-[#0066FF] shadow-sm flex items-center justify-center text-white font-bold text-sm">
                                        {profile?.prenom?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'IA'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-transparent p-6 transition-colors">
                    <div className="animate-slide-up">
                        {children}
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
}
