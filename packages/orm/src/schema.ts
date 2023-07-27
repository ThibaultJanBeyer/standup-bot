import { type Installation } from "@slack/bolt";
import { InferModel, relations } from "drizzle-orm";
import {
  customType,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const textArray = customType<{ data: string[] }>({
  dataType() {
    return "text[]";
  },
});

export const DeletedRecords = pgTable("deleted_records", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  data: jsonb("data").notNull(),
  objectId: uuid("object_id").notNull(),
  tableName: text("table_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type DeletedRecord = InferModel<typeof DeletedRecords>;
export type NewDeletedRecord = InferModel<typeof DeletedRecords, "insert">;

export const Standups = pgTable("standups", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  name: text("name").notNull(),
  slackWorkspaceId: text("slack_workspace_id").notNull(),
  channelId: text("channel_id").notNull(),
  scheduleCron: text("schedule_cron").notNull(),
  summaryCron: text("summary_cron").notNull(),
  authorId: uuid("author_id").notNull(),
  members: textArray("members").notNull(),
  questions: textArray("questions").notNull(),
  // author => relation
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const StandupsRelations = relations(Standups, ({ many, one }) => ({
  author: one(Users, {
    fields: [Standups.authorId],
    references: [Users.id],
  }),
  workspace: one(Workspaces, {
    fields: [Standups.slackWorkspaceId],
    references: [Workspaces.slackWorkspaceId],
  }),
}));

export type Standup = InferModel<typeof Standups>;
export type NewStandup = InferModel<typeof Standups, "insert">;

export const Workspaces = pgTable(
  "workspaces",
  {
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    slackWorkspaceId: text("slack_workspace_id").notNull().unique(),
    botToken: text("bot_token").notNull(),
    installation: jsonb("installation").notNull(),
    // members => relation
    // standups => relation
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (workspaces) => {
    return {
      uniqueIdx: uniqueIndex("unique_idx").on(workspaces.slackWorkspaceId),
    };
  },
);

export type Workspace = InferModel<typeof Workspaces> & {
  installation: Installation<"v1" | "v2", boolean>;
};
export type NewWorkspace = InferModel<typeof Workspaces, "insert">;

export const WorkspaceRelations = relations(Workspaces, ({ many }) => ({
  standups: many(Standups),
  members: many(Users),
}));

export const Users = pgTable("users", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  slackId: text("slack_id").unique(),
  slackName: text("slack_name"),
  email: text("email"),
  slackWorkspaceId: text("slack_workspace_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = InferModel<typeof Users>;
export type NewUser = InferModel<typeof Users, "insert">;

export const UsersRelations = relations(Users, ({ many, one }) => ({
  standups: many(Standups),
  workspace: one(Workspaces, {
    fields: [Users.slackWorkspaceId],
    references: [Workspaces.slackWorkspaceId],
  }),
}));
