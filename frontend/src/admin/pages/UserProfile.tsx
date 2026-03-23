import { useState, useEffect } from 'react';
import { User, Shield, Bell, LogOut, Loader2, Save, Upload, Trash2, Camera } from 'lucide-react';
import { useProfileContext } from '../../context/ProfileContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';

export default function UserProfile() {
    const { profile, fetchProfile } = useProfileContext();
    const { user, signOut } = useAuth();
    const { darkMode, toggleTheme } = useTheme();

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form inputs
    const [nom, setNom] = useState(profile?.nom || '');
    const [prenom, setPrenom] = useState(profile?.prenom || '');
    const [telephone, setTelephone] = useState(profile?.telephone || '');
    const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');

    // Preferences
    const rawPreferences = typeof profile?.preferences === 'object' && profile?.preferences !== null ? profile.preferences : {};
    const [emailNotifications, setEmailNotifications] = useState<boolean>(
        (rawPreferences as any).emailNotifications ?? true
    );
    const [pushNotifications, setPushNotifications] = useState<boolean>(
        (rawPreferences as any).pushNotifications ?? false
    );

    // Password change
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (profile) {
            setNom(profile.nom || '');
            setPrenom(profile.prenom || '');
            setTelephone(profile.telephone || '');
            setAvatarUrl(profile.avatar_url || '');
            const raw = typeof profile.preferences === 'object' && profile.preferences !== null ? profile.preferences : {};
            setEmailNotifications((raw as any).emailNotifications ?? true);
            setPushNotifications((raw as any).pushNotifications ?? false);
        }
    }, [profile]);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const tokenResponse = await supabase.auth.getSession();
            const token = tokenResponse.data.session?.access_token;
            if (!token) throw new Error("Non authentifié");

            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nom,
                    prenom,
                    telephone,
                    avatar_url: avatarUrl,
                    preferences: {
                        emailNotifications,
                        pushNotifications,
                        darkMode
                    }
                })
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            toast.success("Profil mis à jour avec succès");
            fetchProfile(); // refresh context
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Erreur lors de la mise à jour du profil");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Le mot de passe doit contenir au moins 6 caractères");
            return;
        }

        setIsSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            toast.success("Mot de passe mis à jour avec succès");
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Erreur lors du changement de mot de passe");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Implémentation du téléchargement Supabase
        const uploadToastId = toast.loading("Téléchargement de l'avatar...");
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${user?.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            setAvatarUrl(data.publicUrl);
            toast.success("Avatar téléchargé avec succès", { id: uploadToastId });
        } catch (error: any) {
             toast.error(error.message || "Erreur lors du téléchargement", { id: uploadToastId });
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 border-b border-slate-200 dark:border-white/10 pb-4">
                Mon Profil
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Photo & Navigation */}
                <div className="space-y-6">
                    {/* Avatar Card */}
                    <div className="bg-white dark:bg-[#13151A] rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-6 flex flex-col items-center">
                        <div className="relative group mb-4">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt="Avatar"
                                    className="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-white/5 shadow-md"
                                />
                            ) : (
                                <div className="w-28 h-28 rounded-full bg-[#0066FF] flex items-center justify-center text-white text-3xl font-bold shadow-md">
                                    {prenom?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'IA'}
                                </div>
                            )}

                            <label className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-full shadow-lg border border-slate-100 dark:border-white/10 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                <Camera className="w-4 h-4" />
                                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                            </label>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{prenom} {nom}</h2>
                        <p className="text-sm text-slate-500 dark:text-gray-400 capitalize">{profile?.role}</p>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="bg-white dark:bg-[#13151A] rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
                        <a href="#infos" className="flex items-center gap-3 px-5 py-4 text-sm font-medium text-[#0066FF] bg-blue-50/50 dark:bg-blue-900/10 border-l-2 border-[#0066FF]">
                            <User className="w-4 h-4" /> Informations
                        </a>
                        <a href="#security" className="flex items-center gap-3 px-5 py-4 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            <Shield className="w-4 h-4" /> Sécurité
                        </a>
                        <a href="#preferences" className="flex items-center gap-3 px-5 py-4 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            <Bell className="w-4 h-4" /> Préférences
                        </a>
                        <button onClick={signOut} className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                            <LogOut className="w-4 h-4" /> Déconnexion
                        </button>
                    </nav>
                </div>

                {/* Right Column: Content */}
                <div className="md:col-span-2 space-y-8 pb-12">
                    
                    {/* SECTION 1: Informations Personnelles */}
                    <section id="infos" className="bg-white dark:bg-[#13151A] rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                            <User className="w-5 h-5 text-slate-400" />
                            Informations personnelles
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Prénom</label>
                                <input
                                    type="text"
                                    value={prenom}
                                    onChange={(e) => setPrenom(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#0066FF]/50 focus:border-[#0066FF] outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nom de famille</label>
                                <input
                                    type="text"
                                    value={nom}
                                    onChange={(e) => setNom(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#0066FF]/50 focus:border-[#0066FF] outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email (Lecture seule)</label>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 rounded-xl px-4 py-2.5 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Téléphone</label>
                                <input
                                    type="tel"
                                    value={telephone}
                                    onChange={(e) => setTelephone(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#0066FF]/50 focus:border-[#0066FF] outline-none transition-all"
                                    placeholder="+221 ..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="flex items-center gap-2 bg-[#0066FF] hover:bg-blue-600 text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-colors shadow-sm disabled:opacity-70"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Mettre à jour les infos
                            </button>
                        </div>
                    </section>

                    {/* SECTION 2: Sécurité */}
                    <section id="security" className="bg-white dark:bg-[#13151A] rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                            <Shield className="w-5 h-5 text-slate-400" />
                            Sécurité
                        </h3>

                        <div className="space-y-5 mb-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="hidden sm:block">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ancien mot de passe</label>
                                    <input
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#0066FF]/50 focus:border-[#0066FF] outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nouveau mot de passe</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#0066FF]/50 focus:border-[#0066FF] outline-none transition-all"
                                            placeholder="Nouveau mot de passe"
                                            minLength={6}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Confirmer le mot de passe</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#0066FF]/50 focus:border-[#0066FF] outline-none transition-all"
                                            placeholder="Confirmer"
                                            minLength={6}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handlePasswordChange}
                                disabled={isSaving || !newPassword || !confirmPassword}
                                className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-gray-100 px-5 py-2.5 rounded-full font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                                Changer le mot de passe
                            </button>
                        </div>
                    </section>

                    {/* SECTION 3: Préférences */}
                    <section id="preferences" className="bg-white dark:bg-[#13151A] rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                            <Bell className="w-5 h-5 text-slate-400" />
                            Préférences
                        </h3>

                        <div className="space-y-4 mb-6">
                            {/* Theme Toggle in Profile */}
                            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#0B0C10]/50">
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Mode Sombre</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Activer le thème sombre pour l'interface Sirius.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={darkMode} onChange={toggleTheme} />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#0066FF]"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#0B0C10]/50">
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications par Email</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Recevoir des résumés d'activités.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#0066FF]"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#0B0C10]/50">
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications Push (Navigateur)</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Alertes en temps réel.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={pushNotifications} onChange={() => setPushNotifications(!pushNotifications)} />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#0066FF]"></div>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="flex items-center gap-2 bg-[#0066FF] hover:bg-blue-600 text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-colors shadow-sm disabled:opacity-70"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Enregistrer les préférences
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
