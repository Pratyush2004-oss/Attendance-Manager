import UserModel from "../models/auth.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendOtpEmail from "../service/emailService.js";
import { ENV } from "../config/env.js";
import expressAsyncHandler from "express-async-handler";

const generateToken = (id) => {
    return jwt.sign({ id }, ENV.JWT_SECRET, {
        expiresIn: "7d"
    });
}

export const registerUser = expressAsyncHandler(async (req, res, next) => {
    try {
        const { name, email, password, role, gurdianName, gurdianNumber } = req.body;

        // validation
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: "All fields are required" });
        }
        // check for existing user
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // create otp
        const otp = Math.floor(100000 + Math.random() * 900000);

        // send otp to user
        const emailSent = await sendOtpEmail(email, name, otp);

        if (emailSent.success) {
            // create user
            const user = await UserModel.create({
                name,
                email,
                password: hashedPassword,
                role,
                guardian: {
                    name: gurdianName,
                    number: gurdianNumber
                },
                otp
            });

            res.status(201).json({ message: "Verification email sent, check your email and verify your account" });
        }
        else {
            res.status(400).json({ error: "Failed to send OTP" });
        }
    } catch (error) {
        console.log("Error in User register controller : " + error);
        next(error);
    }
})

// verify user
export const verifyUser = expressAsyncHandler(async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ error: "Please provide email and otp" });
        }
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        // if user is already verified
        if (user.isVerified) {
            return res.status(400).json({ error: "User already verified" });
        }

        // check if otp is correct
        if (user.otp.toString() !== otp) {
            return res.status(400).json({ error: "Invalid OTP" });
        }

        // update user
        user.isVerified = true;
        user.otp = null; // clear the otp
        await user.save();

        // generate token
        const token = generateToken(user._id);
        res.status(200).json({
            message: "User verified successfully", token,
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                guardian: user.guardian
            }
        });

    } catch (error) {
        console.log("Error in verify-user controller : " + error);
        next(error);
    }
})

// login controller
export const loginUser = expressAsyncHandler(async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Please provide email and password" });
        }
        // check for user
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        // checking password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        if (!user.isVerified) {
            return res.status(400).json({ error: "User is not verified, first verify the user" });
        }
        // generate token
        const token = generateToken(user._id);
        res.status(200).json({
            message: "Login successful", token,
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                guardian: user.guardian
            }
        });

    } catch (error) {
        console.log("Error in login controller : " + error);
        next(error);
    }
})

// reset password otp
export const sendResetPasswordOtp = expressAsyncHandler(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: "Please provide email" });
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
        return res.status(400).json({ error: "User not found" });
    }
    if (user.otp) {
        return res.status(400).json({ error: "OTP already sent, check your email" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    const emailSent = await sendOtpEmail(email, user.name, otp);
    if (emailSent.success) {
        user.otp = otp;
        await user.save();
        res.status(200).json({ message: "OTP sent successfully, check your email" });
    }
    else {
        res.status(400).json({ error: "Failed to send OTP" });
    }
})

// reset password
export const resetPassword = expressAsyncHandler(async (req, res, next) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.status(400).json({ error: "Please provide email, otp and new password" });
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
        return res.status(400).json({ error: "User not found" });
    }
    if (user.otp.toString() !== otp) {
        return res.status(400).json({ error: "Invalid OTP" });
    }

    // generate hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // update password
    user.password = hashedPassword;
    user.otp = null;
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });
})

// check-auth
export const checkAuth = expressAsyncHandler(async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized, user not found" });
        }
        res.status(200).json({
            message: "Authorized",
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                guardian: user.guardian
            }
        });

    } catch (error) {
        console.log("Error in check-auth controller : " + error);
        next(error);
    }
})

// check-admin
export const checkAdmin = expressAsyncHandler(async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized, user not found" });
        }
        res.status(200).json({ message: "Admin Authorized" });
    } catch (error) {
        console.log("Error in check-admin controller : " + error);
        next(error);
    }
})
