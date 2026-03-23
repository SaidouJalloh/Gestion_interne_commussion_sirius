import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTriggers() {
  try {
    const triggers = await prisma.$queryRaw`
      SELECT 
        event_object_schema as schema_name,
        event_object_table as table_name,
        trigger_name,
        action_statement
      FROM information_schema.triggers
      WHERE event_object_schema = 'auth' AND event_object_table = 'users';
    `;
    console.log("Triggers on auth.users:");
    console.log(JSON.stringify(triggers, null, 2));

    const functions = await prisma.$queryRaw`
      SELECT proname, prosrc 
      FROM pg_proc 
      WHERE proname LIKE '%user%' OR proname LIKE '%profile%';
    `;
    console.log("\nRelevant Functions:");
    const relevantFuncs = (functions as any[]).filter(f => f.proname === 'handle_new_user' || f.proname === 'create_profile_for_user');
    console.log(JSON.stringify(relevantFuncs, null, 2));

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTriggers();
