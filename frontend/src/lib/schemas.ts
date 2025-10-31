import { z } from "zod";

// Basic validation schemas for frontend forms
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertUserSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(50, "Name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Full Name must contain only alphabets")
    .refine((val) => !/^\d+$/.test(val), {
      message: "Full Name must contain only alphabets",
    })
    .refine((val) => !/[!@#$%^&*(),.?":{}|<>]/.test(val), {
      message: "Full Name cannot contain special characters",
    }),
  email: z.string()
    .email("Invalid email address")
    .max(100, "Email cannot exceed 100 characters"),
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number cannot exceed 15 digits")
    .regex(/^\d+$/, "Enter valid phone number")
    .optional(),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password cannot exceed 50 characters")
    .refine((val) => !/\s/.test(val), {
      message: "Password cannot contain spaces",
    })
    .refine((val) => /[a-zA-Z]/.test(val) && /\d/.test(val) && /[!@#$%^&*(),.?":{}|<>]/.test(val), {
      message: "Weak password – use mix of characters, numbers, and symbols",
    }),
  role: z.enum(["customer", "salon_owner"]).default("customer"),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export const insertSalonSchema = z.object({
  name: z.string().min(1, "Salon name is required"),
  description: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  type: z.enum(["men", "women", "unisex"]).default("unisex"),
  operatingHours: z.object({
    monday: z.object({ open: z.string(), close: z.string() }).optional(),
    tuesday: z.object({ open: z.string(), close: z.string() }).optional(),
    wednesday: z.object({ open: z.string(), close: z.string() }).optional(),
    thursday: z.object({ open: z.string(), close: z.string() }).optional(),
    friday: z.object({ open: z.string(), close: z.string() }).optional(),
    saturday: z.object({ open: z.string(), close: z.string() }).optional(),
    sunday: z.object({ open: z.string(), close: z.string() }).optional(),
  }).optional(),
  images: z.array(z.string()).default([]),
});

export const insertServiceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  price: z.string().min(1, "Price is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const insertOfferSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  discount: z.number().min(1, "Discount must be at least 1"),
  validityPeriod: z.union([
    z.string().datetime().transform((str) => new Date(str)),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/).transform((str) => new Date(str)),
    z.date()
  ]),
  isActive: z.boolean().default(true),
});

export const insertReviewSchema = z.object({
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  comment: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type UserFormData = z.infer<typeof insertUserSchema>;
export type SalonFormData = z.infer<typeof insertSalonSchema>;
export type ServiceFormData = z.infer<typeof insertServiceSchema>;
export type OfferFormData = z.infer<typeof insertOfferSchema>;
export type ReviewFormData = z.infer<typeof insertReviewSchema>;
