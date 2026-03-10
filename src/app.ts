import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { connectDatabase } from './database/mongodb';
import { PORT, HOST } from './configs';
import cors from 'cors';
import authRouter from './routes/auth.route';
import patientRouter from './routes/patient.route';
import adminUserRouter from './routes/admin.user.route';
import doctorRouter from './routes/doctor.route';
import appointmentRouter from './routes/appointment.route';
import reviewRouter from './routes/review.route';
import prescriptionRouter from './routes/prescription.route';
import medicalReportRouter from './routes/medical-report.route';
import notificationRouter from './routes/notification.route';
import doctorDocumentRouter from './routes/doctor-document.route';
import adminDoctorRouter from './routes/admin.doctor.route';
import adminAppointmentRouter from './routes/admin.appointment.route';
import adminCategoryRouter from './routes/admin.category.route';
import adminAnalyticsRouter from './routes/admin.analytics.route';
import paymentRouter from './routes/payment.route';
import adminPaymentRouter from './routes/admin.payment.route';
import videoConsultationRouter from './routes/video-consultation.route';
import supportTicketRouter from './routes/support-ticket.route';
import contentRouter from './routes/content.route';
import systemSettingRouter from './routes/system-setting.route';
import auditLogRouter from './routes/audit-log.route';
import aiSymptomsRouter from './routes/ai-symptoms.route';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';
import { auditLogMiddleware } from './middleware/audit.middleware';

const app: Application = express();

const corsOptions = {
    origin:[ 'http://localhost:3000', 'http://localhost:3003', 'http://localhost:3005' ],
    optionsSuccessStatus: 200,
    credentials: true,
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(auditLogMiddleware);

// serve uploaded files
app.use('/auth/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api/auth/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({
        success: true,
        message: "Welcome to the API "
    });
});

app.use('/auth', authRouter);
app.use('/auth/patients', patientRouter);
app.use('/auth/doctors', doctorRouter);
app.use('/auth/appointments', appointmentRouter);
app.use('/api/auth', authRouter);
app.use('/api/auth/patients', patientRouter);
app.use('/api/auth/doctors', doctorRouter);
app.use('/api/auth/appointments', appointmentRouter);
app.use('/api/admin/users', adminUserRouter);
app.use('/api/admin/doctors', adminDoctorRouter);
app.use('/api/admin/appointments', adminAppointmentRouter);
app.use('/api/admin/categories', adminCategoryRouter);
app.use('/api/admin/analytics', adminAnalyticsRouter);
app.use('/api/admin/payments', adminPaymentRouter);
app.use('/', reviewRouter);
app.use('/api', reviewRouter);
app.use('/', prescriptionRouter);
app.use('/api', prescriptionRouter);
app.use('/', medicalReportRouter);
app.use('/api', medicalReportRouter);
app.use('/', notificationRouter);
app.use('/api', notificationRouter);
app.use('/', doctorDocumentRouter);
app.use('/api', doctorDocumentRouter);
app.use('/', paymentRouter);
app.use('/api', paymentRouter);
app.use('/', videoConsultationRouter);
app.use('/api', videoConsultationRouter);
app.use('/', supportTicketRouter);
app.use('/api', supportTicketRouter);
app.use('/', contentRouter);
app.use('/api', contentRouter);
app.use('/', systemSettingRouter);
app.use('/api', systemSettingRouter);
app.use('/', auditLogRouter);
app.use('/api', auditLogRouter);
app.use('/api/ai', aiSymptomsRouter);

app.use(notFoundHandler);

app.use(errorHandler);


export default app;