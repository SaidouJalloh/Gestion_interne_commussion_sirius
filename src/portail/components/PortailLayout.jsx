import { usePortailAuth } from '../context/PortailAuthContext';
import PortailHeader from './PortailHeader';
import { Loader2 } from 'lucide-react';

const PortailLayout = ({ children }) => {
    const { loading } = usePortailAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-sm sm:text-base text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <PortailHeader />

            {/* Main Content - Responsive padding */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {children}
            </main>

            {/* Footer - Responsive */}
            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
                        <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                            © 2025 Sirius Assurance. Tous droits réservés.
                        </p>
                        <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm">
                            <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">
                                Aide
                            </a>
                            <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">
                                Confidentialité
                            </a>
                            <a href="mailto:support@sirius-assurance.com" className="text-gray-500 hover:text-gray-700 transition-colors">
                                Contact
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PortailLayout;