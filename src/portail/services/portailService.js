import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

// 🔍 Récupérer les données du client connecté
export const getClientData = async () => {
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const { data: portailData, error: portailError } = await supabase
            .from('clients_portail')
            .select('*, clients(*)')
            .eq('id', user.id)
            .single();

        if (portailError) throw portailError;

        return { data: portailData, error: null };
    } catch (error) {
        console.error('Erreur getClientData:', error);
        return { data: null, error };
    }
};

// 📝 Créer un nouveau sinistre
export const creerSinistre = async (sinistreData) => {
    try {
        const { data, error } = await supabase
            .from('sinistres')
            .insert([sinistreData])
            .select()
            .single();

        if (error) throw error;

        toast.success('Sinistre déclaré avec succès !');
        return { data, error: null };
    } catch (error) {
        console.error('Erreur creerSinistre:', error);
        toast.error('Erreur lors de la déclaration du sinistre');
        return { data: null, error };
    }
};

// 📤 Uploader un document
export const uploadDocument = async (clientId, sinistreId, file, typeDocument) => {
    try {
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const filePath = `${clientId}/${sinistreId}/${fileName}`;

        // Upload vers Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('sinistres-documents')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) throw uploadError;

        // Enregistrer dans la table sinistres_documents
        const { data: docData, error: docError } = await supabase
            .from('sinistres_documents')
            .insert([{
                sinistre_id: sinistreId,
                nom_fichier: file.name,
                type_fichier: file.type,
                taille_fichier: file.size,
                chemin_fichier: uploadData.path,
                type_document: typeDocument
            }])
            .select()
            .single();

        if (docError) throw docError;

        return { data: docData, error: null };
    } catch (error) {
        console.error('Erreur uploadDocument:', error);
        toast.error(`Erreur upload ${file.name}`);
        return { data: null, error };
    }
};

// 📋 Récupérer les sinistres d'un client
export const getSinistresClient = async (clientId, filters = {}) => {
    try {
        let query = supabase
            .from('sinistres')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        // Filtres optionnels
        if (filters.statut) {
            query = query.eq('statut', filters.statut);
        }
        if (filters.type_sinistre) {
            query = query.eq('type_sinistre', filters.type_sinistre);
        }
        if (filters.search) {
            query = query.or(`numero_sinistre.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        console.error('Erreur getSinistresClient:', error);
        return { data: [], error };
    }
};

// 🔍 Récupérer un sinistre spécifique
export const getSinistreById = async (sinistreId) => {
    try {
        const { data, error } = await supabase
            .from('sinistres')
            .select('*, clients(*)')
            .eq('id', sinistreId)
            .single();

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        console.error('Erreur getSinistreById:', error);
        return { data: null, error };
    }
};

// 📎 Récupérer les documents d'un sinistre
export const getDocumentsSinistre = async (sinistreId) => {
    try {
        const { data, error } = await supabase
            .from('sinistres_documents')
            .select('*')
            .eq('sinistre_id', sinistreId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        console.error('Erreur getDocumentsSinistre:', error);
        return { data: [], error };
    }
};

// 📥 Télécharger un document
export const downloadDocument = async (cheminFichier) => {
    try {
        const { data, error } = await supabase.storage
            .from('sinistres-documents')
            .download(cheminFichier);

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        console.error('Erreur downloadDocument:', error);
        toast.error('Erreur lors du téléchargement');
        return { data: null, error };
    }
};

// 🗑️ Supprimer un document
export const deleteDocument = async (documentId, cheminFichier) => {
    try {
        // Supprimer du storage
        const { error: storageError } = await supabase.storage
            .from('sinistres-documents')
            .remove([cheminFichier]);

        if (storageError) throw storageError;

        // Supprimer de la table
        const { error: dbError } = await supabase
            .from('sinistres_documents')
            .delete()
            .eq('id', documentId);

        if (dbError) throw dbError;

        toast.success('Document supprimé');
        return { error: null };
    } catch (error) {
        console.error('Erreur deleteDocument:', error);
        toast.error('Erreur suppression document');
        return { error };
    }
};

// 📊 Statistiques du client
export const getStatsClient = async (clientId) => {
    try {
        const { data, error } = await supabase
            .from('sinistres')
            .select('id, statut')
            .eq('client_id', clientId);

        if (error) throw error;

        const stats = {
            total: data.length,
            en_cours: data.filter(s => ['recu', 'en_cours', 'expertise_en_cours'].includes(s.statut)).length,
            valides: data.filter(s => s.statut === 'valide').length,
            rejetes: data.filter(s => s.statut === 'rejete').length
        };

        return { data: stats, error: null };
    } catch (error) {
        console.error('Erreur getStatsClient:', error);
        return { data: null, error };
    }
};