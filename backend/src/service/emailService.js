import Brevo from "@getbrevo/brevo";
import { ENV } from "../config/env.js";

// 2. Configure the Brevo API client
const apiInstance = new Brevo.TransactionalEmailsApi();

// Set the API key from the environment variables
apiInstance.authentications['apiKey'].apiKey = ENV.BREVO_API_KEY;

/**
 * Sends an OTP email using Brevo.
 * @param {string} recipientEmail - The email address of the recipient.
 * @param {string} recipientName - The name of the recipient.
 * @param {string} otp - The one-time password to be sent.
 * @returns {Promise<boolean>} - True if email was sent successfully, false otherwise.
 */

export async function sendVerificationEmail(recipientEmail, recipientName, verificationToken) {
  // 3. Create the email payload
  const sendSmtpEmail = new Brevo.SendSmtpEmail();
  const verificationLink = `${ENV.BASE_URL}/api/auth/verify-user/${recipientEmail}__${verificationToken}`;

  sendSmtpEmail.sender = {
    name: 'Attandance App', // Name of the sender
    email: 'mishrapratyush521@gmail.com' // IMPORTANT: This should be a verified sender email in Brevo
  };
  sendSmtpEmail.to = [{
    email: recipientEmail,
    name: recipientName
  }];
  sendSmtpEmail.subject = 'Your verification link is here';
  sendSmtpEmail.htmlContent = `
    <html>
      <body>
        <h1>Login Verification</h1>
        <p>Hello ${recipientName},</p>
        <p>Your verification link is:</p>
        <button style="background-color: #4CAF50; color: #fff; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
        <a href="${verificationLink}" style="text-decoration: none; color: #fff;">Verify Account</a>
        </button>
        <p>If you did not request this, please ignore this email.</p>
        <hr>
        <p><em>Thank you for using Your Attendance App!</em></p>
      </body>
    </html>
  `;

  // 4. Send the email
  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return {
      success: true,
      message: "Email sent successfully"
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to send email"
    };
  }
}
export async function sendResetOtp(recipientEmail, recipientName, otp) {
  // 3. Create the email payload
  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.sender = {
    name: 'Attandance App', // Name of the sender
    email: 'mishrapratyush521@gmail.com' // IMPORTANT: This should be a verified sender email in Brevo
  };
  sendSmtpEmail.to = [{
    email: recipientEmail,
    name: recipientName
  }];
  sendSmtpEmail.subject = 'Your verification link is here';
  sendSmtpEmail.htmlContent = `
    <html>
      <body>
        <h1>Login Verification</h1>
        <p>Hello ${recipientName},</p>
        <p>Your One-Time Password (OTP) is:</p>
        <h2 style="font-size: 24px; color: #333; letter-spacing: 2px;">${otp}</h2>
        <p>This code is valid for the next 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr>
        <p><em>Thank you for using Your Attendance App!</em></p>
      </body>
    </html>
  `;

  // 4. Send the email
  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return {
      success: true,
      message: "Email sent successfully"
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to send email"
    };
  }
}

