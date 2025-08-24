import express from 'express'
import cors from 'cors';
import connectDB from './config/db.js';
import { ENV } from './config/env.js';

// importing routes
import authRoutes from './routes/auth.route.js';
import batchRoutes from './routes/batchs.route.js';
import attendanceRoute from './routes/attendance.router.js';
import organizationRoute from "./routes/organization.route.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Attendance-Manager is now Live");
})

app.use('/api/auth', authRoutes);
app.use('/api/batch', batchRoutes);
app.use('/api/attendance', attendanceRoute);
app.use('/api/organization', organizationRoute);

app.use((err, req, res, next) => {
    console.error("Unhandled error: ", err);
    res.status(500).json({ error: `Error in server : ${err.message}` || "Internal Server Error" })
})

const startServer = async () => {
    try {
        await connectDB();
        // listen to local development
        if (ENV.NODE_ENV !== 'production') {
            app.listen(ENV.PORT, () => {
                console.log(`Server listening on port ${ENV.PORT}`);
            })
        }
    } catch (error) {
        console.log("Failed to start Server:" + error.message);
        process.exit(1);
    }
}
startServer();
