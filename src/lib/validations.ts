import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100),
  email: z
    .string()
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .optional(),
  subject: z
    .string()
    .max(200)
    .optional(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000),
  source_page: z
    .string()
    .optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
