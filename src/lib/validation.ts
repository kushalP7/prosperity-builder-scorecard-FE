import { z } from "zod";

/**
 * Generic schema validator that runs Zod safeParse and returns
 * a clean Record<string, string> map of field names to error messages.
 */
export function validateForm<T>(
  schema: z.ZodType<T>,
  data: unknown
): { isValid: boolean; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { isValid: true, errors: {} };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0]?.toString();
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }

  return { isValid: false, errors };
}

/**
 * Common Zod schema for Contact / Inquiry forms
 */
export const contactInquirySchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  organizationName: z.string().trim().min(1, "Organization or company name is required."),
  jobTitle: z.string().trim().min(1, "Job title is required."),
  businessEmail: z
    .string()
    .trim()
    .min(1, "Business email is required.")
    .email("Please enter a valid email address (e.g. name@domain.com)."),
  phoneNumber: z
    .string()
    .trim()
    .min(1, "Phone number is required.")
    .refine(
      (val) => val.replace(/\D/g, "").length >= 7,
      "Please enter a valid phone number."
    ),
  city: z.string().trim().min(1, "City is required."),
  state: z.string().trim().min(1, "State / Province is required."),
  country: z.string().trim().min(1, "Country is required."),
  organizationType: z.string().trim().min(1, "Please select an organization type."),
});
