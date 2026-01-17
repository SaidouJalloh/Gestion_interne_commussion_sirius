/**
 * Script de migration pour transformer l'application mono-tenant en multi-tenant
 * 
 * Ce script:
 * 1. Crée une organisation par défaut "Legacy Organization"
 * 2. Assigne tous les utilisateurs existants à cette organisation (rôle: owner)
 * 3. Met à jour tous les enregistrements existants avec organization_id de l'organisation par défaut
 * 
 * Usage:
 *   npx ts-node src/scripts/migrate-to-multitenant.ts
 */

import { prisma } from '../core/prisma';

async function migrateToMultiTenant() {
  console.log('🚀 Début de la migration vers multi-tenant...\n');

  try {
    // 1. Créer l'organisation par défaut
    console.log('📦 Création de l\'organisation par défaut...');
    const legacySlug = 'legacy-organization';
    const legacyOrg =
      (await prisma.organizations.findUnique({ where: { slug: legacySlug } })) ??
      (await prisma.organizations.create({
        data: {
          name: 'Legacy Organization',
          slug: legacySlug,
          settings: {},
        },
      }));
    console.log(`✅ Organisation créée: ${legacyOrg.id} (${legacyOrg.name})\n`);

    // 2. Récupérer tous les utilisateurs existants
    console.log('👥 Récupération des utilisateurs existants...');

    // Récupérer tous les utilisateurs depuis la table profiles
    const allProfiles = await prisma.profiles.findMany({
      select: { id: true },
    });
    const profileUserIds = allProfiles.map((p) => p.id);

    // Récupérer aussi les utilisateurs qui ont créé des données (pour être exhaustif)
    type UserIdRow = { created_by: string };
    const createdByUsers = await prisma.$queryRawUnsafe<UserIdRow[]>(`
      SELECT DISTINCT created_by 
      FROM public.clients 
      WHERE created_by IS NOT NULL
      UNION
      SELECT DISTINCT created_by 
      FROM public.compagnies 
      WHERE created_by IS NOT NULL
      UNION
      SELECT DISTINCT created_by 
      FROM public.medias 
      WHERE created_by IS NOT NULL
      UNION
      SELECT DISTINCT created_by 
      FROM public.incorporations 
      WHERE created_by IS NOT NULL
      UNION
      SELECT DISTINCT created_by 
      FROM public.sinistres 
      WHERE created_by IS NOT NULL
    `);

    // Combiner tous les user_ids
    const userIds: string[] = [...profileUserIds];
    for (const row of createdByUsers) {
      if (row.created_by) {
        userIds.push(row.created_by);
      }
    }
    const uniqueUserIds = Array.from(new Set(userIds));

    console.log(`📋 ${uniqueUserIds.length} utilisateurs uniques trouvés`);
    console.log(`   - Depuis profiles: ${profileUserIds.length}`);
    console.log(`   - Depuis autres tables: ${createdByUsers.length}\n`);

    // 3. Assigner tous les utilisateurs à l'organisation par défaut
    console.log('🔗 Assignation des utilisateurs à l\'organisation...');
    let assignedCount = 0;
    let alreadyMemberCount = 0;
    let errorCount = 0;

    for (const userId of uniqueUserIds) {
      try {
        await prisma.organization_members.create({
          data: {
            organization_id: legacyOrg.id,
            user_id: userId,
            role: 'owner',
            status: 'active',
            joined_at: new Date(),
          },
        });
        assignedCount++;
        console.log(`  ✓ Utilisateur ${userId} assigné`);
      } catch (error: any) {
        if (error.code === 'P2002') {
          // Déjà membre, on continue
          alreadyMemberCount++;
          console.log(`  ⊙ Utilisateur ${userId} déjà membre`);
        } else {
          errorCount++;
          console.error(`  ✗ Erreur pour ${userId}:`, error.message);
        }
      }
    }
    console.log(`\n📊 Résumé assignation:`);
    console.log(`   - Nouveaux membres ajoutés: ${assignedCount}`);
    console.log(`   - Déjà membres: ${alreadyMemberCount}`);
    console.log(`   - Erreurs: ${errorCount}\n`);

    // 4. Mettre à jour tous les enregistrements existants avec organization_id
    console.log('🔄 Mise à jour des enregistrements existants...\n');

    // Clients
    console.log('  → Mise à jour des clients...');
    const clientsUpdated = await prisma.$executeRaw`
      UPDATE public.clients 
      SET organization_id = ${legacyOrg.id}::uuid
      WHERE organization_id IS NULL
    `;
    console.log(`    ✓ ${clientsUpdated} clients mis à jour`);

    // Compagnies
    console.log('  → Mise à jour des compagnies...');
    const compagniesUpdated = await prisma.$executeRaw`
      UPDATE public.compagnies 
      SET organization_id = ${legacyOrg.id}::uuid
      WHERE organization_id IS NULL
    `;
    console.log(`    ✓ ${compagniesUpdated} compagnies mises à jour`);

    // Contrats
    console.log('  → Mise à jour des contrats...');
    const contratsUpdated = await prisma.$executeRaw`
      UPDATE public.contrats 
      SET organization_id = ${legacyOrg.id}::uuid
      WHERE organization_id IS NULL
    `;
    console.log(`    ✓ ${contratsUpdated} contrats mis à jour`);

    // Dossiers
    console.log('  → Mise à jour des dossiers...');
    const dossiersUpdated = await prisma.$executeRaw`
      UPDATE public.dossiers 
      SET organization_id = ${legacyOrg.id}::uuid
      WHERE organization_id IS NULL
    `;
    console.log(`    ✓ ${dossiersUpdated} dossiers mis à jour`);

    // Incorporations
    console.log('  → Mise à jour des incorporations...');
    const incorporationsUpdated = await prisma.$executeRaw`
      UPDATE public.incorporations 
      SET organization_id = ${legacyOrg.id}::uuid
      WHERE organization_id IS NULL
    `;
    console.log(`    ✓ ${incorporationsUpdated} incorporations mises à jour`);

    // Medias
    console.log('  → Mise à jour des médias...');
    const mediasUpdated = await prisma.$executeRaw`
      UPDATE public.medias 
      SET organization_id = ${legacyOrg.id}::uuid
      WHERE organization_id IS NULL
    `;
    console.log(`    ✓ ${mediasUpdated} médias mis à jour`);

    // Notifications
    console.log('  → Mise à jour des notifications...');
    const notificationsUpdated = await prisma.$executeRaw`
      UPDATE public.notifications 
      SET organization_id = ${legacyOrg.id}::uuid
      WHERE organization_id IS NULL
    `;
    console.log(`    ✓ ${notificationsUpdated} notifications mises à jour`);

    // Paiements
    console.log('  → Mise à jour des paiements...');
    const paiementsUpdated = await prisma.$executeRaw`
      UPDATE public.paiements 
      SET organization_id = ${legacyOrg.id}::uuid
      WHERE organization_id IS NULL
    `;
    console.log(`    ✓ ${paiementsUpdated} paiements mis à jour`);

    // Partages
    console.log('  → Mise à jour des partages...');
    const partagesUpdated = await prisma.$executeRaw`
      UPDATE public.partages 
      SET organization_id = ${legacyOrg.id}::uuid
      WHERE organization_id IS NULL
    `;
    console.log(`    ✓ ${partagesUpdated} partages mis à jour`);

    // Sinistres
    console.log('  → Mise à jour des sinistres...');
    const sinistresUpdated = await prisma.$executeRaw`
      UPDATE public.sinistres 
      SET organization_id = ${legacyOrg.id}::uuid
      WHERE organization_id IS NULL
    `;
    console.log(`    ✓ ${sinistresUpdated} sinistres mis à jour`);

    // Vehicules
    console.log('  → Mise à jour des véhicules...');
    const vehiculesUpdated = await prisma.$executeRaw`
      UPDATE public.vehicules 
      SET organization_id = ${legacyOrg.id}::uuid
      WHERE organization_id IS NULL
    `;
    console.log(`    ✓ ${vehiculesUpdated} véhicules mis à jour`);

    console.log('\n✅ Migration terminée avec succès!');
    console.log(`\n📊 Résumé complet:`);
    console.log(`   - Organisation créée: ${legacyOrg.name} (${legacyOrg.id})`);
    console.log(`   - Utilisateurs trouvés: ${uniqueUserIds.length}`);
    console.log(`   - Membres assignés à l'organisation: ${assignedCount + alreadyMemberCount}`);
    console.log(`   - Enregistrements migrés:`);
    console.log(`     • Clients: ${clientsUpdated}`);
    console.log(`     • Compagnies: ${compagniesUpdated}`);
    console.log(`     • Contrats: ${contratsUpdated}`);
    console.log(`     • Dossiers: ${dossiersUpdated}`);
    console.log(`     • Incorporations: ${incorporationsUpdated}`);
    console.log(`     • Médias: ${mediasUpdated}`);
    console.log(`     • Notifications: ${notificationsUpdated}`);
    console.log(`     • Paiements: ${paiementsUpdated}`);
    console.log(`     • Partages: ${partagesUpdated}`);
    console.log(`     • Sinistres: ${sinistresUpdated}`);
    console.log(`     • Véhicules: ${vehiculesUpdated}`);
  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  migrateToMultiTenant()
    .then(() => {
      console.log('\n✨ Script terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Erreur fatale:', error);
      process.exit(1);
    });
}

export { migrateToMultiTenant };
