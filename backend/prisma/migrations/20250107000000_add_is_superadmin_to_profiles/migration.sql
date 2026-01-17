-- Add is_superadmin column to profiles table
ALTER TABLE "public"."profiles" 
ADD COLUMN "is_superadmin" BOOLEAN DEFAULT false;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS "idx_profiles_is_superadmin" ON "public"."profiles"("is_superadmin");
