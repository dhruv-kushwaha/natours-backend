import nodemailer from "nodemailer";

interface OptionsType {
  email: string;
  subject: string;
  message: string;
}

export const sendEmail = async function (options: OptionsType) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: "'Dhruv Kushwaha 👻' <bonjour@dhruv.io>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};
