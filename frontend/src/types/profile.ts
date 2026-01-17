export type UserRole = 'gestionnaire' | 'admin' | 'superadmin' | (string & {});

// Profil utilisateur (table `profiles`)
export type Profile = {
  id: string;
  email?: string | null;
  nom?: string | null;
  prenom?: string | null;
  telephone?: string | null;
  avatar_url?: string | null;
  role?: UserRole | null;
  actif?: boolean | null;
  is_superadmin?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  // Tolérance: la table peut contenir d'autres colonnes
  [key: string]: unknown;
};


