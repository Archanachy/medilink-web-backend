import { PatientSchema, PatientType } from "../types/patient.type";

// DTO for creating/updating patients leverages shared schema
export const CreatePatientDTO = PatientSchema;
export type CreatePatientDTO = PatientType;