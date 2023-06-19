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

export const StandupsRelations = relations(Questions, ({ many }) => ({
	questions: many(Questions),
}));

export const QuestionsRelations = relations(Questions, ({ one }) => ({
	standupId: one(Standups, {
		fields: [Questions.standupId],
		references: [Standups.id],
	}),
}));
