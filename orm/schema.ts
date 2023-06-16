import { InferModel, relations } from "drizzle-orm";
import { jsonb, pgTable, uuid, text, primaryKey, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
 
export const UsersTable = pgTable('users', {
  id: uuid("id").defaultRandom().notNull(),
  fullName: text('full_name'),
  email: text('email'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (users) => {
  return {
    pk: primaryKey(users.id, users.email),
    uniqueIdx: uniqueIndex("unique_idx").on(users.email),
  };
});

export type User = InferModel<typeof UsersTable>;
export type NewUser = InferModel<typeof UsersTable, "insert">;

export const DeletedRecordsTable = pgTable("deleted_records", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  data: jsonb("data").notNull(),
  objectId: uuid("object_id").notNull(),
  tableName: text("table_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type DeletedRecords = InferModel<typeof DeletedRecordsTable>;
export type NewDeletedRecords = InferModel<
  typeof DeletedRecordsTable,
  "insert"
>;

export const StandupTable = pgTable("standup", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  workspaceId: text("workspace_id").notNull(),
  channelId: text("channel_id").notNull(),
  scheduleCron: text("schedule_cron").notNull(),
  summaryCron: text("summary_cron").notNull(),
  // questions => relation
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Standup = InferModel<typeof StandupTable>;
export type NewStandup = InferModel<typeof StandupTable, "insert">;

export const QuestionsTable = pgTable("question", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  standupId: uuid("standup_id").notNull(),
  question: text("question").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const StandupTableRelations = relations(QuestionsTable, ({ many }) => ({
	questions: many(QuestionsTable),
}));

export const QuestionsTableRelations = relations(QuestionsTable, ({ one }) => ({
	standupId: one(StandupTable, {
		fields: [QuestionsTable.standupId],
		references: [StandupTable.id],
	}),
}));
