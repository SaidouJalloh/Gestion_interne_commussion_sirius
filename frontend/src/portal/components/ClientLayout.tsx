import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Shield, Menu, TrendingUp, FileText, Calculator, AlertTriangle,
  FileCheck, Clock, Bell, LogOut, CheckCircle2, AlertCircle,
  Sun, Moon, X,
} from 'lucide-react';
import { useClientPortal } from '../../context/ClientPortalContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/client/dashboard', name: 'Tableau de bord', icon: TrendingUp },
  { path: '/client/souscription', name: 'Souscription', icon: FileText },
  { path: '/client/devis', name: 'Demande de Devis', icon: Calculator },
  { path: '/client/sinistre/declarer', name: 'Déclarer Sinistre', icon: AlertTriangle },
  { path: '/client/contrats', name: 'Mes Contrats', icon: FileCheck },
  { path: '/client/sinistres', name: 'Mes Sinistres', icon: Clock },
];

const pageTitles: Record<string, string> = {
  '/client/dashboard': 'Tableau de Bord',
  '/client/souscription': 'Nouvelle Souscription',
  '/client/devis': 'Demande de Devis',
  '/client/sinistre/declarer': 'Déclaration de Sinistre',
  '/client/contrats': 'Mes Contrats',
  '/client/sinistres': 'Suivi des Sinistres',
};

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const { clientProfile } = useClientPortal();
  const { signOut } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const initials = clientProfile
    ? `${clientProfile.prenom?.[0] || ''}${clientProfile.nom?.[0] || ''}`.toUpperCase()
    : '??';

  const fullName = clientProfile
    ? `${clientProfile.prenom} ${clientProfile.nom}`
    : 'Client';

  const currentTitle = pageTitles[location.pathname] || 'Portail Client';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 shadow-soft z-40 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-700">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-800 dark:text-white leading-tight">SIRIUS</h1>
                <p className="text-[10px] text-primary-600 dark:text-primary-400 font-medium -mt-0.5">ASSURANCE</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                title={!sidebarOpen ? item.name : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium text-sm">{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        {sidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary-400 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{fullName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{clientProfile?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-30">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">{currentTitle}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Bienvenue sur votre espace client SIRIUS
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              title={darkMode ? 'Mode clair' : 'Mode sombre'}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors relative"
              >
                <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-strong border border-gray-100 dark:border-gray-700 p-4 animate-scale-in z-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800 dark:text-white">Notifications</h4>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl cursor-pointer">
                      <div className="w-8 h-8 bg-success-100 dark:bg-success-900/30 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-success-600 dark:text-success-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-800 dark:text-gray-200">Bienvenue sur votre espace client</p>
                        <p className="text-xs text-gray-400">Aujourd'hui</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl cursor-pointer">
                      <div className="w-8 h-8 bg-warning-100 dark:bg-warning-900/30 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-warning-600 dark:text-warning-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-800 dark:text-gray-200">Pensez à consulter vos contrats</p>
                        <p className="text-xs text-gray-400">Aujourd'hui</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;
