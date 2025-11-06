import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const PortailAuthContext = createContext({});

export const usePortailAuth = () => {
    const context = useContext(PortailAuthContext);
    if (!context) {
        throw new Error('usePortailAuth doit être utilisé dans PortailAuthProvider');
    }
    return context;
};

export const PortailAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [clientData, setClientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);

    // 📥 Charger les données du client
    const loadClientData = useCallback(async (userId) => {
        try {
            console.log('🔄 Chargement des données pour userId:', userId);

            // 1. Récupérer le compte portail (sans .single())
            const { data: portailData, error: portailError } = await supabase
                .from('clients_portail')
                .select('*')
                .eq('id', userId);

            console.log('📊 Résultats clients_portail:', portailData, 'Erreur:', portailError);

            if (portailError) {
                console.error('❌ Erreur portailData:', portailError);
                throw portailError;
            }

            if (!portailData || portailData.length === 0) {
                throw new Error('Compte portail introuvable');
            }

            const comptePortail = portailData[0];

            // 2. Récupérer les infos complètes du client
            const { data: clientInfo, error: clientError } = await supabase
                .from('clients')
                .select('*')
                .eq('id', comptePortail.client_id);

            console.log('📊 Résultats clients:', clientInfo, 'Erreur:', clientError);

            if (clientError) {
                console.error('❌ Erreur clientInfo:', clientError);
                throw clientError;
            }

            if (!clientInfo || clientInfo.length === 0) {
                throw new Error('Informations client introuvables');
            }

            const infoClient = clientInfo[0];

            setClientData({
                ...comptePortail,
                client: infoClient
            });

            console.log('✅ Données chargées avec succès:', {
                portail: comptePortail.email,
                client: infoClient.nom + ' ' + infoClient.prenom
            });

            // 3. Mettre à jour la dernière connexion
            const { error: updateError } = await supabase
                .from('clients_portail')
                .update({
                    derniere_connexion: new Date().toISOString(),
                    tentatives_connexion: 0
                })
                .eq('id', userId);

            if (updateError) {
                console.warn('⚠️ Erreur mise à jour dernière connexion:', updateError);
            }

        } catch (error) {
            console.error('❌ Erreur loadClientData:', error.message, error);
            toast.error('Impossible de charger vos informations: ' + error.message);

            // Déconnecter l'utilisateur en cas d'erreur
            await supabase.auth.signOut();
            setUser(null);
            setClientData(null);
            setSession(null);
        }
    }, []);

    // ✅ Vérifier si l'utilisateur est connecté
    const checkUser = useCallback(async () => {
        try {
            setLoading(true);
            console.log('🔍 Vérification de la session...');

            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) throw error;

            if (session) {
                console.log('✅ Session trouvée:', session.user.email);
                setSession(session);
                setUser(session.user);
                await loadClientData(session.user.id);
            } else {
                console.log('ℹ️ Aucune session active');
            }
        } catch (error) {
            console.error('❌ Erreur checkUser:', error.message);
        } finally {
            setLoading(false);
        }
    }, [loadClientData]);

    // 🔍 Charger la session au démarrage
    useEffect(() => {
        checkUser();

        // 👂 Écouter les changements d'auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('🔐 Auth event:', event);

                if (event === 'SIGNED_IN' && session) {
                    setSession(session);
                    setUser(session.user);
                    await loadClientData(session.user.id);
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setClientData(null);
                    setSession(null);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [checkUser, loadClientData]);

    // 🔑 Connexion
    const login = async (email, password) => {
        try {
            console.log('🔐 Tentative de connexion pour:', email);

            // 1. Vérifier si le compte existe et est actif
            const { data: comptes, error: compteError } = await supabase
                .from('clients_portail')
                .select('*')
                .eq('email', email.toLowerCase().trim());

            if (compteError) {
                console.error('❌ Erreur vérification compte:', compteError);
                toast.error('Erreur lors de la vérification du compte');
                return { success: false };
            }

            if (!comptes || comptes.length === 0) {
                toast.error('Email ou mot de passe incorrect');
                return { success: false };
            }

            const compte = comptes[0];

            if (!compte.actif) {
                toast.error('Votre compte est désactivé. Contactez-nous.');
                return { success: false };
            }

            // 2. Vérifier si le compte est bloqué
            if (compte.bloque_jusqua && new Date(compte.bloque_jusqua) > new Date()) {
                const minutesRestantes = Math.ceil(
                    (new Date(compte.bloque_jusqua) - new Date()) / 60000
                );
                toast.error(
                    `Compte temporairement bloqué. Réessayez dans ${minutesRestantes} minute(s).`
                );
                return { success: false };
            }

            // 3. Récupérer les infos du client (avant la connexion Auth)
            const { data: clientsInfo, error: clientError } = await supabase
                .from('clients')
                .select('*')
                .eq('id', compte.client_id);

            if (clientError || !clientsInfo || clientsInfo.length === 0) {
                console.error('❌ Erreur chargement client:', clientError);
                toast.error('Erreur lors du chargement de vos informations');
                return { success: false };
            }

            const clientInfo = clientsInfo[0];

            // 4. Connexion Supabase Auth
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.toLowerCase().trim(),
                password: password
            });

            if (error) {
                console.error('❌ Erreur authentification:', error);

                // Incrémenter les tentatives échouées
                const nouvelleTentative = (compte.tentatives_connexion || 0) + 1;
                const updates = { tentatives_connexion: nouvelleTentative };

                // Bloquer après 5 tentatives
                if (nouvelleTentative >= 5) {
                    const blocageJusqua = new Date();
                    blocageJusqua.setMinutes(blocageJusqua.getMinutes() + 15);
                    updates.bloque_jusqua = blocageJusqua.toISOString();

                    toast.error('Trop de tentatives échouées. Compte bloqué 15 minutes.');
                } else {
                    toast.error('Email ou mot de passe incorrect');
                }

                await supabase
                    .from('clients_portail')
                    .update(updates)
                    .eq('email', email.toLowerCase().trim());

                return { success: false };
            }

            console.log('✅ Authentification réussie');

            // ✅ Connexion réussie
            setSession(data.session);
            setUser(data.user);
            await loadClientData(data.user.id);

            // Vérifier si première connexion
            if (compte.premier_connexion) {
                toast.success('Bienvenue ! Pensez à changer votre mot de passe.', {
                    duration: 5000
                });
                return { success: true, premierConnexion: true };
            }

            toast.success(`Bienvenue ${clientInfo.prenom} !`);
            return { success: true, premierConnexion: false };

        } catch (error) {
            console.error('❌ Erreur login:', error);
            toast.error('Une erreur est survenue lors de la connexion');
            return { success: false };
        }
    };

    // 🚪 Déconnexion
    const logout = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            setClientData(null);
            setSession(null);
            toast.success('Déconnexion réussie');
        } catch (error) {
            console.error('❌ Erreur logout:', error);
            toast.error('Erreur lors de la déconnexion');
        }
    };

    // 🔄 Changer le mot de passe
    const changePassword = async (newPassword) => {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            // Marquer que ce n'est plus la première connexion
            await supabase
                .from('clients_portail')
                .update({ premier_connexion: false })
                .eq('id', user.id);

            toast.success('Mot de passe modifié avec succès');
            return { success: true };
        } catch (error) {
            console.error('❌ Erreur changePassword:', error);
            toast.error('Erreur lors du changement de mot de passe');
            return { success: false };
        }
    };

    // 📧 Demander réinitialisation mot de passe
    const requestPasswordReset = async (email) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/portail/reset-password`
            });

            if (error) throw error;

            toast.success('Email de réinitialisation envoyé !');
            return { success: true };
        } catch (error) {
            console.error('❌ Erreur requestPasswordReset:', error);
            toast.error('Erreur lors de l\'envoi de l\'email');
            return { success: false };
        }
    };

    const value = {
        user,
        clientData,
        session,
        loading,
        login,
        logout,
        changePassword,
        requestPasswordReset,
        isAuthenticated: !!user,
        isPremierConnexion: clientData?.premier_connexion || false
    };

    return (
        <PortailAuthContext.Provider value={value}>
            {children}
        </PortailAuthContext.Provider>
    );
};
