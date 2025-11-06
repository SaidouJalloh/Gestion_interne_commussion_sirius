import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePortailAuth } from '../context/PortailAuthContext';
import {
    ShieldCheck,
    Mail,
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    FileText,
    Clock,
    CheckCircle
} from 'lucide-react';

const PortailLogin = () => {
    const navigate = useNavigate(); // ✅ IMPORTANT
    const { login } = usePortailAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // ✏️ Gérer les changements
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // ✅ Validation
    const validate = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'L\'email est requis';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email invalide';
        }

        if (!formData.password) {
            newErrors.password = 'Le mot de passe est requis';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 📤 Soumettre
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        try {
            const result = await login(formData.email, formData.password);

            if (result.success) {
                console.log('✅ Connexion réussie, redirection...');
                // ✅ REDIRECTION AJOUTÉE
                navigate('/portail/dashboard');
            }
        } catch (error) {
            console.error('Erreur login:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">

            {/* 👈 PARTIE GAUCHE - Informations */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex-col justify-between relative overflow-hidden">

                {/* Motif décoratif */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="relative z-10">
                    {/* Logo */}
                    <div className="flex items-center gap-3 text-white mb-12">
                        <ShieldCheck className="w-12 h-12" />
                        <div>
                            <h1 className="text-3xl font-bold">Sirius Assurance</h1>
                            <p className="text-blue-100 text-sm">Portail Client</p>
                        </div>
                    </div>

                    {/* Titre */}
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Gérez vos sinistres<br />en toute simplicité
                    </h2>
                    <p className="text-blue-100 text-lg mb-12">
                        Déclarez et suivez vos sinistres en temps réel depuis votre espace personnel.
                    </p>

                    {/* Features */}
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-white/10 p-3 rounded-lg">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold mb-1">Déclaration rapide</h3>
                                <p className="text-blue-100 text-sm">
                                    Déclarez votre sinistre en quelques clics avec tous les documents nécessaires
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-white/10 p-3 rounded-lg">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold mb-1">Suivi en temps réel</h3>
                                <p className="text-blue-100 text-sm">
                                    Suivez l'avancement du traitement de votre dossier à chaque étape
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-white/10 p-3 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold mb-1">Traitement efficace</h3>
                                <p className="text-blue-100 text-sm">
                                    Notre équipe traite votre dossier avec rapidité et transparence
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-blue-100 text-sm">
                    <p>© 2025 Sirius Assurance. Tous droits réservés.</p>
                </div>
            </div>

            {/* 👉 PARTIE DROITE - Formulaire */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">

                    {/* Logo mobile */}
                    <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
                        <ShieldCheck className="w-10 h-10 text-blue-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Sirius Assurance</h1>
                            <p className="text-sm text-gray-500">Portail Client</p>
                        </div>
                    </div>

                    {/* Carte de connexion */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">

                        {/* Titre */}
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                Connexion
                            </h2>
                            <p className="text-gray-600">
                                Accédez à votre espace personnel
                            </p>
                        </div>

                        {/* Formulaire */}
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Adresse email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="votre@email.com"
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.email ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        disabled={loading}
                                    />
                                </div>
                                {errors.email && (
                                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{errors.email}</span>
                                    </div>
                                )}
                            </div>

                            {/* Mot de passe */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mot de passe
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.password ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{errors.password}</span>
                                    </div>
                                )}
                            </div>

                            {/* Mot de passe oublié */}
                            <div className="flex justify-end">
                                <Link
                                    to="/portail/mot-de-passe-oublie"
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Mot de passe oublié ?
                                </Link>
                            </div>

                            {/* Bouton submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Connexion...</span>
                                    </>
                                ) : (
                                    <span>Se connecter</span>
                                )}
                            </button>
                        </form>

                        {/* Aide */}
                        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                            <p className="text-sm text-gray-600">
                                Besoin d'aide ?{' '}
                                <a href="mailto:support@sirius-assurance.com" className="text-blue-600 hover:text-blue-700 font-medium">
                                    Contactez-nous
                                </a>
                            </p>
                        </div>
                    </div>

                    {/* Info sécurité */}
                    <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Connexion sécurisée SSL</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortailLogin;