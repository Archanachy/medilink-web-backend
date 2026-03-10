import { AdminSchema, AdminType } from "../types/admin.type";

// DTO for creating/updating admins leverages shared schema
export const CreateAdminDTO = AdminSchema;
export type CreateAdminDTO = AdminType;
