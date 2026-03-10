import z from "zod";
import { AuditLogSchema } from "../types/audit-log.type";

export const CreateAuditLogDTO = AuditLogSchema;
export type CreateAuditLogDTO = z.infer<typeof CreateAuditLogDTO>;
