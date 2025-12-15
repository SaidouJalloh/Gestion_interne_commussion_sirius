import { prisma } from '../../core/prisma';
import type { CreateMediaInput, MediaListQuery, UpdateMediaInput } from './media.validation';

const toBigInt = (value: string | number) => {
  if (typeof value === 'number') return BigInt(Math.trunc(value));
  // string
  return BigInt(value);
};

export class MediaService {
  async getAll(query: MediaListQuery) {
    const where: Record<string, any> = {};

    if (typeof query.trashed === 'boolean') where.supprime = query.trashed;
    if (typeof query.folderId !== 'undefined') where.dossier_id = query.folderId;
    if (typeof query.folderId === 'undefined') where.dossier_id = null;

    return prisma.medias.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        clients: { select: { nom: true, prenom: true } },
        contrats: { select: { type_contrat: true } },
      },
    });
  }

  async getById(id: string) {
    return prisma.medias.findUnique({
      where: { id },
      include: {
        clients: { select: { nom: true, prenom: true } },
        contrats: { select: { type_contrat: true } },
      },
    });
  }

  async create(payload: CreateMediaInput) {
    return prisma.medias.create({
      data: {
        nom: payload.nom.trim(),
        type_fichier: payload.type_fichier ?? null,
        taille:
          payload.taille === null || typeof payload.taille === 'undefined'
            ? null
            : toBigInt(payload.taille as any),
        url: payload.url.trim(),
        dossier_id: payload.dossier_id ?? null,
        contrat_id: payload.contrat_id ?? null,
        client_id: payload.client_id ?? null,
        notes: payload.notes ?? null,
        created_by: payload.created_by ?? null,
      },
      include: {
        clients: { select: { nom: true, prenom: true } },
        contrats: { select: { type_contrat: true } },
      },
    });
  }

  async update(id: string, payload: UpdateMediaInput) {
    const existing = await prisma.medias.findUnique({ where: { id } });
    if (!existing) return null;

    const data: Record<string, unknown> = {};
    if (typeof payload.nom === 'string') data.nom = payload.nom.trim();
    if ('type_fichier' in payload) data.type_fichier = payload.type_fichier ?? null;
    if ('taille' in payload) {
      data.taille =
        payload.taille === null || typeof payload.taille === 'undefined'
          ? null
          : toBigInt(payload.taille as any);
    }
    if (typeof payload.url === 'string') data.url = payload.url.trim();
    if ('dossier_id' in payload) data.dossier_id = payload.dossier_id ?? null;
    if ('contrat_id' in payload) data.contrat_id = payload.contrat_id ?? null;
    if ('client_id' in payload) data.client_id = payload.client_id ?? null;
    if ('notes' in payload) data.notes = payload.notes ?? null;

    return prisma.medias.update({
      where: { id },
      data,
      include: {
        clients: { select: { nom: true, prenom: true } },
        contrats: { select: { type_contrat: true } },
      },
    });
  }

  async trash(id: string) {
    const existing = await prisma.medias.findUnique({ where: { id } });
    if (!existing) return null;

    return prisma.medias.update({
      where: { id },
      data: {
        supprime: true,
        date_suppression: new Date(),
      },
      include: {
        clients: { select: { nom: true, prenom: true } },
        contrats: { select: { type_contrat: true } },
      },
    });
  }

  async restore(id: string) {
    const existing = await prisma.medias.findUnique({ where: { id } });
    if (!existing) return null;

    return prisma.medias.update({
      where: { id },
      data: {
        supprime: false,
        date_suppression: null,
      },
      include: {
        clients: { select: { nom: true, prenom: true } },
        contrats: { select: { type_contrat: true } },
      },
    });
  }

  async delete(id: string) {
    const existing = await prisma.medias.findUnique({ where: { id } });
    if (!existing) return false;
    await prisma.medias.delete({ where: { id } });
    return true;
  }
}



