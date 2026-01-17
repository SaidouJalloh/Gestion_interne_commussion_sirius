import { Router } from 'express';
import { organizationController } from './organization.controller';
import { validate } from '../../middlewares/validate';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from './organization.validation';
import { optionalTenantMiddleware } from '../../middlewares/tenant.middleware';

const router = Router();

// Routes qui nécessitent une authentification mais pas forcément une organisation active
router.use(optionalTenantMiddleware);

// Créer une organisation (pas besoin d'organisation active)
router.post(
  '/',
  validate(createOrganizationSchema),
  organizationController.create.bind(organizationController),
);

// Lister les organisations de l'utilisateur
router.get('/', organizationController.getAll.bind(organizationController));

// Obtenir les détails d'une organisation
router.get('/:id', organizationController.getById.bind(organizationController));

// Mettre à jour une organisation
router.put(
  '/:id',
  validate(updateOrganizationSchema),
  organizationController.update.bind(organizationController),
);

// Supprimer une organisation
router.delete('/:id', organizationController.delete.bind(organizationController));

// Lister les membres d'une organisation
router.get('/:id/members', organizationController.getMembers.bind(organizationController));

// Inviter un membre
router.post(
  '/:id/members',
  validate(inviteMemberSchema),
  organizationController.inviteMember.bind(organizationController),
);

// Modifier le rôle d'un membre
router.put(
  '/:id/members/:memberId/role',
  validate(updateMemberRoleSchema),
  organizationController.updateMemberRole.bind(organizationController),
);

// Retirer un membre
router.delete(
  '/:id/members/:memberId',
  organizationController.removeMember.bind(organizationController),
);

// Accepter une invitation
router.post(
  '/:id/accept-invitation',
  organizationController.acceptInvitation.bind(organizationController),
);

export default router;
