import { CreatePatientDTO } from "../dtos/patient.dto";
import { PatientRepository } from "../repositories/patient.repository";
import { HttpError } from "../errors/http-error";

const patientRepo = new PatientRepository();

export class PatientService {
    async createPatient(data: CreatePatientDTO) {
        return patientRepo.createPatient(data);
    }

    async getPatientById(id: string) {
        const patient = await patientRepo.getPatientById(id);
        if (!patient) throw new HttpError(404, "Patient not found");
        return patient;
    }

    async updatePatient(id: string, data: Partial<CreatePatientDTO>) {
        const patient = await patientRepo.updatePatient(id, data);
        if (!patient) throw new HttpError(404, "Patient not found");
        return patient;
    }

    async deletePatient(id: string) {
        const ok = await patientRepo.deletePatient(id);
        if (!ok) throw new HttpError(404, "Patient not found");
        return ok;
    }
}