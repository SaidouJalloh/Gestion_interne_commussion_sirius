// code qui marche



// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// export default function Register() {
//     const [formData, setFormData] = useState({
//         email: '',
//         password: '',
//         confirmPassword: '',
//         fullName: '',
//         role: 'gestionnaire'
//     });
//     const [error, setError] = useState('');
//     const [success, setSuccess] = useState('');
//     const [loading, setLoading] = useState(false);

//     const navigate = useNavigate();
//     const { signUp, profile } = useAuth();

//     // Vérifier si l'utilisateur connecté est superadmin
//     if (profile?.role !== 'superadmin') {
//         return (
//             <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
//                 <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
//                     <h2 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h2>
//                     <p className="text-gray-600 mb-4">
//                         Seuls les Super Administrateurs peuvent créer de nouveaux utilisateurs.
//                     </p>
//                     <button
//                         onClick={() => navigate('/dashboard')}
//                         className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
//                     >
//                         Retour au Dashboard
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     const handleChange = (e) => {
//         setFormData({
//             ...formData,
//             [e.target.name]: e.target.value
//         });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         setSuccess('');

//         // Validation
//         if (formData.password !== formData.confirmPassword) {
//             setError('Les mots de passe ne correspondent pas');
//             return;
//         }

//         if (formData.password.length < 6) {
//             setError('Le mot de passe doit contenir au moins 6 caractères');
//             return;
//         }

//         setLoading(true);

//         const { data, error } = await signUp(
//             formData.email,
//             formData.password,
//             formData.fullName,
//             formData.role
//         );

//         if (error) {
//             setError(error.message || 'Une erreur est survenue lors de la création du compte');
//             setLoading(false);
//             return;
//         }

//         setSuccess('Utilisateur créé avec succès !');

//         // Réinitialiser le formulaire
//         setFormData({
//             email: '',
//             password: '',
//             confirmPassword: '',
//             fullName: '',
//             role: 'gestionnaire'
//         });

//         setLoading(false);
//     };

//     return (
//         <div className="min-h-screen bg-gray-100 py-8 px-4">
//             <div className="max-w-2xl mx-auto">
//                 <div className="bg-white rounded-2xl shadow-lg p-8">
//                     <h1 className="text-3xl font-bold text-gray-800 mb-2">
//                         Créer un nouvel utilisateur
//                     </h1>
//                     <p className="text-gray-600 mb-6">
//                         Remplissez les informations pour créer un nouveau compte
//                     </p>

//                     {error && (
//                         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//                             {error}
//                         </div>
//                     )}

//                     {success && (
//                         <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
//                             {success}
//                         </div>
//                     )}

//                     <form onSubmit={handleSubmit} className="space-y-6">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Nom complet
//                             </label>
//                             <input
//                                 type="text"
//                                 name="fullName"
//                                 value={formData.fullName}
//                                 onChange={handleChange}
//                                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                                 required
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Email
//                             </label>
//                             <input
//                                 type="email"
//                                 name="email"
//                                 value={formData.email}
//                                 onChange={handleChange}
//                                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                                 required
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Rôle
//                             </label>
//                             <select
//                                 name="role"
//                                 value={formData.role}
//                                 onChange={handleChange}
//                                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                             >
//                                 <option value="gestionnaire">Gestionnaire (pas d'accès dashboard)</option>
//                                 <option value="admin">Admin (tous les privilèges)</option>
//                                 <option value="superadmin">Super Admin (tous les privilèges)</option>
//                             </select>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Mot de passe
//                             </label>
//                             <input
//                                 type="password"
//                                 name="password"
//                                 value={formData.password}
//                                 onChange={handleChange}
//                                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                                 required
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Confirmer le mot de passe
//                             </label>
//                             <input
//                                 type="password"
//                                 name="confirmPassword"
//                                 value={formData.confirmPassword}
//                                 onChange={handleChange}
//                                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                                 required
//                             />
//                         </div>

//                         <div className="flex gap-4">
//                             <button
//                                 type="submit"
//                                 disabled={loading}
//                                 className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
//                             >
//                                 {loading ? 'Création...' : 'Créer l\'utilisateur'}
//                             </button>

//                             <button
//                                 type="button"
//                                 onClick={() => navigate('/dashboard')}
//                                 className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
//                             >
//                                 Annuler
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// }










// n1
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

export default function Register() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        nom: '',
        prenom: '',
        telephone: '',
        role: 'gestionnaire'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { profile } = useAuth();

    // Vérifier si l'utilisateur connecté est superadmin
    useEffect(() => {
        if (profile && profile.role !== 'superadmin') {
            navigate('/clients');
        }
    }, [profile, navigate]);

    // Afficher un loader pendant la vérification du profil
    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Bloquer l'accès si pas superadmin
    if (profile.role !== 'superadmin') {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md text-center">
                    <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Accès refusé</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Seuls les Super Administrateurs peuvent créer de nouveaux utilisateurs.
                    </p>
                    <button
                        onClick={() => navigate('/clients')}
                        className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                    >
                        Retour
                    </button>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (formData.password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setLoading(true);

        try {
            // 1. Créer l'utilisateur dans Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (authError) throw authError;

            // 2. Mettre à jour le profil avec les infos complètes
            if (authData.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        nom: formData.nom,
                        prenom: formData.prenom,
                        role: formData.role,
                        telephone: formData.telephone,
                        actif: true
                    })
                    .eq('id', authData.user.id);

                if (profileError) throw profileError;
            }

            setSuccess('✅ Utilisateur créé avec succès !');

            // Réinitialiser le formulaire
            setFormData({
                email: '',
                password: '',
                confirmPassword: '',
                nom: '',
                prenom: '',
                telephone: '',
                role: 'gestionnaire'
            });

        } catch (err) {
            console.error('Erreur création utilisateur:', err);
            setError(err.message || 'Une erreur est survenue lors de la création du compte');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                        Créer un nouvel utilisateur
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Remplissez les informations pour créer un nouveau compte
                    </p>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Prénom
                                </label>
                                <input
                                    type="text"
                                    name="prenom"
                                    value={formData.prenom}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nom
                                </label>
                                <input
                                    type="text"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Téléphone
                            </label>
                            <input
                                type="tel"
                                name="telephone"
                                value={formData.telephone}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                                placeholder="+221 XX XXX XX XX"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Rôle *
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                                required
                            >
                                <option value="user">Utilisateur (lecture seule)</option>
                                <option value="gestionnaire">Gestionnaire (pas d'accès Dashboard & Compagnies)</option>
                                <option value="admin">Admin (accès complet sauf gestion users)</option>
                                <option value="superadmin">Super Admin (tous les privilèges)</option>
                            </select>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formData.role === 'gestionnaire' && '→ Accès : Clients, Contrats, Médias'}
                                {formData.role === 'admin' && '→ Accès : Tout sauf gestion utilisateurs'}
                                {formData.role === 'superadmin' && '→ Accès : Toutes les fonctionnalités'}
                                {formData.role === 'user' && '→ Accès : Lecture seule'}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Mot de passe *
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                                placeholder="Min. 6 caractères"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Confirmer le mot de passe *
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {loading ? 'Création...' : 'Créer l\'utilisateur'}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/utilisateurs')}
                                className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
                            >
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}