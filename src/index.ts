import { createServer } from "http";
import { connectDatabase } from './database/mongodb';
import { PORT, HOST } from './configs';
import app from './app';
import { initializeSocket } from "./utils/socket";
import { startAppointmentReminderScheduler } from "./services/appointment-reminder.service";

async function startServer() {
    await connectDatabase();

    const httpServer = createServer(app);
    initializeSocket(httpServer);
    startAppointmentReminderScheduler();

    httpServer.listen(
        PORT,
        HOST,
        () => {
            console.log(`Server listening on http://${HOST}:${PORT}`);
        }
    );
}

startServer();