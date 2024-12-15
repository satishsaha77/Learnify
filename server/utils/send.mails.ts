require('dotenv').config();
import nodemailer, { Transporter } from 'nodemailer';
import ejs from 'ejs';
import path from 'path';

interface EmailOptions {
  email: string;
  subject: string;
  template: string;
  data: { [key: string]: any };
}

const sendMail = async (options: EmailOptions): Promise<void> => {
  try {
    // Create the transporter using SMTP settings from environment variables
    const transporter: Transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT === '465', // true for port 465, false for other ports
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Destructure options
    const { email, subject, template, data } = options;

    // Ensure the template path is correctly resolved
    const templatePath = path.join(__dirname, '../mails', `${template}.ejs`);

    // Render the HTML using EJS and the provided data
    const html: string = await ejs.renderFile(templatePath, data);

    // Define the mail options
    const mailOptions = {
      from: `"E-Learning" <${process.env.SMTP_MAIL}>`, // Sender address
      to: email, // Receiver address
      subject: subject, // Subject line
      html: html, // Corrected: Pass the rendered HTML content
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export default sendMail;
