import React, { useState, useEffect } from 'react';
import type { CreateOrganizationData, UpdateOrganizationData } from '../hooks/useSuperAdminOrganizations';

interface OrganizationFormProps {
  initialData?: {
    name?: string;
    slug?: string;
    logo_url?: string | null;
  };
  onSubmit: (data: CreateOrganizationData | UpdateOrganizationData) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
  loading?: boolean;
}

export const OrganizationForm: React.FC<OrganizationFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    logo_url: initialData?.logo_url || '',
    admin_email: '',
    admin_password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createAdmin, setCreateAdmin] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        slug: initialData.slug || '',
        logo_url: initialData.logo_url || '',
        admin_email: '',
        admin_password: '',
      });
    }
  }, [initialData]);

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Le slug est requis';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets';
    }

    if (formData.logo_url && formData.logo_url.trim()) {
      try {
        new URL(formData.logo_url);
      } catch {
        newErrors.logo_url = 'L\'URL du logo doit être valide';
      }
    }

    if (createAdmin) {
      if (!formData.admin_email.trim()) {
        newErrors.admin_email = 'L\'email de l\'admin est requis';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.admin_email)) {
        newErrors.admin_email = 'L\'email doit être valide';
      }

      if (!formData.admin_password.trim()) {
        newErrors.admin_password = 'Le mot de passe est requis';
      } else if (formData.admin_password.length < 8) {
        newErrors.admin_password = 'Le mot de passe doit contenir au moins 8 caractères';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('[OrganizationForm] handleSubmit appelé');
    
    if (!validate()) {
      console.log('[OrganizationForm] Validation échouée');
      return;
    }

    console.log('[OrganizationForm] Validation réussie, préparation des données...');

    const submitData: CreateOrganizationData | UpdateOrganizationData = isEdit
      ? {
          name: formData.name,
          logo_url: formData.logo_url || null,
        }
      : {
          name: formData.name,
          slug: formData.slug,
          logo_url: formData.logo_url || null,
          ...(createAdmin && {
            admin_email: formData.admin_email,
            admin_password: formData.admin_password,
          }),
        };

    console.log('[OrganizationForm] Données préparées:', { ...submitData, admin_password: '***' });
    console.log('[OrganizationForm] Appel de onSubmit...');

    try {
      await onSubmit(submitData);
      console.log('[OrganizationForm] onSubmit terminé avec succès');
    } catch (error) {
      console.error('[OrganizationForm] Erreur dans onSubmit:', error);
      throw error; // Propager l'erreur pour que le modal puisse la gérer
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nom de l'organisation *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={handleNameChange}
          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
            errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="Ex: Acme Corporation"
          required
          disabled={loading}
        />
        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Slug *
        </label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, slug: e.target.value.toLowerCase() }))
          }
          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
            errors.slug ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="acme-corporation"
          required
          disabled={loading || isEdit}
        />
        {errors.slug && <p className="text-sm text-red-500 mt-1">{errors.slug}</p>}
        {!isEdit && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Généré automatiquement si vide. Utilisé pour l'URL de l'organisation.
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          URL du logo (optionnel)
        </label>
        <input
          type="url"
          value={formData.logo_url}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, logo_url: e.target.value }))
          }
          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
            errors.logo_url ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="https://example.com/logo.png"
          disabled={loading}
        />
        {errors.logo_url && <p className="text-sm text-red-500 mt-1">{errors.logo_url}</p>}
      </div>

      {!isEdit && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={createAdmin}
              onChange={(e) => setCreateAdmin(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600"
              disabled={loading}
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Créer un administrateur initial
            </span>
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
            Si coché, un utilisateur admin sera créé automatiquement pour cette organisation.
          </p>
        </div>
      )}

      {!isEdit && createAdmin && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email de l'administrateur *
            </label>
            <input
              type="email"
              value={formData.admin_email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, admin_email: e.target.value }))
              }
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.admin_email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="admin@example.com"
              required={createAdmin}
              disabled={loading}
            />
            {errors.admin_email && (
              <p className="text-sm text-red-500 mt-1">{errors.admin_email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mot de passe de l'administrateur *
            </label>
            <input
              type="password"
              value={formData.admin_password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, admin_password: e.target.value }))
              }
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.admin_password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Minimum 8 caractères"
              required={createAdmin}
              disabled={loading}
            />
            {errors.admin_password && (
              <p className="text-sm text-red-500 mt-1">{errors.admin_password}</p>
            )}
          </div>
        </>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          disabled={loading}
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  );
};
