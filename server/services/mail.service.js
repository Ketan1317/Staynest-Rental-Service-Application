import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendMail = async ({ to, subject, text, html }) => {
  const info = await transporter.sendMail({
    from: `"StayNest" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });

  return info;
};

export default sendMail;
