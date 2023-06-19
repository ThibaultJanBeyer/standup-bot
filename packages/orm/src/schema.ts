import { InferModel, relations } from "drizzle-orm";
import { jsonb, pgTable, uuid, text, primaryKey, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const DeletedRecords = pgTable("deleted_records", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  data: jsonb("data").notNull(),
  objectId: uuid("object_id").notNull(),
  tableName: text("table_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type DeletedRecord = InferModel<typeof DeletedRecords>;
export type NewDeletedRecord = InferModel<
  typeof DeletedRecords,
  "insert"
>;

export const Standups = pgTable("standups", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  name: text("name").notNull(),
  workspaceId: text("workspace_id").notNull(),
  channelId: text("channel_id").notNull(),
  scheduleCron: text("schedule_cron").notNull(),
  summaryCron: text("summary_cron").notNull(),
  // questions => relation
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Standup = InferModel<typeof Standups>;
export type NewStandup = InferModel<typeof Standups, "insert">;

export const Questions = pgTable("questions", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  standupId: uuid("standup_id").notNull(),
  questionText: text("question_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Question = InferModel<typeof Questions>;
export type NewQuestion = InferModel<typeof Questions, "insert">;

export const StandupsRelations = relations(Standups, ({ many }) => ({
	questions: many(Questions),
	members: many(Users),
}));

export const QuestionsRelations = relations(Questions, ({ one }) => ({
	standupId: one(Standups, {
		fields: [Questions.standupId],
		references: [Standups.id],
	}),
}));

export const Workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  workspaceId: text("workspace_id").notNull(),
  botToken: text("bot_token").notNull(),
  appToken: text("app_token").notNull(),
  // members => relation
  // standups => relation
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Workspace = InferModel<typeof Workspaces>;
export type NewWorkspace = InferModel<typeof Workspaces, "insert">;

export const WorkspaceRelations = relations(Workspaces, ({ many }) => ({
	standups: many(Standups),
	members: many(Users),
}));

export const Users = pgTable("users", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  // relation
  workspace: uuid("workspace").notNull(),
  slackId: text("slack_id").notNull(),
  clerkId: text("clerk_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = InferModel<typeof Users>;
export type NewUser = InferModel<typeof Users, "insert">;

export const UsersRelations = relations(Users, ({ one, many }) => ({
  workspace: one(Workspaces, {
		fields: [Users.workspace],
		references: [Workspaces.id],
	}),
  standups: many(Standups),
}));
