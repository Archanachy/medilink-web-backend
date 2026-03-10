import { CreateDoctorDTO, UpdateDoctorDTO } from "../dtos/doctor.dto";
import { DoctorRepository } from "../repositories/doctor.repository";
import { HttpError } from "../errors/http-error";

const doctorRepo = new DoctorRepository();

export class DoctorService {
    async createDoctor(data: CreateDoctorDTO) {
        // Check if license number is already in use
        if (data.licenseNumber) {
            const doctors = await doctorRepo.getAllDoctors({ page: 1, limit: 1000 });
            const duplicate = doctors.data.find((d) => d.licenseNumber === data.licenseNumber);
            if (duplicate) {
                throw new HttpError(409, "License number already in use");
            }
        }

        return doctorRepo.createDoctor(data);
    }

    async getDoctorById(id: string) {
        const doctor = await doctorRepo.getDoctorById(id);
        if (!doctor) throw new HttpError(404, "Doctor not found");
        return doctor;
    }

    async getDoctorsBySpecialization(specialization: string) {
        if (!specialization || specialization.trim() === "") {
            throw new HttpError(400, "Specialization is required");
        }
        return doctorRepo.getDoctorsBySpecialization(specialization);
    }

    async getAllDoctors(params: { page: number; limit: number }) {
        return doctorRepo.getAllDoctors(params);
    }

    async updateDoctor(id: string, data: UpdateDoctorDTO) {
        const doctor = await doctorRepo.updateDoctor(id, data);
        if (!doctor) throw new HttpError(404, "Doctor not found");
        return doctor;
    }

    async deleteDoctor(id: string) {
        const ok = await doctorRepo.deleteDoctor(id);
        if (!ok) throw new HttpError(404, "Doctor not found");
        return ok;
    }
}
