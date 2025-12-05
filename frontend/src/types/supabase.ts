export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          adresse: string | null
          code_postal: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          nom: string
          notes: string | null
          prenom: string
          telephone: string | null
          type_client: string
          updated_at: string | null
          ville: string | null
        }
        Insert: {
          adresse?: string | null
          code_postal?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          nom: string
          notes?: string | null
          prenom: string
          telephone?: string | null
          type_client: string
          updated_at?: string | null
          ville?: string | null
        }
        Update: {
          adresse?: string | null
          code_postal?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          nom?: string
          notes?: string | null
          prenom?: string
          telephone?: string | null
          type_client?: string
          updated_at?: string | null
          ville?: string | null
        }
        Relationships: []
      }
      compagnies: {
        Row: {
          actif: boolean | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          lien_souscription: string | null
          logo_url: string | null
          nom: string
          sigle: string
          taux_commissions: Json
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          lien_souscription?: string | null
          logo_url?: string | null
          nom: string
          sigle: string
          taux_commissions?: Json
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          lien_souscription?: string | null
          logo_url?: string | null
          nom?: string
          sigle?: string
          taux_commissions?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      contrats: {
        Row: {
          client_id: string
          commission: number
          compagnie_id: string
          created_at: string | null
          date_effet: string
          date_expiration: string
          evacuation_sanitaire: number | null
          fga: number | null
          fractionnement: string | null
          id: string
          immatriculation: string | null
          is_flotte: boolean | null
          montant_accessoire: number | null
          montant_incorporations: number | null
          nombre_incorporations: number | null
          notes: string | null
          prime_nette: number
          prime_regulation: number | null
          prime_ttc: number | null
          prime_ttc_initial: number | null
          statut: string | null
          taux_commission: number
          taxes: number | null
          type_contrat: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          commission: number
          compagnie_id: string
          created_at?: string | null
          date_effet: string
          date_expiration: string
          evacuation_sanitaire?: number | null
          fga?: number | null
          fractionnement?: string | null
          id?: string
          immatriculation?: string | null
          is_flotte?: boolean | null
          montant_accessoire?: number | null
          montant_incorporations?: number | null
          nombre_incorporations?: number | null
          notes?: string | null
          prime_nette: number
          prime_regulation?: number | null
          prime_ttc?: number | null
          prime_ttc_initial?: number | null
          statut?: string | null
          taux_commission: number
          taxes?: number | null
          type_contrat: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          commission?: number
          compagnie_id?: string
          created_at?: string | null
          date_effet?: string
          date_expiration?: string
          evacuation_sanitaire?: number | null
          fga?: number | null
          fractionnement?: string | null
          id?: string
          immatriculation?: string | null
          is_flotte?: boolean | null
          montant_accessoire?: number | null
          montant_incorporations?: number | null
          nombre_incorporations?: number | null
          notes?: string | null
          prime_nette?: number
          prime_regulation?: number | null
          prime_ttc?: number | null
          prime_ttc_initial?: number | null
          statut?: string | null
          taux_commission?: number
          taxes?: number | null
          type_contrat?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contrats_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contrats_compagnie_id_fkey"
            columns: ["compagnie_id"]
            isOneToOne: false
            referencedRelation: "compagnies"
            referencedColumns: ["id"]
          },
        ]
      }
      dossiers: {
        Row: {
          client_id: string | null
          contrat_id: string | null
          couleur: string | null
          created_at: string | null
          id: string
          nom: string
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          contrat_id?: string | null
          couleur?: string | null
          created_at?: string | null
          id?: string
          nom: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          contrat_id?: string | null
          couleur?: string | null
          created_at?: string | null
          id?: string
          nom?: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dossiers_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dossiers_contrat_id_fkey"
            columns: ["contrat_id"]
            isOneToOne: false
            referencedRelation: "contrats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dossiers_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
      incorporations: {
        Row: {
          commission: number
          contrat_id: string | null
          created_at: string | null
          created_by: string | null
          date_effet: string
          date_expiration: string | null
          fga: number
          id: string
          montant_accessoire: number | null
          nombre_elements: number
          notes: string | null
          prime_nette: number
          prime_ttc: number
          taxes: number
        }
        Insert: {
          commission: number
          contrat_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date_effet: string
          date_expiration?: string | null
          fga: number
          id?: string
          montant_accessoire?: number | null
          nombre_elements: number
          notes?: string | null
          prime_nette: number
          prime_ttc: number
          taxes: number
        }
        Update: {
          commission?: number
          contrat_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date_effet?: string
          date_expiration?: string | null
          fga?: number
          id?: string
          montant_accessoire?: number | null
          nombre_elements?: number
          notes?: string | null
          prime_nette?: number
          prime_ttc?: number
          taxes?: number
        }
        Relationships: [
          {
            foreignKeyName: "incorporations_contrat_id_fkey"
            columns: ["contrat_id"]
            isOneToOne: false
            referencedRelation: "contrats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incorporations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medias: {
        Row: {
          client_id: string | null
          contrat_id: string | null
          created_at: string | null
          created_by: string | null
          date_suppression: string | null
          dossier_id: string | null
          id: string
          nom: string
          notes: string | null
          supprime: boolean | null
          taille: number | null
          type_fichier: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          client_id?: string | null
          contrat_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date_suppression?: string | null
          dossier_id?: string | null
          id?: string
          nom: string
          notes?: string | null
          supprime?: boolean | null
          taille?: number | null
          type_fichier?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          client_id?: string | null
          contrat_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date_suppression?: string | null
          dossier_id?: string | null
          id?: string
          nom?: string
          notes?: string | null
          supprime?: boolean | null
          taille?: number | null
          type_fichier?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "medias_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medias_contrat_id_fkey"
            columns: ["contrat_id"]
            isOneToOne: false
            referencedRelation: "contrats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medias_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          contrat_id: string | null
          created_at: string | null
          id: string
          message: string
          priorite: string | null
          statut: string | null
          titre: string
          type: string
        }
        Insert: {
          contrat_id?: string | null
          created_at?: string | null
          id?: string
          message: string
          priorite?: string | null
          statut?: string | null
          titre: string
          type: string
        }
        Update: {
          contrat_id?: string | null
          created_at?: string | null
          id?: string
          message?: string
          priorite?: string | null
          statut?: string | null
          titre?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_contrat_id_fkey"
            columns: ["contrat_id"]
            isOneToOne: false
            referencedRelation: "contrats"
            referencedColumns: ["id"]
          },
        ]
      }
      paiements: {
        Row: {
          contrat_id: string
          created_at: string | null
          date_paiement: string
          id: string
          mode_paiement: string
          montant: number
          notes: string | null
          type_paiement: string
          updated_at: string | null
        }
        Insert: {
          contrat_id: string
          created_at?: string | null
          date_paiement: string
          id?: string
          mode_paiement: string
          montant: number
          notes?: string | null
          type_paiement: string
          updated_at?: string | null
        }
        Update: {
          contrat_id?: string
          created_at?: string | null
          date_paiement?: string
          id?: string
          mode_paiement?: string
          montant?: number
          notes?: string | null
          type_paiement?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paiements_contrat_id_fkey"
            columns: ["contrat_id"]
            isOneToOne: false
            referencedRelation: "contrats"
            referencedColumns: ["id"]
          },
        ]
      }
      partages: {
        Row: {
          created_at: string | null
          created_by: string | null
          email_partage: string
          expires_at: string | null
          id: string
          media_id: string | null
          permission: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email_partage: string
          expires_at?: string | null
          id?: string
          media_id?: string | null
          permission?: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email_partage?: string
          expires_at?: string | null
          id?: string
          media_id?: string | null
          permission?: string
        }
        Relationships: [
          {
            foreignKeyName: "partages_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          actif: boolean | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          nom: string | null
          prenom: string | null
          role: string
          telephone: string | null
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          nom?: string | null
          prenom?: string | null
          role?: string
          telephone?: string | null
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nom?: string | null
          prenom?: string | null
          role?: string
          telephone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles_backup_final: {
        Row: {
          actif: boolean | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string | null
          nom: string | null
          prenom: string | null
          role: string | null
          telephone: string | null
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          nom?: string | null
          prenom?: string | null
          role?: string | null
          telephone?: string | null
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          nom?: string | null
          prenom?: string | null
          role?: string | null
          telephone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sinistres: {
        Row: {
          circonstances: string | null
          client_id: string
          compagnie_id: string | null
          contrat_id: string
          created_at: string | null
          created_by: string | null
          date_cloture: string | null
          date_envoi_compagnie: string | null
          date_expertise: string | null
          date_paiement_indemnite: string | null
          date_reception: string | null
          date_sinistre: string
          date_traitement: string | null
          description: string
          dommages_corporels: boolean | null
          dommages_materiels: boolean | null
          gestionnaire_id: string | null
          heure_sinistre: string | null
          id: string
          lieu_sinistre: string
          montant_estime: number | null
          montant_indemnise: number | null
          motif_rejet: string | null
          nombre_blesses: number | null
          notes_internes: string | null
          numero_sinistre: string
          priorite: string | null
          statut: string | null
          tiers_impliques: Json | null
          type_sinistre: string
          updated_at: string | null
          vehicule_id: string | null
          vehicule_roulant: boolean | null
        }
        Insert: {
          circonstances?: string | null
          client_id: string
          compagnie_id?: string | null
          contrat_id: string
          created_at?: string | null
          created_by?: string | null
          date_cloture?: string | null
          date_envoi_compagnie?: string | null
          date_expertise?: string | null
          date_paiement_indemnite?: string | null
          date_reception?: string | null
          date_sinistre: string
          date_traitement?: string | null
          description: string
          dommages_corporels?: boolean | null
          dommages_materiels?: boolean | null
          gestionnaire_id?: string | null
          heure_sinistre?: string | null
          id?: string
          lieu_sinistre: string
          montant_estime?: number | null
          montant_indemnise?: number | null
          motif_rejet?: string | null
          nombre_blesses?: number | null
          notes_internes?: string | null
          numero_sinistre: string
          priorite?: string | null
          statut?: string | null
          tiers_impliques?: Json | null
          type_sinistre: string
          updated_at?: string | null
          vehicule_id?: string | null
          vehicule_roulant?: boolean | null
        }
        Update: {
          circonstances?: string | null
          client_id?: string
          compagnie_id?: string | null
          contrat_id?: string
          created_at?: string | null
          created_by?: string | null
          date_cloture?: string | null
          date_envoi_compagnie?: string | null
          date_expertise?: string | null
          date_paiement_indemnite?: string | null
          date_reception?: string | null
          date_sinistre?: string
          date_traitement?: string | null
          description?: string
          dommages_corporels?: boolean | null
          dommages_materiels?: boolean | null
          gestionnaire_id?: string | null
          heure_sinistre?: string | null
          id?: string
          lieu_sinistre?: string
          montant_estime?: number | null
          montant_indemnise?: number | null
          motif_rejet?: string | null
          nombre_blesses?: number | null
          notes_internes?: string | null
          numero_sinistre?: string
          priorite?: string | null
          statut?: string | null
          tiers_impliques?: Json | null
          type_sinistre?: string
          updated_at?: string | null
          vehicule_id?: string | null
          vehicule_roulant?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "sinistres_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sinistres_compagnie_id_fkey"
            columns: ["compagnie_id"]
            isOneToOne: false
            referencedRelation: "compagnies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sinistres_contrat_id_fkey"
            columns: ["contrat_id"]
            isOneToOne: false
            referencedRelation: "contrats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sinistres_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sinistres_gestionnaire_id_fkey"
            columns: ["gestionnaire_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sinistres_vehicule_id_fkey"
            columns: ["vehicule_id"]
            isOneToOne: false
            referencedRelation: "vehicules"
            referencedColumns: ["id"]
          },
        ]
      }
      sinistres_documents: {
        Row: {
          created_at: string | null
          date_validation: string | null
          id: string
          mime_type: string | null
          nom_fichier: string
          sinistre_id: string
          soumis_par: string
          soumis_par_id: string | null
          taille: number | null
          type_document: string
          url: string
          valide: boolean | null
          valide_par: string | null
        }
        Insert: {
          created_at?: string | null
          date_validation?: string | null
          id?: string
          mime_type?: string | null
          nom_fichier: string
          sinistre_id: string
          soumis_par: string
          soumis_par_id?: string | null
          taille?: number | null
          type_document: string
          url: string
          valide?: boolean | null
          valide_par?: string | null
        }
        Update: {
          created_at?: string | null
          date_validation?: string | null
          id?: string
          mime_type?: string | null
          nom_fichier?: string
          sinistre_id?: string
          soumis_par?: string
          soumis_par_id?: string | null
          taille?: number | null
          type_document?: string
          url?: string
          valide?: boolean | null
          valide_par?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sinistres_documents_sinistre_id_fkey"
            columns: ["sinistre_id"]
            isOneToOne: false
            referencedRelation: "sinistres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sinistres_documents_valide_par_fkey"
            columns: ["valide_par"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sinistres_historique: {
        Row: {
          ancien_statut: string | null
          commentaire: string | null
          created_at: string | null
          id: string
          modifie_par: string | null
          modifie_par_nom: string | null
          nouveau_statut: string
          sinistre_id: string
          visible_client: boolean | null
        }
        Insert: {
          ancien_statut?: string | null
          commentaire?: string | null
          created_at?: string | null
          id?: string
          modifie_par?: string | null
          modifie_par_nom?: string | null
          nouveau_statut: string
          sinistre_id: string
          visible_client?: boolean | null
        }
        Update: {
          ancien_statut?: string | null
          commentaire?: string | null
          created_at?: string | null
          id?: string
          modifie_par?: string | null
          modifie_par_nom?: string | null
          nouveau_statut?: string
          sinistre_id?: string
          visible_client?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "sinistres_historique_modifie_par_fkey"
            columns: ["modifie_par"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sinistres_historique_sinistre_id_fkey"
            columns: ["sinistre_id"]
            isOneToOne: false
            referencedRelation: "sinistres"
            referencedColumns: ["id"]
          },
        ]
      }
      sinistres_messages: {
        Row: {
          created_at: string | null
          date_lecture: string | null
          expediteur: string
          expediteur_id: string | null
          expediteur_nom: string | null
          fichiers: Json | null
          id: string
          lu: boolean | null
          message: string
          sinistre_id: string
        }
        Insert: {
          created_at?: string | null
          date_lecture?: string | null
          expediteur: string
          expediteur_id?: string | null
          expediteur_nom?: string | null
          fichiers?: Json | null
          id?: string
          lu?: boolean | null
          message: string
          sinistre_id: string
        }
        Update: {
          created_at?: string | null
          date_lecture?: string | null
          expediteur?: string
          expediteur_id?: string | null
          expediteur_nom?: string | null
          fichiers?: Json | null
          id?: string
          lu?: boolean | null
          message?: string
          sinistre_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sinistres_messages_sinistre_id_fkey"
            columns: ["sinistre_id"]
            isOneToOne: false
            referencedRelation: "sinistres"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicules: {
        Row: {
          actif: boolean | null
          annee: number | null
          contrat_id: string
          created_at: string | null
          date_mise_circulation: string | null
          id: string
          immatriculation: string
          marque: string | null
          modele: string | null
          notes: string | null
          numero_chassis: string | null
          puissance_fiscale: number | null
          updated_at: string | null
          usage: string | null
          valeur_venale: number | null
        }
        Insert: {
          actif?: boolean | null
          annee?: number | null
          contrat_id: string
          created_at?: string | null
          date_mise_circulation?: string | null
          id?: string
          immatriculation: string
          marque?: string | null
          modele?: string | null
          notes?: string | null
          numero_chassis?: string | null
          puissance_fiscale?: number | null
          updated_at?: string | null
          usage?: string | null
          valeur_venale?: number | null
        }
        Update: {
          actif?: boolean | null
          annee?: number | null
          contrat_id?: string
          created_at?: string | null
          date_mise_circulation?: string | null
          id?: string
          immatriculation?: string
          marque?: string | null
          modele?: string | null
          notes?: string | null
          numero_chassis?: string | null
          puissance_fiscale?: number | null
          updated_at?: string | null
          usage?: string | null
          valeur_venale?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicules_contrat_id_fkey"
            columns: ["contrat_id"]
            isOneToOne: false
            referencedRelation: "contrats"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      dashboard_stats_cache: {
        Row: {
          clients_entreprises: number | null
          clients_particuliers: number | null
          commissions_encaissees: number | null
          commissions_total: number | null
          contrats_actifs: number | null
          contrats_expirants: number | null
          derniere_maj: string | null
          primes_encaissees: number | null
          primes_total: number | null
          total_clients: number | null
          total_contrats: number | null
        }
        Relationships: []
      }
      stats_contrats_cache: {
        Row: {
          contrats_actifs: number | null
          contrats_expires: number | null
          contrats_flottes: number | null
          derniere_maj: string | null
          taux_moyen: number | null
          total_commissions: number | null
          total_contrats: number | null
          total_primes_nettes: number | null
          total_primes_ttc: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      count_vehicules: { Args: { contrat_uuid: string }; Returns: number }
      est_client_portail: { Args: never; Returns: boolean }
      est_equipe_interne: { Args: never; Returns: boolean }
      generer_notifications_contrats_expirants: {
        Args: never
        Returns: undefined
      }
      generer_numero_sinistre: { Args: never; Returns: string }
      get_client_id_from_portail: { Args: never; Returns: string }
      get_contrats_with_stats: {
        Args: never
        Returns: {
          client_id: string
          client_nom: string
          client_prenom: string
          client_type: string
          commission: number
          compagnie_id: string
          compagnie_logo: string
          compagnie_nom: string
          compagnie_sigle: string
          date_effet: string
          date_expiration: string
          id: string
          is_flotte: boolean
          nb_vehicules: number
          prime_nette: number
          prime_ttc: number
          statut: string
          taux_commission: number
          type_contrat: string
        }[]
      }
      get_user_role: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const


