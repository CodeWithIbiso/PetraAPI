import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { confirmationEmail, passwordResetEmail } from "./htmlTemplates.js";
import bcrypt from "bcrypt";

export const generateJWT = ({ _id, email }) => {
  return jwt.sign(
    {
      email,
      id: _id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "30 days" }
  );
};

export const sendEmailConfirmationMail = async ({ email, name, code }) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    secure: false,
    auth: {
      user: process.env.NODEMAILER_USERNAME,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });
  try {
    await transporter.sendMail({
      from: process.env.NODEMAILER_SENDER,
      to: email,
      subject: "Successful Petra Registration",
      html: confirmationEmail({ to: name, code }),
    });
  } catch (error) {}
};

export const sendResetPasswordMail = async ({ email, name, code }) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    secure: false,
    auth: {
      user: process.env.NODEMAILER_USERNAME,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });
  try {
    await transporter.sendMail({
      from: process.env.NODEMAILER_SENDER,
      to: email,
      subject: "Password Reset Request",
      html: passwordResetEmail({ to: name, code }),
    });
  } catch (error) {}
};

export const generateRandomNumber = () => {
  return Math.floor(Math.random() * 90000) + 10000;
};

export const verificationCodeExpiry = () => {
  // Get the current date/time
  const now = new Date();

  // Add 5 minutes to the current date/time
  const newDateObj = new Date(now.getTime() + 5 * 60000);

  // Return the new date/time as a string in ISO format
  return newDateObj.toISOString();
};

export const hasVerificationCodeExpired = (dateTime) => {
  // Convert input to Date object
  const dateObj = new Date(dateTime);

  // Get the current date/time
  const now = new Date();

  // Check if the input date/time is in the past
  if (dateObj.getTime() < now.getTime()) {
    return true; // Time has elapsed
  } else {
    return false; // Time has not elapsed
  }
};
export const FailedRequestErrorHandler = (error) => ({
  message:
    error.message ||
    "An internal server error occurred. Please try again later",
  code: !error.code ? 400 : 500,
  token: null,
  user: null,
});

export const hashPassword = (password) => {
  const saltValue = 10;
  const salt = bcrypt.genSaltSync(saltValue);
  return bcrypt.hashSync(password, salt);
};

export const extractToken = (token) => {
  if (token && token.slice(0, 6) == "Bearer") return token.split(" ")[1];
  return token;
};
