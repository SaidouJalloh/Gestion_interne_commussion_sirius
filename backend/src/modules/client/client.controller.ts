import type { Request, Response, NextFunction } from 'express';
import { apiResponse } from '../../admin/utils/apiResponse';
import { ClientService } from './client.service';
import { AuthService } from '../auth/auth.service';
import { prisma } from '../../core/prisma';
import type {
    ClientIdParams,
    CreateClientInput,
    UpdateClientInput,
} from './client.validation';

const service = new ClientService();

let authServiceInstance: AuthService | null = null;
const getAuthService = (): AuthService => {
    if (!authServiceInstance) {
        authServiceInstance = new AuthService();
    }
    return authServiceInstance;
};

export class ClientController {
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const organizationId = req.tenant?.organizationId;
            if (!organizationId) {
                res.status(403).json(
                    apiResponse.error('Organisation requise', 'FORBIDDEN'),
                );
                return;
            }
            const clients = await service.getAll(organizationId);
            res.json(apiResponse.success(clients));
        } catch (e) {
            next(e);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params as unknown as ClientIdParams;
            const organizationId = req.tenant?.organizationId;
            if (!organizationId) {
                res.status(403).json(
                    apiResponse.error('Organisation requise', 'FORBIDDEN'),
                );
                return;
            }
            const client = await service.getById(id, organizationId);
            if (!client) {
                res.status(404).json(apiResponse.error('Client non trouvé', 'NOT_FOUND'));
                return;
            }
            res.json(apiResponse.success(client));
        } catch (e) {
            next(e);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const payload = req.body as CreateClientInput;
            const organizationId = req.tenant?.organizationId;
            if (!organizationId) {
                res.status(403).json(
                    apiResponse.error('Organisation requise', 'FORBIDDEN'),
                );
                return;
            }
            // Ignorer explicitement organization_id du body si présent (sécurité)
            // L'organization_id vient toujours du middleware tenant
            const { organization_id, ...cleanPayload } = payload as CreateClientInput & {
                organization_id?: string;
            };
            const created = await service.create(cleanPayload, organizationId);
            res.status(201).json(apiResponse.success(created));
        } catch (e) {
            next(e);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params as unknown as ClientIdParams;
            const payload = req.body as UpdateClientInput;
            const organizationId = req.tenant?.organizationId;
            if (!organizationId) {
                res.status(403).json(
                    apiResponse.error('Organisation requise', 'FORBIDDEN'),
                );
                return;
            }
            const updated = await service.update(id, payload, organizationId);
            if (!updated) {
                res.status(404).json(apiResponse.error('Client non trouvé', 'NOT_FOUND'));
                return;
            }
            res.json(apiResponse.success(updated));
        } catch (e) {
            next(e);
        }
    }

    async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params as unknown as ClientIdParams;
            const organizationId = req.tenant?.organizationId;
            if (!organizationId) {
                res.status(403).json(
                    apiResponse.error('Organisation requise', 'FORBIDDEN'),
                );
                return;
            }
            const deleted = await service.delete(id, organizationId);
            if (!deleted) {
                res.status(404).json(apiResponse.error('Client non trouvé', 'NOT_FOUND'));
                return;
            }
            res.json(apiResponse.success({ id }));
        } catch (e) {
            next(e);
        }
    }
    /**
     * POST /api/clients/:id/invite
     * Invite un client au portail en créant un compte Supabase
     */
    async invite(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params as unknown as ClientIdParams;
            const organizationId = req.tenant?.organizationId;
            if (!organizationId) {
                res.status(403).json(
                    apiResponse.error('Organisation requise', 'FORBIDDEN'),
                );
                return;
            }

            // Récupérer le client avec user_id
            const client = await prisma.clients.findFirst({
                where: { id, organization_id: organizationId },
            });
            if (!client) {
                res.status(404).json(apiResponse.error('Client non trouvé', 'NOT_FOUND'));
                return;
            }

            // Vérifier que le client a un email
            if (!client.email) {
                res.status(400).json(
                    apiResponse.error(
                        'Le client doit avoir un email pour être invité au portail',
                        'EMAIL_REQUIRED',
                    ),
                );
                return;
            }

            // Vérifier que le client n'a pas déjà un compte
            if (client.user_id) {
                res.status(409).json(
                    apiResponse.error(
                        'Ce client a déjà un compte portail actif',
                        'ALREADY_INVITED',
                    ),
                );
                return;
            }

            // Générer un mot de passe temporaire
            const tempPassword = `Sirius_${Math.random().toString(36).slice(2, 10)}!${Math.floor(Math.random() * 100)}`;

            // Créer le compte Supabase (ou récupérer l'existant en cas de retry)
            let userId: string;
            let passwordNote = tempPassword;
            try {
                userId = await getAuthService().createAdminUser(client.email, tempPassword);
            } catch (authErr: any) {
                // Si le user existe déjà dans Supabase (ex: tentative précédente échouée),
                // on récupère son ID pour compléter le lien
                if (authErr.message?.includes('existe déjà') || authErr.message?.includes('already been registered')) {
                    const existingUserId = await getAuthService().findUserByEmail(client.email);
                    if (!existingUserId) {
                        res.status(400).json(
                            apiResponse.error('Impossible de retrouver le compte existant', 'AUTH_ERROR'),
                        );
                        return;
                    }
                    userId = existingUserId;
                    passwordNote = '(mot de passe défini lors de la première invitation)';
                } else {
                    res.status(400).json(
                        apiResponse.error(authErr.message || 'Erreur lors de la création du compte', 'AUTH_ERROR'),
                    );
                    return;
                }
            }

            // Créer ou mettre à jour le profil dans la table profiles
            await prisma.profiles.upsert({
                where: { id: userId },
                create: {
                    id: userId,
                    email: client.email,
                    nom: client.nom,
                    prenom: client.prenom,
                    role: 'client',
                    telephone: client.telephone,
                    actif: true,
                    is_superadmin: false,
                },
                update: {
                    role: 'client',
                    nom: client.nom,
                    prenom: client.prenom,
                },
            });

            // Lier le compte au client
            await prisma.clients.update({
                where: { id },
                data: { user_id: userId },
            });

            res.status(201).json(apiResponse.success({
                message: 'Compte portail créé avec succès',
                email: client.email,
                temp_password: passwordNote,
            }));
        } catch (e) {
            next(e);
        }
    }
}

export const clientController = new ClientController();








