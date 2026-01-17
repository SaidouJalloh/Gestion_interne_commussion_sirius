import { Prisma } from '@prisma/client';
import { prisma } from '../../core/prisma';
import type { CreateClientInput, UpdateClientInput } from './client.validation';

const conflictError = (message: string) => {
    const err = new Error(message) as Error & { status?: number };
    err.status = 409;
    return err;
};

export class ClientService {
    async getAll(organizationId: string) {
        return prisma.clients.findMany({
            where: { organization_id: organizationId },
            orderBy: { created_at: 'desc' },
        });
    }

    async getById(id: string, organizationId: string) {
        return prisma.clients.findFirst({
            where: {
                id,
                organization_id: organizationId,
            },
        });
    }

    async create(payload: CreateClientInput, organizationId: string) {
        try {
            return await prisma.clients.create({
                data: {
                    organization_id: organizationId,
                    nom: payload.nom.trim(),
                    prenom: payload.prenom.trim(),
                    type_client: payload.type_client.trim(),
                    email: payload.email ?? null,
                    telephone: payload.telephone ?? null,
                    adresse: payload.adresse ?? null,
                    ville: payload.ville ?? null,
                    code_postal: payload.code_postal ?? null,
                    notes: payload.notes ?? null,
                    created_by: payload.created_by ?? null,
                },
            });
        } catch (e: unknown) {
            if (
                e instanceof Prisma.PrismaClientKnownRequestError &&
                e.code === 'P2002'
            ) {
                throw conflictError("Conflit d'unicité (email déjà utilisé)");
            }
            throw e;
        }
    }

    async update(id: string, payload: UpdateClientInput, organizationId: string) {
        const existing = await prisma.clients.findFirst({
            where: {
                id,
                organization_id: organizationId,
            },
        });
        if (!existing) return null;

        try {
            return await prisma.clients.update({
                where: { id },
                data: {
                    ...(typeof payload.nom === 'string' ? { nom: payload.nom.trim() } : {}),
                    ...(typeof payload.prenom === 'string'
                        ? { prenom: payload.prenom.trim() }
                        : {}),
                    ...(typeof payload.type_client === 'string'
                        ? { type_client: payload.type_client.trim() }
                        : {}),
                    ...('email' in payload ? { email: payload.email ?? null } : {}),
                    ...('telephone' in payload
                        ? { telephone: payload.telephone ?? null }
                        : {}),
                    ...('adresse' in payload ? { adresse: payload.adresse ?? null } : {}),
                    ...('ville' in payload ? { ville: payload.ville ?? null } : {}),
                    ...('code_postal' in payload
                        ? { code_postal: payload.code_postal ?? null }
                        : {}),
                    ...('notes' in payload ? { notes: payload.notes ?? null } : {}),
                },
            });
        } catch (e: unknown) {
            if (
                e instanceof Prisma.PrismaClientKnownRequestError &&
                e.code === 'P2002'
            ) {
                throw conflictError("Conflit d'unicité (email déjà utilisé)");
            }
            throw e;
        }
    }

    async delete(id: string, organizationId: string) {
        const existing = await prisma.clients.findFirst({
            where: {
                id,
                organization_id: organizationId,
            },
        });
        if (!existing) return false;
        await prisma.clients.delete({ where: { id } });
        return true;
    }
}








