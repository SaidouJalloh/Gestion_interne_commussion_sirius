import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { usePortailAuth } from '../context/PortailAuthContext';
import {
    ShieldCheck,
    Home,
    FileText,
    List,
    User,
    LogOut,
    Menu,
    X,
    Bell,
    ChevronDown
} from 'lucide-react';

const PortailHeader = () => {
    const { clientData, logout } = usePortailAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    const navigation = [
        { name: 'Accueil', path: '/portail/dashboard', icon: Home },
        { name: 'Nouveau sinistre', path: '/portail/nouveau-sinistre', icon: FileText },
        { name: 'Mes sinistres', path: '/portail/mes-sinistres', icon: List },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/portail/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <nav className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                <div className="flex justify-between items-center h-14 sm:h-16">

                    {/* Logo - Responsive */}
                    <Link to="/portail/dashboard" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                        <div>
                            <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                                Sirius Assurance
                            </h1>
                            <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">
                                Portail Client
                            </p>
                        </div>
                    </Link>

                    {/* Navigation Desktop - Hidden on mobile/tablet */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-2 px-3 xl:px-4 py-2 rounded-lg transition-all duration-200 ${isActive(item.path)
                                            ? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-sm">{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Actions Desktop */}
                    <div className="flex items-center gap-2 sm:gap-4">

                        {/* Notifications - Visible sur desktop */}
                        <button className="hidden md:flex relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* Profil Menu Desktop */}
                        <div className="hidden md:block relative">
                            <button
                                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                className="flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                                    {clientData?.client?.prenom?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="text-left hidden lg:block">
                                    <p className="text-sm font-medium text-gray-900 leading-tight">
                                        {clientData?.client?.prenom} {clientData?.client?.nom}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate max-w-[150px]">
                                        {clientData?.email}
                                    </p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-400 hidden lg:block" />
                            </button>

                            {/* Dropdown Menu Desktop */}
                            {profileMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setProfileMenuOpen(false)}
                                    ></div>
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20 animate-fadeIn">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900">
                                                {clientData?.client?.prenom} {clientData?.client?.nom}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 truncate">
                                                {clientData?.email}
                                            </p>
                                            <p className="text-xs text-blue-600 mt-2 font-medium">
                                                Client {clientData?.client?.type_client}
                                            </p>
                                        </div>

                                        <Link
                                            to="/portail/profil"
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            onClick={() => setProfileMenuOpen(false)}
                                        >
                                            <User className="w-4 h-4" />
                                            Mon profil
                                        </Link>

                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors border-t border-gray-100 mt-1 pt-3"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Se déconnecter
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Menu Mobile/Tablet Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg active:bg-gray-100 transition-colors"
                            aria-label="Menu"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile/Tablet Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 pb-4 animate-slideDown">

                        {/* Navigation Links */}
                        <div className="space-y-1 py-4">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 active:scale-98 ${isActive(item.path)
                                                ? 'bg-blue-50 text-blue-700 font-medium'
                                                : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5 flex-shrink-0" />
                                        <span className="text-base">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Profil Mobile */}
                        <div className="border-t border-gray-200 pt-4">
                            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg mb-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                                    {clientData?.client?.prenom?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {clientData?.client?.prenom} {clientData?.client?.nom}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {clientData?.email}
                                    </p>
                                </div>
                            </div>

                            <Link
                                to="/portail/profil"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors active:bg-gray-100"
                            >
                                <User className="w-5 h-5" />
                                <span className="text-base">Mon profil</span>
                            </Link>

                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    handleLogout();
                                }}
                                className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full text-left rounded-lg mt-1 transition-colors active:bg-red-100"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="text-base">Se déconnecter</span>
                            </button>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default PortailHeader;