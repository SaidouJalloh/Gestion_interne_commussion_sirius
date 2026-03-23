import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrganization } from '../context/OrganizationContext';

const API_BASE_URL =
    process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.length > 0
        ? process.env.REACT_APP_API_URL
        : 'http://localhost:4000';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { signIn } = useAuth();
    const { refreshOrganizations } = useOrganization();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data, error } = await signIn(email, password);

            if (error) {
                throw error;
            }

            // Recuperer le token frais directement depuis le resultat du signIn
            const token = data?.session?.access_token;
            if (!token) {
                setError('Erreur d\'authentification. Reessayez.');
                setLoading(false);
                return;
            }

            // Appeler /api/auth/me directement avec le token frais
            // (le context refresh utilise un closure stale a ce stade)
            let profile = null;
            try {
                const resp = await fetch(`${API_BASE_URL}/api/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (resp.ok) {
                    const json = await resp.json();
                    if (json.success && json.data) {
                        profile = json.data;
                    }
                }
            } catch {
                // Profil non disponible via le backend, on redirige par defaut
            }

            // Rafraichir les organisations en arriere-plan
            refreshOrganizations().catch(() => {});

            // Rediriger selon le role
            setLoading(false);
            if (profile?.is_superadmin === true) {
                navigate('/superadmin/organizations');
            } else {
                navigate('/org/dashboard');
            }
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : String((error as { message?: unknown } | null)?.message ?? 'Une erreur est survenue lors de la connexion');
            setError(message || 'Une erreur est survenue lors de la connexion');
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Sirius Assurance
                    </h1>
                    <p className="text-gray-600">Connectez-vous à votre compte</p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            placeholder="votre@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Mot de passe oublié ? Contactez l'administrateur
                </p>
            </div>
        </div>
    );
}
