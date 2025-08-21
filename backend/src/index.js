import express from 'express'
import cors from 'cors';
import connectDB from './config/db.js';
import { ENV } from './config/env.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = ENV.PORT;

app.listen(PORT, () => {
    connectDB();
    console.log(`Server running on port ${PORT}`)
});
