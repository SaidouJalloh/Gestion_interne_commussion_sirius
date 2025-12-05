export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-6 transition-colors">
            <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                <p>© {currentYear} Sirius Assurance. Tous droits réservés.</p>
                <div className="flex gap-4">
                    <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        Conditions d'utilisation
                    </a>
                    <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        Confidentialité
                    </a>
                    <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        Support
                    </a>
                </div>
            </div>
        </footer>
    );
}