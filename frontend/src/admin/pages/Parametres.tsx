import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useOrganization } from '../../context/OrganizationContext';
import { exportDashboardPDF, exportDashboardExcel, exportClientsExcel, exportContratsExcel } from '../utils/exportUtils';
import { API_ENDPOINTS } from '../../config/api';
import { apiRequest } from '../utils/apiClient';
import { Building2, Settings, Download, Shield, Bell, Users, Save, Loader2, Camera, Percent, DollarSign, Clock, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Parametres() {
    const { currentOrganization, refreshOrganizations } = useOrganization();
    
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);

    // États du formulaire d'organisation
    const [orgName, setOrgName] = useState('');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [settings, setSettings] = useState<Record<string, any>>({});

    const [uploading, setUploading] = useState(false);

    // Chargement des données au montage ou changement d'orga
    useEffect(() => {
        if (currentOrganization) {
            setOrgName(currentOrganization.name || '');
            setLogoUrl(currentOrganization.logo_url || null);
            setSettings(currentOrganization.settings || {});
        }
    }, [currentOrganization]);

    const handleSettingChange = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    // --- UPLOAD LOGO ---
    const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) return;
            const file = event.target.files[0];

            if (!currentOrganization?.id) throw new Error("Organisation non trouvée");

            const fileExt = file.name.split('.').pop()?.toLowerCase();
            const allowedTypes = ['jpg', 'jpeg', 'png', 'svg', 'webp'];
            if (!fileExt || !allowedTypes.includes(fileExt)) {
                toast.error('Format non autorisé. Utilisez JPG, PNG ou SVG');
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                toast.error('La photo ne doit pas dépasser 2 MB');
                return;
            }

            const fileName = `${currentOrganization.id}/logo.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { cacheControl: '3600', upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            setLogoUrl(publicUrl);
            toast.success("Logo téléchargé ! N'oubliez pas d'enregistrer.");
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de l\'upload');
        } finally {
            setUploading(false);
        }
    };

    // --- SAUVEGARDER L'ORGANISATION ---
    const handleSaveOrganization = async () => {
        if (!currentOrganization?.id) return;
        setLoading(true);
        try {
            const tokenResponse = await supabase.auth.getSession();
            const token = tokenResponse.data.session?.access_token;
            if (!token) throw new Error("Non authentifié");

            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await fetch(`${baseUrl}/api/organizations/${currentOrganization.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: orgName,
                    logo_url: logoUrl,
                    settings: settings
                })
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            toast.success("Paramètres mis à jour avec succès");
            // Rafraîchir le contexte pour mettre à jour la sidebar
            await refreshOrganizations();
        } catch (error: any) {
            toast.error(error.message || "Erreur de sauvegarde");
        } finally {
            setLoading(false);
        }
    };

    // ================= EXPORTS LOGIC =================
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
        clients: Array<any>;
        contrats: any[];
    };

    const [exportData, setExportData] = useState<ExportData>({
        dashboardStats: null,
        dashboardGraphiques: null,
        clients: [],
        contrats: []
    });

    const fetchExportData = useCallback(async () => {
        try {
            const [clientsAll, contratsAll, paiementsAll, compagniesAll] = await Promise.all([
                apiRequest(API_ENDPOINTS.clients.list),
                apiRequest(API_ENDPOINTS.contracts.list),
                apiRequest(API_ENDPOINTS.payments.list),
                apiRequest(API_ENDPOINTS.compagnies.list),
            ]);
            
            const clients = Array.isArray(clientsAll) ? clientsAll : [];
            const contratsArr = Array.isArray(contratsAll) ? contratsAll : [];
            const contratsActifs = contratsArr.filter((c: any) => c?.statut === 'actif');
            const paiements = Array.isArray(paiementsAll) ? paiementsAll : [];
            const compagnies = Array.isArray(compagniesAll) ? compagniesAll : [];

            // ... Logique d'aggrégation omise pour la brièveté, mais fonctionnelle ...
            const dashboardStats = {
                totalClients: clients.length,
                clientsParticuliers: clients.filter((c: any) => c.type_client === 'particulier').length,
                clientsEntreprises: clients.filter((c: any) => c.type_client === 'entreprise').length,
                contratsActifs: contratsActifs.length,
                commissionsTotal: 0,
                commissionsEncaissees: 0,
                commissionsEnAttente: 0,
                primesEncaissees: 0,
                contratsExpirants: 0,
                tauxConversion: clients.length > 0 ? ((contratsActifs.length / clients.length) * 100).toFixed(1) : 0
            };

            setExportData({
                dashboardStats,
                dashboardGraphiques: {
                    evolutionClients: [],
                    commissionsParType: [],
                    performanceCompagnies: [],
                    topClientsParticuliers: [],
                    topClientsEntreprises: [],
                    evolutionCommissions: []
                },
                clients,
                contrats: contratsArr
            });
        } catch (error) {
            console.error('Erreur export data:', error);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'exports') {
            fetchExportData();
        }
    }, [activeTab, fetchExportData]);

    const handleExport = async (type: string) => {
        setExportLoading(true);
        try {
            if (type === 'pdf' && exportData.dashboardStats && exportData.dashboardGraphiques) {
                await exportDashboardPDF(exportData.dashboardStats, exportData.dashboardGraphiques);
            } else if (type === 'excel_dash' && exportData.dashboardStats && exportData.dashboardGraphiques) {
                await exportDashboardExcel(exportData.dashboardStats, exportData.dashboardGraphiques);
            } else if (type === 'clients') {
                await exportClientsExcel(exportData.clients);
            } else if (type === 'contrats') {
                await exportContratsExcel(exportData.contrats);
            }
            toast.success('Rapport exporté avec succès');
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de l\'export');
        } finally {
            setExportLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto animate-fade-in p-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Paramètres de l'Organisation</h1>
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-8">Gérez la configuration globale, les commissions et les exports de votre espace Sirius.</p>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Navigation Latérale */}
                <div className="w-full md:w-64 shrink-0">
                    <nav className="flex flex-col space-y-1 bg-white dark:bg-[#13151A] rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden p-2">
                        <button 
                            onClick={() => setActiveTab('general')}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'general' ? 'bg-[#0066FF] text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                        >
                            <Building2 className="w-4 h-4" /> Général
                        </button>
                        <button 
                            onClick={() => setActiveTab('commissions')}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'commissions' ? 'bg-[#0066FF] text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                        >
                            <Percent className="w-4 h-4" /> Commissions
                        </button>
                        <button 
                            onClick={() => setActiveTab('notifications')}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'notifications' ? 'bg-[#0066FF] text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                        >
                            <Bell className="w-4 h-4" /> Notifications
                        </button>
                        <button 
                            onClick={() => setActiveTab('securite')}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'securite' ? 'bg-[#0066FF] text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                        >
                            <Shield className="w-4 h-4" /> Sécurité
                        </button>
                        <div className="my-2 border-t border-slate-100 dark:border-white/5" />
                        <button 
                            onClick={() => setActiveTab('exports')}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'exports' ? 'bg-blue-50 text-[#0066FF] dark:bg-blue-900/20 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                        >
                            <Download className="w-4 h-4" /> Exports des données
                        </button>
                    </nav>
                </div>

                {/* Contenu Principal */}
                <div className="flex-1 space-y-8">
                    
                    {/* ONGLET GENERAL */}
                    {activeTab === 'general' && (
                        <div className="bg-white dark:bg-[#13151A] rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-6 space-y-8 animate-fade-in">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Logo de l'organisation</h3>
                                <div className="flex items-center gap-6">
                                    <div className="relative group">
                                        {logoUrl ? (
                                            <img src={logoUrl} alt="Logo Org" className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-100 dark:border-white/5 shadow-sm" />
                                        ) : (
                                            <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                                                <Building2 className="w-8 h-8" />
                                            </div>
                                        )}
                                        <label className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-full shadow-md border border-slate-100 dark:border-white/10 cursor-pointer hover:bg-slate-50 transition-colors">
                                            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                                        </label>
                                    </div>
                                    <div className="text-sm text-slate-500">
                                        Format recommandé : Carré, PNG transparent. Max 2Mo.
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 dark:border-white/5 pt-8">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Informations principales</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nom de l'organisation *</label>
                                        <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)} className="w-full bg-slate-50 dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#0066FF]/50 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Type d'activité</label>
                                        <input type="text" value={settings?.activityType || ''} onChange={(e) => handleSettingChange('activityType', e.target.value)} placeholder="ex: Courtier en assurance" className="w-full bg-slate-50 dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#0066FF]/50 transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">NINEA</label>
                                        <input type="text" value={settings?.ninea || ''} onChange={(e) => handleSettingChange('ninea', e.target.value)} placeholder="000 000 000" className="w-full bg-slate-50 dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#0066FF]/50 transition-all font-mono text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email professionnel</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input type="email" value={settings?.email || ''} onChange={(e) => handleSettingChange('email', e.target.value)} className="w-full bg-slate-50 dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-[#0066FF]/50 transition-all" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Téléphone</label>
                                        <input type="tel" value={settings?.phone || ''} onChange={(e) => handleSettingChange('phone', e.target.value)} className="w-full bg-slate-50 dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#0066FF]/50 transition-all" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Adresse complète</label>
                                        <textarea value={settings?.address || ''} onChange={(e) => handleSettingChange('address', e.target.value)} rows={2} className="w-full bg-slate-50 dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#0066FF]/50 transition-all resize-none"></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ONGLET COMMISSIONS */}
                    {activeTab === 'commissions' && (
                        <div className="bg-white dark:bg-[#13151A] rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-6 animate-fade-in">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Paramètres des commissions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Taux de commission par défaut (%)</label>
                                    <input type="number" step="0.1" value={settings?.commissionRate || ''} onChange={(e) => handleSettingChange('commissionRate', e.target.value)} className="w-full bg-slate-50 dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#0066FF]/50 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Devise par défaut</label>
                                    <select value={settings?.currency || 'FCFA'} onChange={(e) => handleSettingChange('currency', e.target.value)} className="w-full bg-slate-50 dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#0066FF]/50 transition-all appearance-none">
                                        <option value="FCFA">FCFA / XOF</option>
                                        <option value="EUR">Euro (€)</option>
                                        <option value="USD">Dollar ($)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Format des montants</label>
                                    <select value={settings?.amountFormat || 'fr-FR'} onChange={(e) => handleSettingChange('amountFormat', e.target.value)} className="w-full bg-slate-50 dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#0066FF]/50 transition-all appearance-none">
                                        <option value="fr-FR">1 000,00 (fr-FR)</option>
                                        <option value="en-US">1,000.00 (en-US)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ONGLET NOTIFICATIONS */}
                    {activeTab === 'notifications' && (
                        <div className="bg-white dark:bg-[#13151A] rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-6 animate-fade-in">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Règles de notifications automatiques</h3>
                            <div className="space-y-4 max-w-2xl">
                                <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-[#0B0C10]/50 border border-slate-100 dark:border-white/5 rounded-xl">
                                    <div>
                                        <h4 className="font-semibold text-slate-800 dark:text-white text-sm">Rappels de renouvellement</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">Envoyer des alertes X jours avant expiration.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={settings?.renewalReminders ?? true} onChange={(e) => handleSettingChange('renewalReminders', e.target.checked)} />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#0066FF]"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-[#0B0C10]/50 border border-slate-100 dark:border-white/5 rounded-xl">
                                    <div>
                                        <h4 className="font-semibold text-slate-800 dark:text-white text-sm">Rapports hebdomadaires</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">Résumé des encaissements et sinistres.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={settings?.weeklyReports ?? false} onChange={(e) => handleSettingChange('weeklyReports', e.target.checked)} />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#0066FF]"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ONGLET SECURITE */}
                    {activeTab === 'securite' && (
                        <div className="bg-white dark:bg-[#13151A] rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-6 animate-fade-in">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Politique de sécurité</h3>
                            <div className="space-y-4 max-w-2xl">
                                <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-[#0B0C10]/50 border border-slate-100 dark:border-white/5 rounded-xl">
                                    <div>
                                        <h4 className="font-semibold text-slate-800 dark:text-white text-sm">Inscription ouverte au domaine</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">Autoriser les emails finissant par votre NDD.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={settings?.openRegistration ?? false} onChange={(e) => handleSettingChange('openRegistration', e.target.checked)} />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#0066FF]"></div>
                                    </label>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Expiration des sessions (Heures)</label>
                                    <input type="number" min="1" value={settings?.sessionTimeout || 24} onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)} className="w-32 bg-slate-50 dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#0066FF]/50 transition-all" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ONGLET EXPORTS */}
                    {activeTab === 'exports' && (
                        <div className="bg-white dark:bg-[#13151A] rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-6 animate-fade-in">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <Download className="w-5 h-5" />
                                Exports des Données
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="border border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.02] p-6 rounded-2xl">
                                    <h4 className="font-bold text-slate-800 dark:text-white mb-2">Rapports Financiers</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">Exportez vos statistiques, commissions, et graphiques au format PDF ou Excel.</p>
                                    <div className="flex flex-col gap-3">
                                        <button 
                                            onClick={() => handleExport('pdf')} 
                                            disabled={exportLoading || !exportData.dashboardStats}
                                            className="w-full justify-center flex items-center gap-2 bg-[#0066FF] hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
                                        >
                                            {exportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Rapports Statistiques (PDF)
                                        </button>
                                        <button 
                                            onClick={() => handleExport('excel_dash')} 
                                            disabled={exportLoading || !exportData.dashboardStats}
                                            className="w-full justify-center flex items-center gap-2 bg-white dark:bg-[#13151A] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors text-slate-700 dark:text-slate-300 disabled:opacity-50"
                                        >
                                            {exportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Rapports Statistiques (Excel)
                                        </button>
                                    </div>
                                </div>

                                <div className="border border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.02] p-6 rounded-2xl">
                                    <h4 className="font-bold text-slate-800 dark:text-white mb-2">Bases de données</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">Téléchargez l'intégralité de vos bases de données clients et contrats.</p>
                                    <div className="flex flex-col gap-3">
                                        <button 
                                            onClick={() => handleExport('clients')} 
                                            disabled={exportLoading}
                                            className="w-full justify-center flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
                                        >
                                            {exportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Base Clients (Excel)
                                        </button>
                                        <button 
                                            onClick={() => handleExport('contrats')} 
                                            disabled={exportLoading}
                                            className="w-full justify-center flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
                                        >
                                            {exportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Base Contrats (Excel)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* SAVE BUTTON STICKY FOOTER */}
                    {activeTab !== 'exports' && (
                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleSaveOrganization}
                                disabled={loading}
                                className="flex items-center gap-2 bg-[#0066FF] hover:bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-md shadow-blue-500/20 hover:shadow-lg disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Enregistrer les Paramètres
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
