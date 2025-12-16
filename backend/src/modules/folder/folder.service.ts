import { prisma } from '../../core/prisma';
import type { CreateFolderInput, FoldersListQuery, UpdateFolderInput } from './folder.validation';

export class FolderService {
  async getAll(query: FoldersListQuery) {
    return prisma.dossiers.findMany({
      where: {
        parent_id: query.parentId ?? null,
      },
      orderBy: { nom: 'asc' },
    });
  }

  async getById(id: string) {
    return prisma.dossiers.findUnique({ where: { id } });
  }

  async create(payload: CreateFolderInput) {
    return prisma.dossiers.create({
      data: {
        nom: payload.nom.trim(),
        couleur: payload.couleur ?? undefined,
        parent_id: payload.parent_id ?? null,
        contrat_id: payload.contrat_id ?? null,
        client_id: payload.client_id ?? null,
      },
    });
  }

  async update(id: string, payload: UpdateFolderInput) {
    const existing = await prisma.dossiers.findUnique({ where: { id } });
    if (!existing) return null;

    return prisma.dossiers.update({
      where: { id },
      data: {
        ...(typeof payload.nom === 'string' ? { nom: payload.nom.trim() } : {}),
        ...('couleur' in payload ? { couleur: payload.couleur ?? null } : {}),
        ...('parent_id' in payload ? { parent_id: payload.parent_id ?? null } : {}),
        ...('contrat_id' in payload ? { contrat_id: payload.contrat_id ?? null } : {}),
        ...('client_id' in payload ? { client_id: payload.client_id ?? null } : {}),
      },
    });
  }

  async delete(id: string) {
    const existing = await prisma.dossiers.findUnique({ where: { id } });
    if (!existing) return false;
    await prisma.dossiers.delete({ where: { id } });
    return true;
  }
}






