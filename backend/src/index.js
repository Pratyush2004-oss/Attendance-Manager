import express from 'express'
import cors from 'cors';
import connectDB from './config/db.js';
import { ENV } from './config/env.js';

// importing routes
import authRoutes from './routes/auth.route.js';


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = ENV.PORT;

app.use('/api/auth', authRoutes);

app.use((err, req, res, next) => {
    console.error("Unhandled error: ", err);
    res.status(500).json({ error: `Error in server : ${err.message}` || "Internal Server Error" })
})

app.listen(PORT, () => {
    connectDB();
    console.log(`Server running on port ${PORT}`)
});
