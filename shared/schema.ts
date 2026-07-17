import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructions: text("instructions").notNull(),
  difficulty: varchar("difficulty", { enum: ["iniciante", "intermediario", "avancado"] }).notNull().default("iniciante"),
  category: varchar("category", { enum: ["html", "css", "javascript"] }).notNull(),
  points: integer("points").notNull().default(10),
  order: integer("order").notNull(),
  initialCode: jsonb("initial_code").$type<{ html: string; css: string; javascript: string }>().notNull().default({ html: "", css: "", javascript: "" }),
  starterTemplate: jsonb("starter_template").$type<{ html: string; css: string; javascript: string }>().notNull().default({ 
    html: "<!DOCTYPE html>\n<html>\n<head>\n  <title>Exercise</title>\n</head>\n<body>\n  <!-- Write your code here -->\n</body>\n</html>", 
    css: "/* Add your styles here */", 
    javascript: "// Add your JavaScript here" 
  }),
  solutionCode: jsonb("solution_code").$type<{ html: string; css: string; javascript: string }>().notNull(),
  hints: jsonb("hints").$type<string[]>().notNull().default([]),
  validationRules: jsonb("validation_rules").$type<{ type: string; rule: string; message: string; count?: number }[]>().notNull().default([]),
  tests: jsonb("tests").$type<string[]>().notNull().default([]),
});

export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  exerciseId: varchar("exercise_id").notNull().references(() => exercises.id),
  completed: boolean("completed").notNull().default(false),
  userCode: jsonb("user_code").$type<{ html: string; css: string; javascript: string }>().notNull().default({ html: "", css: "", javascript: "" }),
  attempts: integer("attempts").notNull().default(0),
  pointsEarned: integer("points_earned").notNull().default(0),
  completedAt: text("completed_at"),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  totalPoints: integer("total_points").notNull().default(0),
  completedExercises: integer("completed_exercises").notNull().default(0),
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const updateCodeSchema = z.object({
  exerciseId: z.string(),
  userCode: z.object({
    html: z.string(),
    css: z.string(),
    javascript: z.string(),
  }),
});

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateCode = z.infer<typeof updateCodeSchema>;
