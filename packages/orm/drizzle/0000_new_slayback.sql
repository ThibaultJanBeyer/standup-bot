CREATE TABLE IF NOT EXISTS "deleted_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"data" jsonb NOT NULL,
	"object_id" uuid NOT NULL,
	"table_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "standups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slack_workspace_id" text NOT NULL,
	"channel_id" text NOT NULL,
	"schedule_cron" text NOT NULL,
	"summary_cron" text NOT NULL,
	"author_id" uuid NOT NULL,
	"members" text[] NOT NULL,
	"questions" text[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slack_id" text UNIQUE,
	"slack_name" text,
	"email" text,
	"slack_workspace_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_slack_id_unique" UNIQUE("slack_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slack_workspace_id" text NOT NULL UNIQUE,
	"bot_token" text NOT NULL,
	"installation" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "workspaces_slack_workspace_id_unique" UNIQUE("slack_workspace_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_idx" ON "workspaces" ("slack_workspace_id");

-- BASE FUNCTIONS
--> Create a timestamp function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--> record deletion function
CREATE FUNCTION deleted_record_insert() RETURNS trigger
    LANGUAGE plpgsql
AS $$
    BEGIN
        EXECUTE 'INSERT INTO deleted_records (data, object_id, table_name) VALUES ($1, $2, $3)'
        USING to_jsonb(OLD.*), OLD.id, TG_TABLE_NAME;

        RETURN OLD;
    END;
$$;

--> Apply Functions
CREATE TRIGGER set_timestamp BEFORE UPDATE ON standups 
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp BEFORE UPDATE ON deleted_records 
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp BEFORE UPDATE ON users 
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp BEFORE UPDATE ON workspaces 
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER deleted_record_insert AFTER DELETE ON workspaces
FOR EACH ROW EXECUTE FUNCTION deleted_record_insert();

CREATE TRIGGER deleted_record_insert AFTER DELETE ON users
FOR EACH ROW EXECUTE FUNCTION deleted_record_insert();

CREATE TRIGGER deleted_record_insert AFTER DELETE ON standups
FOR EACH ROW EXECUTE FUNCTION deleted_record_insert();
