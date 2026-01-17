import { prisma } from '../../core/prisma';
import type { CreatePaymentInput, PaymentsListQuery, UpdatePaymentInput } from './payment.validation';

const toDecimalString = (value: number | string) => (typeof value === 'number' ? String(value) : value);
const toDate = (value: string) => new Date(value);

export class PaymentService {
  async getAll(filters: PaymentsListQuery, organizationId: string) {
    const where: Record<string, any> = {
      organization_id: organizationId,
    };

    if (filters.type) where.type_paiement = filters.type;
    if (filters.contractId) where.contrat_id = filters.contractId;

    if (filters.from || filters.to) {
      where.date_paiement = {};
      if (filters.from) where.date_paiement.gte = toDate(filters.from);
      if (filters.to) where.date_paiement.lte = toDate(filters.to);
    }

    return prisma.paiements.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        contrats: {
          include: {
            clients: true,
            compagnies: true,
          },
        },
      },
    });
  }

  async getById(id: string, organizationId: string) {
    return prisma.paiements.findFirst({
      where: {
        id,
        organization_id: organizationId,
      },
      include: {
        contrats: {
          include: {
            clients: true,
            compagnies: true,
          },
        },
      },
    });
  }

  async create(payload: CreatePaymentInput, organizationId: string) {
    return prisma.paiements.create({
      data: {
        contrat_id: payload.contrat_id,
        type_paiement: payload.type_paiement,
        montant: toDecimalString(payload.montant),
        date_paiement: toDate(payload.date_paiement),
        mode_paiement: payload.mode_paiement,
        notes: payload.notes ?? null,
        organization_id: organizationId,
      },
      include: {
        contrats: {
          include: {
            clients: true,
            compagnies: true,
          },
        },
      },
    });
  }

  async update(id: string, payload: UpdatePaymentInput, organizationId: string) {
    const existing = await prisma.paiements.findFirst({
      where: {
        id,
        organization_id: organizationId,
      },
    });
    if (!existing) return null;

    const data: Record<string, unknown> = {};
    if (typeof payload.contrat_id === 'string') data.contrat_id = payload.contrat_id;
    if (typeof payload.type_paiement === 'string') data.type_paiement = payload.type_paiement;
    if (typeof payload.montant !== 'undefined') data.montant = toDecimalString(payload.montant);
    if (typeof payload.date_paiement === 'string') data.date_paiement = toDate(payload.date_paiement);
    if (typeof payload.mode_paiement === 'string') data.mode_paiement = payload.mode_paiement;
    if ('notes' in payload) data.notes = payload.notes ?? null;

    return prisma.paiements.update({
      where: { id },
      data,
      include: {
        contrats: {
          include: {
            clients: true,
            compagnies: true,
          },
        },
      },
    });
  }

  async delete(id: string, organizationId: string) {
    const existing = await prisma.paiements.findFirst({
      where: {
        id,
        organization_id: organizationId,
      },
    });
    if (!existing) return false;
    await prisma.paiements.delete({ where: { id } });
    return true;
  }
}








