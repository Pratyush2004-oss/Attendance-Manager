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
 * @returns {Promise<string>} - True if email was sent successfully, false otherwise.
 */

async function sendOtpEmail(recipientEmail, recipientName, otp) {
  // 3. Create the email payload
  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.sender = {
    name: 'Attandance App', // Name of the sender
    email: 'no-reply@yourdomain.com' // IMPORTANT: This should be a verified sender email in Brevo
  };
  sendSmtpEmail.to = [{
    email: recipientEmail,
    name: recipientName
  }];
  sendSmtpEmail.subject = 'Your OTP for Login';
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
    return "Email sent successfully, message ID: " + data.messageId;
  } catch (error) {
    return "Error sending email: " + error.message;
  }
}

// 5. Export the function to use it in other parts of your app
export default sendOtpEmail;