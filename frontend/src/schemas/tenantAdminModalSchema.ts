import z from "zod";

export const tenantAdminModalSchema = z.object({
  username: z.string().min(1, 'Username is required').max(100, 'Username cannot exceed 100 characters'),
  password: z.string().max(100, 'Password cannot exceed 100 characters').optional().or(z.literal('')),
});

export type TenantAdminModalFormData = z.infer<typeof tenantAdminModalSchema>;