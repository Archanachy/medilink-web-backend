import z from "zod";

export const AppointmentSchema = z.object({
    patientId: z.string(),
    doctorId: z.string(),
    appointmentDate: z.string().datetime(),
    duration: z.number().optional().default(30), // in minutes
    status: z.enum(["scheduled", "completed", "cancelled", "no-show"]).default("scheduled"),
    notes: z.string().optional().default(""),
    consultationType: z.enum(["in-person", "online"]).default("in-person"),
});

export type AppointmentType = z.infer<typeof AppointmentSchema>;
