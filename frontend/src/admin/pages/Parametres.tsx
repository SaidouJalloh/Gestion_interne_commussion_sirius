// Admin Parametres Page
import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useProfileContext } from '../../context/ProfileContext';
import { exportDashboardPDF, exportDashboardExcel, exportClientsExcel, exportContratsExcel } from '../utils/exportUtils';
import { API_ENDPOINTS } from '../../config/api';
import { apiRequest } from '../utils/apiClient';

export default function Parametres() {
    const { profile } = useProfileContext();
    const [activeTab, setActiveTab] = useState('profil');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [exportLoading, setExportLoading] = useState(false);

    // États pour l'avatar
    const [uploading, setUploading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    type DashboardStats = {
        totalClients: number;
        clientsParticuliers: number;
        clientsEntreprises: number;
        contratsActifs: number;
        commissionsTotal: number;
        commissionsEncaissees: number;
        commissionsEnAttente: number;
        primesEncaissees: number;
        contratsExpirants: number;
        tauxConversion: string | number;
    };

    type DashboardGraphiques = {
        evolutionClients: Array<{ mois: string; clients: number }>;
        commissionsParType: Array<{ name: string; commission: number; count: number }>;
        performanceCompagnies: Array<{ name: string; commission: number; count: number; encaissee: number; enAttente: number }>;
        topClientsParticuliers: unknown[];
        topClientsEntreprises: unknown[];
        evolutionCommissions: Array<{ mois: string; encaissees: number; dues: number; enAttente: number }>;
    };

    type ExportData = {
        dashboardStats: DashboardStats | null;
        dashboardGraphiques: DashboardGraphiques | null;
        clients: Array<{
            id: string | number;
            nom?: string | null;
            prenom?: string | null;
            type_client?: string | null;
            email?: string | null;
            telephone?: string | null;
            ville?: string | null;
            created_at?: string | null;
            [key: string]: unknown;
        }>;
        contrats: unknown[];
    };

    // Données du profil avec nom/prenom séparés
    const [profilData, setProfilData] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
    });

    // Données du mot de passe
    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: '',
    });

    // Statistiques de l'application
    const [stats, setStats] = useState({
        clients: 0,
        compagnies: 0,
        contrats: 0,
        paiements: 0,
        medias: 0,
    });

    // Données pour exports
    const [exportData, setExportData] = useState<ExportData>({
        dashboardStats: null,
        dashboardGraphiques: null,
        clients: [],
        contrats: []
    });

    const getErrorMessage = (err: unknown) =>
        err instanceof Error ? err.message : String((err as { message?: unknown } | null)?.message ?? err);

    const fetchStats = useCallback(async () => {
        try {
            const [clients, compagnies, contrats, paiements, medias] = await Promise.all([
                apiRequest(API_ENDPOINTS.clients.list),
                apiRequest(API_ENDPOINTS.compagnies.list),
                apiRequest(API_ENDPOINTS.contracts.list),
                apiRequest(API_ENDPOINTS.payments.list),
                apiRequest(API_ENDPOINTS.media.list),
            ]);

            setStats({
                clients: Array.isArray(clients) ? clients.length : 0,
                compagnies: Array.isArray(compagnies) ? compagnies.length : 0,
                contrats: Array.isArray(contrats) ? contrats.length : 0,
                paiements: Array.isArray(paiements) ? paiements.length : 0,
                medias: Array.isArray(medias) ? medias.length : 0,
            });
        } catch (error) {
            console.error('Erreur stats:', error);
        }
    }, []);

    const fetchExportData = useCallback(async () => {
        try {
            const [clientsAll, contratsAll, paiementsAll, compagniesAll] = await Promise.all([
                apiRequest(API_ENDPOINTS.clients.list),
                apiRequest(API_ENDPOINTS.contracts.list),
                apiRequest(API_ENDPOINTS.payments.list),
                apiRequest(API_ENDPOINTS.compagnies.list),
            ]);

            type Client = ExportData['clients'][number];
            type Compagnie = { id: string | number; nom?: string | null };
            type Contrat = {
                statut?: string | null;
                type_contrat: string;
                commission?: string | number | null;
                compagnie_id?: string | number | null;
                compagnies?: { nom?: string | null } | null;
            };
            type Paiement = { type_paiement?: string | null; date_paiement?: string | null; montant?: string | number | null };

            const clients: Client[] = Array.isArray(clientsAll) ? (clientsAll as Client[]) : [];
            const contratsArr: Contrat[] = Array.isArray(contratsAll) ? contratsAll : [];
            const contratsActifs = contratsArr.filter((c) => c?.statut === 'actif');
            const paiements: Paiement[] = Array.isArray(paiementsAll) ? paiementsAll : [];
            const compagnies: Compagnie[] = Array.isArray(compagniesAll) ? compagniesAll : [];

            const commissionsTotal = contratsActifs.reduce((sum, c) => sum + parseFloat(String(c.commission ?? 0)), 0);
            const commissionsEncaissees = paiements
                .filter(p => p.type_paiement === 'commission_compagnie' && p.date_paiement)
                .reduce((sum, p) => sum + parseFloat(String(p.montant ?? 0)), 0);

            const dashboardStats = {
                totalClients: clients.length,
                clientsParticuliers: clients.filter(c => c.type_client === 'particulier').length,
                clientsEntreprises: clients.filter(c => c.type_client === 'entreprise').length,
                contratsActifs: contratsActifs.length,
                commissionsTotal,
                commissionsEncaissees,
                commissionsEnAttente: commissionsTotal - commissionsEncaissees,
                primesEncaissees: paiements
                    .filter(p => p.type_paiement === 'client_prime' && p.date_paiement)
                    .reduce((sum, p) => sum + parseFloat(String(p.montant ?? 0)), 0),
                contratsExpirants: 0,
                tauxConversion: clients.length > 0 ? ((contratsActifs.length / clients.length) * 100).toFixed(1) : 0
            };

            const typesMap: Record<string, { commission: number; count: number }> = {};
            contratsActifs.forEach(c => {
                const type = c.type_contrat.replace(/_/g, ' ');
                if (!typesMap[type]) typesMap[type] = { commission: 0, count: 0 };
                typesMap[type].commission += parseFloat(String(c.commission ?? 0));
                typesMap[type].count += 1;
            });

            const compagniesMap: Record<string, { commission: number; count: number; encaissee: number; enAttente: number }> = {};
            contratsActifs.forEach(c => {
                const name =
                    c.compagnies?.nom ||
                    compagnies.find((comp) => comp.id === c.compagnie_id)?.nom;

                if (!name) return;

                if (!compagniesMap[name]) {
                    compagniesMap[name] = { commission: 0, count: 0, encaissee: 0, enAttente: 0 };
                }
                const commission = parseFloat(String(c.commission ?? 0));
                compagniesMap[name].commission += commission;
                compagniesMap[name].count += 1;
            });

            const dashboardGraphiques = {
                evolutionClients: [],
                commissionsParType: Object.entries(typesMap).map(([name, data]) => ({ name, ...data })),
                performanceCompagnies: Object.entries(compagniesMap).map(([name, data]) => ({ name, ...data })),
                topClientsParticuliers: [],
                topClientsEntreprises: [],
                evolutionCommissions: []
            };

            setExportData({
                dashboardStats,
                dashboardGraphiques,
                clients,
                contrats: contratsArr
            });

        } catch (error) {
            console.error('Erreur export data:', error);
        }
    }, []);

    useEffect(() => {
        if (profile) {
            setProfilData({
                nom: profile.nom || '',
                prenom: profile.prenom || '',
                email: profile.email || '',
                telephone: profile.telephone || '',
            });
            setAvatarUrl(profile.avatar_url || null);
        }
        fetchStats();
        fetchExportData();
    }, [profile, fetchStats, fetchExportData]);

    const handleExportDashboardPDF = async () => {
        setExportLoading(true);
        try {
            if (!exportData.dashboardStats || !exportData.dashboardGraphiques) {
                throw new Error('Données export indisponibles');
            }
            await exportDashboardPDF(exportData.dashboardStats, exportData.dashboardGraphiques);
            setMessage({ type: 'success', text: 'Rapport PDF téléchargé avec succès' });
        } catch (error) {
            setMessage({ type: 'error', text: getErrorMessage(error) || 'Erreur lors de l\'export PDF' });
        } finally {
            setExportLoading(false);
        }
    };

    const handleExportDashboardExcel = async () => {
        setExportLoading(true);
        try {
            if (!exportData.dashboardStats || !exportData.dashboardGraphiques) {
                throw new Error('Données export indisponibles');
            }
            await exportDashboardExcel(exportData.dashboardStats, exportData.dashboardGraphiques);
            setMessage({ type: 'success', text: 'Rapport Excel téléchargé avec succès' });
        } catch (error) {
            setMessage({ type: 'error', text: getErrorMessage(error) || 'Erreur lors de l\'export Excel' });
        } finally {
            setExportLoading(false);
        }
    };

    const handleExportClientsExcel = async () => {
        setExportLoading(true);
        try {
            await exportClientsExcel(exportData.clients);
            setMessage({ type: 'success', text: 'Liste des clients exportée avec succès' });
        } catch (error) {
            setMessage({ type: 'error', text: getErrorMessage(error) || 'Erreur lors de l\'export clients' });
        } finally {
            setExportLoading(false);
        }
    };

    const handleExportContratsExcel = async () => {
        setExportLoading(true);
        try {
            await exportContratsExcel(exportData.contrats);
            setMessage({ type: 'success', text: 'Liste des contrats exportée avec succès' });
        } catch (error) {
            setMessage({ type: 'error', text: getErrorMessage(error) || 'Erreur lors de l\'export contrats' });
        } finally {
            setExportLoading(false);
        }
    };

    const handleProfilChange = (e: ChangeEvent<HTMLInputElement>) => {
        setProfilData({ ...profilData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfil = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            if (!profile?.id) {
                throw new Error('Profil non chargé');
            }
            const { error } = await supabase
                .from('profiles')
                .update({
                    nom: profilData.nom,
                    prenom: profilData.prenom,
                    telephone: profilData.telephone,
                    updated_at: new Date().toISOString()
                })
                .eq('id', profile.id);

            if (error) throw error;

            setMessage({ type: 'success', text: '✅ Profil mis à jour avec succès !' });

            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            setMessage({ type: 'error', text: getErrorMessage(error) });
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            setMessage({ type: '', text: '' });

            if (!event.target.files || event.target.files.length === 0) {
                return;
            }

            const file = event.target.files[0];

            // Validation du fichier
            const fileExt = file.name.split('.').pop()?.toLowerCase();
            const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

            if (!fileExt) {
                setMessage({ type: 'error', text: 'Fichier invalide (extension manquante)' });
                setUploading(false);
                return;
            }

            if (!allowedTypes.includes(fileExt)) {
                setMessage({ type: 'error', text: 'Format non autorisé. Utilisez JPG, PNG, GIF ou WebP' });
                setUploading(false);
                return;
            }

            if (file.size > 2 * 1024 * 1024) { // 2MB max
                setMessage({ type: 'error', text: 'La photo ne doit pas dépasser 2 MB' });
                setUploading(false);
                return;
            }

            // Nom du fichier unique basé sur l'ID utilisateur
            if (!profile?.id) {
                throw new Error('Profil non chargé');
            }
            const fileName = `${profile.id}/avatar.${fileExt}`;

            // Supprimer l'ancien avatar s'il existe
            if (avatarUrl) {
                try {
                    const oldPath = avatarUrl.split('/').slice(-2).join('/');
                    await supabase.storage.from('avatars').remove([oldPath]);
                } catch (err) {
                    console.log('Ancien avatar non trouvé:', err);
                }
            }

            // Upload du nouveau fichier
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // Récupérer l'URL publique
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            // Mettre à jour le profil
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    avatar_url: publicUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', profile.id);

            if (updateError) throw updateError;

            setAvatarUrl(publicUrl);
            setMessage({ type: 'success', text: '✅ Photo de profil mise à jour avec succès !' });

            setTimeout(() => window.location.reload(), 1500);

        } catch (error) {
            console.error('Erreur upload:', error);
            setMessage({ type: 'error', text: getErrorMessage(error) || 'Erreur lors de l\'upload' });
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveAvatar = async () => {
        if (!window.confirm('Voulez-vous vraiment supprimer votre photo de profil ?')) {
            return;
        }

        try {
            setUploading(true);
            setMessage({ type: '', text: '' });
            if (!profile?.id) {
                throw new Error('Profil non chargé');
            }

            if (avatarUrl) {
                try {
                    const oldPath = avatarUrl.split('/').slice(-2).join('/');
                    await supabase.storage.from('avatars').remove([oldPath]);
                } catch (err) {
                    console.log('Fichier non trouvé:', err);
                }
            }

            const { error } = await supabase
                .from('profiles')
                .update({
                    avatar_url: null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', profile.id);

            if (error) throw error;

            setAvatarUrl(null);
            setMessage({ type: 'success', text: '✅ Photo de profil supprimée' });

            setTimeout(() => window.location.reload(), 1500);

        } catch (error) {
            setMessage({ type: 'error', text: getErrorMessage(error) });
        } finally {
            setUploading(false);
        }
    };

    const handleUpdatePassword = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        if (passwordData.new !== passwordData.confirm) {
            setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.new
            });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Mot de passe mis à jour avec succès' });
            setPasswordData({ current: '', new: '', confirm: '' });
        } catch (error) {
            setMessage({ type: 'error', text: getErrorMessage(error) });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Gérez vos préférences et informations personnelles</p>
            </div>

            {/* Onglets et reste du contenu - JSX très long omis pour brièveté */}
            {/* ... */}
        </div>
    );
}
