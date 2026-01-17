import { prisma } from '../../core/prisma';

export class ContractService {
  async getAll(organizationId: string) {
    const contrats = await prisma.contrats.findMany({
      where: { organization_id: organizationId },
      include: {
        clients: true,
        compagnies: true,
        vehicules: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return contrats;
  }

  async getById(id: string, organizationId: string) {
    return prisma.contrats.findFirst({
      where: {
        id,
        organization_id: organizationId,
      },
      include: {
        clients: true,
        compagnies: true,
        vehicules: true,
      },
    });
  }

  async create(payload: any, organizationId: string) {
    return prisma.contrats.create({
      data: {
        ...payload,
        organization_id: organizationId,
      },
      include: {
        clients: true,
        compagnies: true,
        vehicules: true,
      },
    });
  }

  async update(id: string, payload: any, organizationId: string) {
    const existing = await prisma.contrats.findFirst({
      where: {
        id,
        organization_id: organizationId,
      },
    });
    if (!existing) return null;

    return prisma.contrats.update({
      where: { id },
      data: payload,
      include: {
        clients: true,
        compagnies: true,
        vehicules: true,
      },
    });
  }

  async delete(id: string, organizationId: string) {
    const existing = await prisma.contrats.findFirst({
      where: {
        id,
        organization_id: organizationId,
      },
    });
    if (!existing) return false;
    await prisma.contrats.delete({ where: { id } });
    return true;
  }
}


