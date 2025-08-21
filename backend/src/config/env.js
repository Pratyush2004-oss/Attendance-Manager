import dotenv from "dotenv";
dotenv.config();

export const ENV = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    BREVO_API_KEY: process.env.BREVO_API_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
    ADMIN_ID: process.env.ADMIN_ID
}