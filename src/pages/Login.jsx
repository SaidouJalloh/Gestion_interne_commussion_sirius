// code qui marche

// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// export default function Login() {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState('');
//     const [loading, setLoading] = useState(false);

//     const navigate = useNavigate();
//     const { signIn, canAccessDashboard } = useAuth();

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         setLoading(true);

//         const { data, error } = await signIn(email, password);

//         if (error) {
//             setError(error.message || 'Une erreur est survenue lors de la connexion');
//             setLoading(false);
//             return;
//         }

//         // Rediriger selon le rôle
//         if (data && data.role === 'gestionnaire') {
//             navigate('/clients');
//         } else {
//             navigate('/dashboard');
//         }

//         setLoading(false);
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
//             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
//                 <div className="text-center mb-8">
//                     <h1 className="text-3xl font-bold text-gray-800 mb-2">
//                         Gestion Assurances
//                     </h1>
//                     <p className="text-gray-600">Connectez-vous à votre compte</p>
//                 </div>

//                 {error && (
//                     <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//                         {error}
//                     </div>
//                 )}

//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                             Email
//                         </label>
//                         <input
//                             type="email"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
//                             placeholder="votre@email.com"
//                             required
//                         />
//                     </div>

//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                             Mot de passe
//                         </label>
//                         <input
//                             type="password"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
//                             placeholder="••••••••"
//                             required
//                         />
//                     </div>

//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                         {loading ? 'Connexion...' : 'Se connecter'}
//                     </button>
//                 </form>

//                 <p className="text-center text-sm text-gray-600 mt-6">
//                     Mot de passe oublié ? Contactez l'administrateur
//                 </p>
//             </div>
//         </div>
//     );
// }
















// n1
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { signIn } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { data, error: signInError } = await signIn(email, password);

        if (signInError) {
            setError(signInError.message || 'Une erreur est survenue lors de la connexion');
            setLoading(false);
            return;
        }

        // Attendre un peu pour que le profil soit chargé
        setTimeout(() => {
            // Récupérer le profil depuis le contexte après connexion
            // Le AuthContext charge automatiquement le profil après signIn
            setLoading(false);

            // Redirection : Les gestionnaires vont sur /clients, les autres sur /dashboard
            // Note: Le profil sera disponible après le rechargement du AuthContext
            navigate('/clients'); // On laisse le Layout rediriger selon les permissions
        }, 500);
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

                <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-center text-sm text-gray-600 mb-3">
                        Comptes de test disponibles :
                    </p>
                    <div className="space-y-2 text-xs text-gray-500">
                        <div className="bg-purple-50 p-2 rounded">
                            <strong>Super Admin:</strong> superadmin@gmail.com
                        </div>
                        <div className="bg-blue-50 p-2 rounded">
                            <strong>Admin:</strong> admin@gmail.com
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                            <strong>Gestionnaire:</strong> gestionnaire@gmail.com
                        </div>
                    </div>
                </div>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Mot de passe oublié ? Contactez l'administrateur
                </p>
            </div>
        </div>
    );
}