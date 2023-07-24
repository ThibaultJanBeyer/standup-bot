ALTER TABLE "workspaces" ADD COLUMN "installation" jsonb DEFAULT '{}' NOT NULL;
ALTER TABLE "users" ADD COLUMN "email" text;
