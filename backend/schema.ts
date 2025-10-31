import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ---------------- USERS ----------------
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name"),
  email: text("email").unique(),
  phone: text("phone").unique(),
  password: text("password"),
  role: text("role").notNull().default("customer"),
  location: text("location"),
  bio: text("bio"),
  profileImage: text("profile_image"),
  loyaltyPoints: integer("loyalty_points").notNull().default(0),
  salonLoyaltyPoints: jsonb("salon_loyalty_points").$type<Record<string, number>>().default({}),
  favoriteSalons: jsonb("favorite_salons").$type<string[]>().default([]),
  // OTP and verification fields
  phoneOTP: text("phone_otp"),
  emailOTP: text("email_otp"),
  otpExpiry: timestamp("otp_expiry"),
  phoneVerified: boolean("phone_verified").default(false),
  emailVerified: boolean("email_verified").default(false),
  isVerified: boolean("is_verified").default(false),
  // Account security fields
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  accountLockedUntil: timestamp("account_locked_until"),
  // Password reset fields
  passwordResetToken: text("password_reset_token"),
  passwordResetExpiry: timestamp("password_reset_expiry"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// ---------------- SALONS ----------------
export const salons = pgTable("salons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  manualLocation: text("manual_location").default(""),
  type: text("type", { enum: ["men", "women", "unisex"] }).notNull().default("unisex"),
  operatingHours: jsonb("operating_hours").$type<{
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  }>(),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  images: jsonb("images").$type<string[]>().default([]),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// ---------------- SERVICES ----------------
export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  salonId: varchar("salon_id").notNull().references(() => salons.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  duration: integer("duration").notNull(), // in minutes
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// ---------------- QUEUES ----------------
export const queues = pgTable("queues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  salonId: varchar("salon_id").notNull().references(() => salons.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  serviceIds: jsonb("service_ids").$type<string[]>().notNull(), // Multiple services
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(), // Total price for all services
  appliedOffers: jsonb("applied_offers").$type<string[]>().default([]), // Applied offer IDs
  status: text("status", { 
    enum: ["waiting", "notified", "pending_verification", "nearby", "in-progress", "completed", "no-show"] 
  }).notNull().default("waiting"),
  position: integer("position").notNull(),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
  estimatedWaitTime: integer("estimated_wait_time"), // in minutes
  // New fields for queue management
  notifiedAt: timestamp("notified_at"),
  notificationMinutes: integer("notification_minutes"),
  checkInAttemptedAt: timestamp("check_in_attempted_at"),
  checkInLocation: jsonb("check_in_location").$type<{
    latitude: number;
    longitude: number;
    accuracy?: number;
  }>(),
  checkInDistance: integer("check_in_distance"), // meters
  verifiedAt: timestamp("verified_at"),
  verificationMethod: text("verification_method", { enum: ["gps_auto", "manual", "admin_override"] }),
  verifiedBy: varchar("verified_by"),
  serviceStartedAt: timestamp("service_started_at"),
  serviceCompletedAt: timestamp("service_completed_at"),
  noShowMarkedAt: timestamp("no_show_marked_at"),
  noShowReason: text("no_show_reason"),
});

// ---------------- OFFERS ----------------
// Commented out Drizzle schema since app uses MongoDB
// export const offers = pgTable("offers", {
//   id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
//   salonId: varchar("salon_id").notNull().references(() => salons.id, { onDelete: "cascade" }),
//   title: text("title").notNull(),
//   description: text("description").notNull(),
//   discount: integer("discount").notNull(), // ✅ fixed: integer not decimal
//   validityPeriod: timestamp("validity_period").notNull(),
//   isActive: boolean("is_active").notNull().default(true),
//   createdAt: timestamp("created_at").notNull().default(sql`now()`),
// });

// ---------------- REVIEWS ----------------
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  salonId: varchar("salon_id").notNull().references(() => salons.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// ---------------- INSERT SCHEMAS ----------------
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  loyaltyPoints: true,
  phoneOTP: true,
  emailOTP: true,
  otpExpiry: true,
  phoneVerified: true,
  emailVerified: true,
  isVerified: true,
  createdAt: true,
}).extend({
  name: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  password: z.string().optional().nullable(),
  role: z.enum(["customer", "salon_owner", "super_admin"]).default("customer"),
});

export const insertSalonSchema = createInsertSchema(salons, {
  latitude: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  longitude: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
}).omit({
  id: true,
  rating: true,
  createdAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

export const insertQueueSchema = createInsertSchema(queues).omit({
  id: true,
  position: true,
  timestamp: true,
}).extend({
  // Allow totalPrice to be either number or string, but keep as number
  totalPrice: z.union([
    z.number(),
    z.string().transform(s => parseFloat(s))
  ])
});

// Pure Zod schema for offers (MongoDB compatible)
export const insertOfferSchema = z.object({
  salonId: z.string().min(1, "Salon ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  discount: z.number().min(1, "Discount must be at least 1"),
  validityPeriod: z.union([
    z.string().datetime().transform((str) => new Date(str)), // Handle ISO datetime strings
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/).transform((str) => new Date(str)), // Handle YYYY-MM-DD format
    z.date()
  ]),
  isActive: z.boolean().default(true),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

// ---------------- LOGIN ----------------
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// ---------------- TYPES ----------------
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSalon = z.infer<typeof insertSalonSchema>;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type InsertQueue = z.infer<typeof insertQueueSchema>;
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Login = z.infer<typeof loginSchema>;

export type User = typeof users.$inferSelect;
export type Salon = typeof salons.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Queue = typeof queues.$inferSelect;
// MongoDB-compatible Offer type
export type Offer = {
  id: string;
  salonId: string;
  title: string;
  description: string;
  discount: number;
  validityPeriod: Date;
  isActive: boolean;
  createdAt: Date;
};
export type Review = typeof reviews.$inferSelect;

// ---------------- SALON PHOTOS ----------------
export const salonPhotos = pgTable("salon_photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  salonId: varchar("salon_id").notNull().references(() => salons.id, { onDelete: "cascade" }),
  url: varchar("url").notNull(),
  publicId: varchar("public_id").notNull(), // Cloudinary public_id for deletion
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertSalonPhotoSchema = createInsertSchema(salonPhotos).omit({
  id: true,
  createdAt: true,
});

export type InsertSalonPhoto = z.infer<typeof insertSalonPhotoSchema>;
export type SalonPhoto = typeof salonPhotos.$inferSelect;

// ---------------- QUEUE MANAGEMENT TYPES ----------------

// Trust levels for reputation system
export type TrustLevel = 'new' | 'regular' | 'trusted' | 'suspicious' | 'banned';

// Queue status type
export type QueueStatus = 'waiting' | 'notified' | 'pending_verification' | 'nearby' | 'in-progress' | 'completed' | 'no-show';

// Verification method type
export type VerificationMethod = 'gps_auto' | 'manual' | 'admin_override';

// Notification type
export type NotificationType = 'queue_notification' | 'arrival_verified' | 'service_starting' | 'service_completed' | 'no_show' | 'position_update';

// User Reputation (MongoDB)
export type UserReputation = {
  id: string;
  userId: string;
  totalCheckIns: number;
  successfulCheckIns: number;
  falseCheckIns: number;
  noShows: number;
  completedServices: number;
  reputationScore: number; // 0-100
  trustLevel: TrustLevel;
  lastCheckInAt?: Date;
  lastNoShowAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

// Check-In Log (MongoDB)
export type CheckInLog = {
  id: string;
  userId: string;
  queueId: string;
  salonId: string;
  timestamp: Date;
  userLocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  salonLocation: {
    latitude: number;
    longitude: number;
  };
  distance?: number; // meters
  method: VerificationMethod;
  autoApproved: boolean;
  requiresConfirmation: boolean;
  verifiedBy?: string; // admin user ID
  success: boolean;
  reason?: string;
  suspicious: boolean;
  suspiciousReasons?: string[];
  timeSinceNotification?: number; // milliseconds
};

// Notification Log (MongoDB)
export type NotificationLog = {
  id: string;
  userId: string;
  queueId: string;
  salonId: string;
  timestamp: Date;
  type: NotificationType;
  title: string;
  body: string;
  channels: {
    whatsapp: {
      sent: boolean;
      sentAt?: Date;
      error?: string;
    };
    websocket: {
      sent: boolean;
      sentAt?: Date;
      delivered: boolean;
    };
    push?: {
      sent: boolean;
      sentAt?: Date;
      error?: string;
    };
  };
  viewed: boolean;
  viewedAt?: Date;
  actionTaken?: string;
  actionTakenAt?: Date;
};
