import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import UserModel from "../models/auth.model.js";

export const AuthMiddleware = expressAsyncHandler(async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer")) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        try {
            // verify token 
            const decoded = jwt.verify(token, ENV.JWT_SECRET);

            // finding the user
            if (!decoded) {
                return res.status(401).json({ message: "Invalid token, access denied" });
            }
            const user = await UserModel.findById(decoded.id).select("-password");
            if (!user) {
                return res.status(401).json({ message: "Unauthorized, user not found" });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error("Error verifying token:", error);
            return res.status(401).json({ message: "Invalid token, access denied" });
        }

    } catch (error) {
        console.log("Error in AuthMiddleware middleware: " + error);
        next(error);
    }
});

export const requireAdmin = expressAsyncHandler(async (req, res, next) => {
    try {
        const currentUser = req.user;
        if (!currentUser) {
            return res.status(401).json({ message: "Unauthorized, user not found" });
        }
        const isAdmin = ENV.ADMIN_ID.includes(currentUser.email);
        if (!isAdmin) {
            return res.status(401).json({ message: "Unauthorized, access denied" });
        }
        next();
    } catch (error) {
        console.log("Error in requireAdmin middleware: " + error);
        next(error);
    }
});

export const VerifyTeacher = expressAsyncHandler(async (req, res, next) => {
    try {
        const currentUser = req.user;
        if (!currentUser) {
            return res.status(401).json({ message: "Unauthorized, user not found" });
        }
        const isTeacher = currentUser.role === "teacher";
        if (!isTeacher) {
            return res.status(401).json({ message: "Unauthorized, access denied" });
        }
        next();
    } catch (error) {
        console.log("Error in exportVerifyTeacher middleware: " + error);
        next(error);
    }
});

export const VerifyStudent = expressAsyncHandler(async (req, res, next) => {
    try {
        const currentUser = req.user;
        if (!currentUser) {
            return res.status(401).json({ message: "Unauthorized, user not found" });
        }
        const isStudent = currentUser.role === "student";
        if (!isStudent) {
            return res.status(401).json({ message: "Unauthorized, access denied" });
        }
        next();
    } catch (error) {
        console.log("Error in exportVerifyStudent middleware: " + error);
        next(error);
    }
});