import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  address: text("address"),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Credit Cards table
export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  cardNumber: text("card_number").notNull(),
  cardholderName: text("cardholder_name").notNull(),
  expiryDate: text("expiry_date").notNull(),
  cvv: text("cvv").notNull(),
  cardType: text("card_type").notNull(), // visa, mastercard, etc.
  isDefault: boolean("is_default").default(false),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // credit, debit
  description: text("description").notNull(),
  category: text("category").notNull(), // payment, transfer, bill, etc.
  recipientName: text("recipient_name"),
  status: text("status").notNull(), // completed, processing, failed
  date: timestamp("date").defaultNow().notNull(),
  paymentMethod: text("payment_method"), // card, qr, etc.
  cardId: integer("card_id").references(() => cards.id),
});

// QR Code Payments
export const qrCodes = pgTable("qr_codes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  qrString: text("qr_string").notNull().unique(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Contact list for quick payments
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  contactUserId: integer("contact_user_id").notNull().references(() => users.id),
  lastPaid: timestamp("last_paid"),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  address: true,
});

export const insertCardSchema = createInsertSchema(cards).pick({
  userId: true,
  cardNumber: true,
  cardholderName: true,
  expiryDate: true,
  cvv: true,
  cardType: true,
  isDefault: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  amount: true,
  type: true,
  description: true,
  category: true,
  recipientName: true,
  status: true,
  paymentMethod: true,
  cardId: true,
});

export const insertQrCodeSchema = createInsertSchema(qrCodes).pick({
  userId: true,
  qrString: true,
  active: true,
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  userId: true,
  contactUserId: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Card = typeof cards.$inferSelect;
export type InsertCard = z.infer<typeof insertCardSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type QrCode = typeof qrCodes.$inferSelect;
export type InsertQrCode = z.infer<typeof insertQrCodeSchema>;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  recaptchaToken: z.string().optional(), // Optional captcha token
});

export type LoginCredentials = z.infer<typeof loginSchema>;
