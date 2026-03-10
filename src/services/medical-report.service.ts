import { CreateMedicalReportDTO, ShareMedicalReportDTO } from "../dtos/medical-report.dto";
import { MedicalReportRepository } from "../repositories/medical-report.repository";
import { HttpError } from "../errors/http-error";

const reportRepo = new MedicalReportRepository();

export class MedicalReportService {
    async createReport(data: CreateMedicalReportDTO) {
        return reportRepo.createReport(data);
    }

    async getReportById(id: string) {
        const report = await reportRepo.getReportById(id);
        if (!report) throw new HttpError(404, "Report not found");
        return report;
    }

    async listByPatient(patientId: string, params: { page: number; limit: number }) {
        return reportRepo.getReportsByPatient(patientId, params);
    }

    async listSharedWithDoctor(doctorId: string, params: { page: number; limit: number }) {
        return reportRepo.getReportsSharedWithDoctor(doctorId, params);
    }

    async listSharedForDoctorAndPatient(doctorId: string, patientId: string, params: { page: number; limit: number }) {
        return reportRepo.getReportsForDoctorAndPatient(doctorId, patientId, params);
    }

    async shareReport(reportId: string, payload: ShareMedicalReportDTO) {
        const report = await reportRepo.getReportById(reportId);
        if (!report) throw new HttpError(404, "Report not found");
        const existing = (report.sharedWithDoctors || []).map((id) => String(id));
        if (!existing.includes(payload.doctorId)) {
            existing.push(payload.doctorId);
        }
        return reportRepo.updateReport(reportId, { sharedWithDoctors: existing as any });
    }

    async deleteReport(reportId: string) {
        const report = await reportRepo.getReportById(reportId);
        if (!report) throw new HttpError(404, "Report not found");
        const ok = await reportRepo.deleteReport(reportId);
        if (!ok) throw new HttpError(404, "Report not found");
        return report;
    }
}
