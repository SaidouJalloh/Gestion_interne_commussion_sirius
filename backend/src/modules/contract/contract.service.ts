import { prisma } from '../../core/prisma';

export class ContractService {
  async getAll() {
    const contrats = await prisma.contrats.findMany({
      include: {
        clients: true,
        compagnies: true,
        vehicules: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return contrats;
  }

  async getById(id: string) {
    return prisma.contrats.findUnique({
      where: { id },
      include: {
        clients: true,
        compagnies: true,
        vehicules: true,
      },
    });
  }

  async create(payload: any) {
    return prisma.contrats.create({
      data: payload,
      include: {
        clients: true,
        compagnies: true,
        vehicules: true,
      },
    });
  }

  async update(id: string, payload: any) {
    const existing = await prisma.contrats.findUnique({ where: { id } });
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

  async delete(id: string) {
    const existing = await prisma.contrats.findUnique({ where: { id } });
    if (!existing) return false;
    await prisma.contrats.delete({ where: { id } });
    return true;
  }
}


