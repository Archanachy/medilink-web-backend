import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

type PrescriptionPdfPayload = {
    prescription: {
        _id: string;
        patientId: string;
        doctorId: string;
        notes?: string;
        status?: string;
        created_at?: Date;
    };
    items: Array<{ name: string; dosage: string; frequency: string; duration: string; instructions?: string }>;
};

export async function generatePrescriptionPdf(payload: PrescriptionPdfPayload) {
    const outputDir = path.join(process.cwd(), "uploads", "prescriptions");
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = `prescription-${payload.prescription._id}.pdf`;
    const filePath = path.join(outputDir, filename);

    return new Promise<{ filename: string; filePath: string; fileUrl: string }>((resolve, reject) => {
        const doc = new PDFDocument({ size: "A4", margin: 50 });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        doc.fontSize(18).text("Prescription", { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text(`Prescription ID: ${payload.prescription._id}`);
        doc.text(`Patient ID: ${payload.prescription.patientId}`);
        doc.text(`Doctor ID: ${payload.prescription.doctorId}`);
        doc.text(`Status: ${payload.prescription.status ?? "active"}`);
        if (payload.prescription.notes) {
            doc.moveDown();
            doc.text(`Notes: ${payload.prescription.notes}`);
        }

        doc.moveDown();
        doc.fontSize(14).text("Medications");
        doc.moveDown(0.5);

        payload.items.forEach((item, index) => {
            doc.fontSize(12).text(`${index + 1}. ${item.name}`);
            doc.text(`   Dosage: ${item.dosage}`);
            doc.text(`   Frequency: ${item.frequency}`);
            doc.text(`   Duration: ${item.duration}`);
            if (item.instructions) {
                doc.text(`   Instructions: ${item.instructions}`);
            }
            doc.moveDown(0.5);
        });

        doc.end();

        stream.on("finish", () => {
            resolve({
                filename,
                filePath,
                fileUrl: `/uploads/prescriptions/${filename}`,
            });
        });
        stream.on("error", reject);
    });
}
