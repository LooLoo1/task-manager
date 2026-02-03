-- Add password to User
ALTER TABLE "User" ADD COLUMN "password" TEXT NOT NULL DEFAULT '';

-- Create Workspace table
CREATE TABLE "Workspace" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- Create WorkspaceMember table
CREATE TABLE "WorkspaceMember" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("id")
);

-- Create Role enum type
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add workspaceId to Project
ALTER TABLE "Project" ADD COLUMN "workspaceId" INTEGER;

-- Add workspaceId to Category
ALTER TABLE "Category" ADD COLUMN "workspaceId" INTEGER;

-- Drop unique constraint on Category name if exists
ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_name_key";

-- Create default workspace and migrate data
DO $$
DECLARE
    default_workspace_id INTEGER;
    first_user_id INTEGER;
BEGIN
    -- Get first user
    SELECT id INTO first_user_id FROM "User" LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
        -- Create default workspace
        INSERT INTO "Workspace" ("name", "updatedAt") VALUES ('Default Workspace', NOW())
        RETURNING id INTO default_workspace_id;
        
        -- Add first user as owner
        INSERT INTO "WorkspaceMember" ("userId", "workspaceId", "role")
        VALUES (first_user_id, default_workspace_id, 'OWNER');
        
        -- Update all projects
        UPDATE "Project" SET "workspaceId" = default_workspace_id WHERE "workspaceId" IS NULL;
        
        -- Update all categories
        UPDATE "Category" SET "workspaceId" = default_workspace_id WHERE "workspaceId" IS NULL;
    END IF;
END $$;

-- Make workspaceId required (after migration)
-- ALTER TABLE "Project" ALTER COLUMN "workspaceId" SET NOT NULL;
-- ALTER TABLE "Category" ALTER COLUMN "workspaceId" SET NOT NULL;

-- Add foreign keys
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_workspaceId_fkey" 
    FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Project" ADD CONSTRAINT "Project_workspaceId_fkey" 
    FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Category" ADD CONSTRAINT "Category_workspaceId_fkey" 
    FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add unique constraints
CREATE UNIQUE INDEX "WorkspaceMember_userId_workspaceId_key" ON "WorkspaceMember"("userId", "workspaceId");
CREATE UNIQUE INDEX "Category_name_workspaceId_key" ON "Category"("name", "workspaceId");
