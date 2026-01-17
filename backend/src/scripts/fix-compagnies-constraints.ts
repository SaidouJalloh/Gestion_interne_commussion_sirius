/**
 * Script pour corriger les contraintes d'unicité des compagnies
 * 
 * Ce script supprime les anciennes contraintes uniques sur nom et sigle seuls
 * et crée les nouvelles contraintes multi-tenant (nom + organization_id, sigle + organization_id)
 * 
 * Usage:
 *   npx ts-node src/scripts/fix-compagnies-constraints.ts
 */

import { prisma } from '../core/prisma';

async function fixCompagniesConstraints() {
    console.log('🔧 Correction des contraintes d\'unicité des compagnies...\n');

    try {
        // Supprimer les anciennes contraintes uniques si elles existent
        console.log('📝 Suppression des anciennes contraintes uniques...');
        await prisma.$executeRawUnsafe(`
      ALTER TABLE "public"."compagnies" DROP CONSTRAINT IF EXISTS "compagnies_nom_key";
    `);
        await prisma.$executeRawUnsafe(`
      ALTER TABLE "public"."compagnies" DROP CONSTRAINT IF EXISTS "compagnies_sigle_key";
    `);
        console.log('✅ Anciennes contraintes supprimées\n');

        // Créer les nouvelles contraintes uniques multi-tenant si elles n'existent pas déjà
        console.log('📝 Création des nouvelles contraintes multi-tenant...');
        await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_compagnies_nom_org_unique" 
      ON "public"."compagnies"("nom", "organization_id");
    `);
        await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_compagnies_sigle_org_unique" 
      ON "public"."compagnies"("sigle", "organization_id");
    `);
        console.log('✅ Nouvelles contraintes créées avec succès !\n');

        // Vérifier que les nouvelles contraintes existent
        console.log('🔍 Vérification des contraintes...');
        const constraints = await prisma.$queryRawUnsafe<Array<{ indexname: string }>>(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'compagnies' 
      AND indexname IN (
        'idx_compagnies_nom_org_unique',
        'idx_compagnies_sigle_org_unique',
        'compagnies_nom_key',
        'compagnies_sigle_key'
      )
    `);

        console.log('📋 Contraintes trouvées:');
        constraints.forEach((c) => {
            const isNew = c.indexname.includes('_org_unique');
            console.log(`   ${isNew ? '✅' : '⚠️'} ${c.indexname}`);
        });

        const hasOldConstraints = constraints.some((c) =>
            ['compagnies_nom_key', 'compagnies_sigle_key'].includes(c.indexname),
        );
        const hasNewConstraints =
            constraints.some((c) => c.indexname === 'idx_compagnies_nom_org_unique') &&
            constraints.some((c) => c.indexname === 'idx_compagnies_sigle_org_unique');

        if (hasOldConstraints) {
            console.log(
                '\n⚠️  Les anciennes contraintes existent encore. Elles devraient être supprimées.',
            );
        }

        if (hasNewConstraints) {
            console.log('\n✅ Les nouvelles contraintes multi-tenant sont en place !');
        } else {
            console.log('\n❌ Les nouvelles contraintes n\'ont pas été créées.');
        }
    } catch (error: any) {
        console.error('❌ Erreur lors de la correction des contraintes:', error.message);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

fixCompagniesConstraints()
    .then(() => {
        console.log('\n✅ Script terminé avec succès');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Erreur:', error);
        process.exit(1);
    });
