import UserModel from "../models/auth.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import expressAsyncHandler from "express-async-handler";
import OrganizationModel from "../models/organization.model.js";
import { generateVerificationToken } from "../service/generateVerificatonToken.js";
import { sendResetOtp, sendVerificationEmail } from "../service/emailService.js";

const generateToken = (id) => {
    return jwt.sign({ id }, ENV.JWT_SECRET, {
        expiresIn: "7d"
    });
}

export const registerUser = expressAsyncHandler(async (req, res, next) => {
    try {
        const { name, email, password, Organization, role, guardianName, guardianNumber } = req.body;

        // validation
        if (!name || !email || !password || !role || !Organization) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // check if the role is strudent then guardian details are also required
        if (role === "student" && (!guardianName || !guardianNumber)) {
            return res.status(400).json({ error: "For students, guardian name and number are required" });
        }

        // check for existing user
        const existingUser = await UserModel.findOne({ email });
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ error: "User already exists" });
        }
        else if (existingUser && !existingUser.isVerified) {
            return res.status(400).json({ error: "Account is already created but verification is pending, please check your email" });
        }

        // check for the organization
        for (let org of Organization) {
            const organization = await OrganizationModel.findById(org);
            if (!organization) {
                return res.status(400).json({ error: "Organization not found" });
            }
        }

        // boolean variable to check whether the teacher email id is in the admin list of the organization
        let isTeacherAdmin = false;
        for (let org of Organization) {
            const organization = await OrganizationModel.findById(org);
            if (organization.adminIds.includes(email)) {
                isTeacherAdmin = true;
                break;
            }
        }

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // create verification Token
        const verificationToken = generateVerificationToken();

        // send otp to user
        const emailSent = await sendVerificationEmail(email, name, verificationToken);

        if (emailSent.success) {
            // create user
            await UserModel.create({
                name,
                email,
                password: hashedPassword,
                role,
                guardian: {
                    name: guardianName,
                    number: guardianNumber
                },
                Organization,
                verificationToken,
                isTeacherVerified: isTeacherAdmin
            });
            res.status(201).json({ message: "Verification email sent, check your email and verify your account" });
        }
        else {
            res.status(400).json({ error: "Failed to send verification email" });
        }
    } catch (error) {
        console.log("Error in User register controller : " + error);
        next(error);
    }
})

// verify user
export const verifyUser = expressAsyncHandler(async (req, res, next) => {
    try {
        const { email__token } = req.params;
        const [email, queryToken] = email__token.split('__');
        if (!email || !queryToken) {
            return res.send(`
             <html>
                <body style="font-family: Arial, sans-serif; background-color: #f0f0f0; padding: 20px;">
                  <div style="max-width: 400px; margin: 0 auto; background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h1 style="color: #333; font-size: 24px; text-align: center; margin-bottom: 10px;">Error: Missing Information</h1>
                  </div>
                </body>
              </html>
            `);
        }
        const user = await UserModel.findOne({ email })
            .populate("Organization", { name: 1 });
        if (!user) {
            return res.send(`
              <html>
                <body style="font-family: Arial, sans-serif; background-color: #f0f0f0; padding: 20px;">
                  <div style="max-width: 400px; margin: 0 auto; background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h1 style="color: #333; font-size: 24px; text-align: center; margin-bottom: 10px;">Error: User Not Found</h1>
                    <p style="color: #666; font-size: 16px; text-align: center; margin-bottom: 20px;">The email address you provided does not exist in our system.</p>
                  </div>
                </body>
              </html>
            `);
        }

        // if user is already verified
        if (user.isVerified) {
            return res.send(`
             <html>
                <body style="font-family: Arial, sans-serif; background-color: #f0f0f0; padding: 20px;">
                  <div style="max-width: 400px; margin: 0 auto; background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h1 style="color: #333; font-size: 24px; text-align: center; margin-bottom: 10px;">Account Already Verified</h1>
                    <p style="color: #666; font-size: 16px; text-align: center; margin-bottom: 20px;">Your account has already been verified.</p>
                  </div>
                </body>
              </html>
            `);
        }

        // check if otp is correct
        if (user.verificationToken.toString() !== queryToken) {
            return res.send(`
          <html>
            <body style="font-family: Arial, sans-serif; background-color: #f0f0f0; padding: 20px;">
              <div style="max-width: 400px; margin: 0 auto; background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h1 style="color: #333; font-size: 24px; text-align: center; margin-bottom: 10px;">Invalid Verification Token!</h1>
                <p style="color: #666; font-size: 16px; text-align: center; margin-bottom: 20px;">Your verification token is incorrect.</p>
            </body>
          </html>
        `);
        }

        // update user
        user.isVerified = true;
        user.verificationToken = null; // clear the otp
        await user.save();
        if (user.role === "teacher" && !user.isTeacherVerified) {
            return res.send(`
                <html>
                 <body style="font-family: Arial, sans-serif; background-color: #f0f0f0; padding: 20px;">
                   <div style="max-width: 400px; margin: 0 auto; background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                     <h1 style="color: #333; font-size: 24px; text-align: center; margin-bottom: 10px;">Account Verified!</h1>
                     <p style="color: #666; font-size: 16px; text-align: center; margin-bottom: 20px;">Your account has been successfully verified.</p>
                     <p style="color: #666; font-size: 16px; text-align: center; margin-bottom: 20px;">You have to verify your account by contacting your Organization admins.</p>
                 </body>
               </html>
                `)
        }
        res.send(`
           <html>
            <body style="font-family: Arial, sans-serif; background-color: #f0f0f0; padding: 20px;">
              <div style="max-width: 400px; margin: 0 auto; background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h1 style="color: #333; font-size: 24px; text-align: center; margin-bottom: 10px;">Account Verified!</h1>
                <p style="color: #666; font-size: 16px; text-align: center; margin-bottom: 20px;">Your account has been successfully verified.</p>
                <p style="color: #666; font-size: 16px; text-align: center; margin-bottom: 20px;">You can now login to the app.</p>
            </body>
          </html>
        `);

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
        const user = await UserModel.findOne({ email })
            .populate("Organization", { name: 1 });
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

        // if user is a teacher but not verified 
        if (user.role === "teacher" && !user.isTeacherVerified) {
            return res.status(400).json({ error: "User is not verified, Contact the Organization admin to verify the teacher" });
        }

        // generate token
        const token = generateToken(user._id);
        res.status(200).json({
            message: "Login successful", token,
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                guardian: user.guardian,
                Organization: user.Organization,
                isTeacherVerified: user.isTeacherVerified
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
    const emailSent = await sendResetOtp(email, user.name, otp);
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
                guardian: user.guardian,
                Organization: user.Organization
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
