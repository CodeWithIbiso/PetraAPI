import mongoose from "mongoose";

export default mongoose.model("user", {
  image: { type: String },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  emailVerified: { type: Boolean, default: false },
  verificationCode: { type: Number },
  verificationCodeExpiry: { type: String },
  paswordResetCode: { type: Number },
  passwordResetCodeExpiry: { type: String },
  publicKey: { type: String },
  secretKey: { type: String },
  createdAt: { type: Date, default: new Date() },
});
