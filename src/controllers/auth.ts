import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { sendOTPEmail, sendResetLinkEmail } from "../utils/sendEmail";
import jwt from "jsonwebtoken";

const userRepo = AppDataSource.getRepository(User);

export const generateOTP = () =>
  Math.floor(1000 + Math.random() * 9000).toString();

const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400).json({ msg: "Email and OTP are required" });
    return;
  }

  try {
    const user = await userRepo.findOneBy({ email });
    if (!user) {
      res.status(404).json({ msg: "User not found" });
      return;
    }

    if (user.otp !== otp) {
      res.status(400).json({ msg: "Invalid OTP" });
      return;
    }

    user.verified = true;
    user.otp = ""; // clear OTP after successful verification
    await userRepo.save(user);

    res.json({ msg: "Account verified successfully" });
    return;
  } catch (error: any) {
    res.status(500).json({ msg: error.message });
    return;
  }
};

const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    res.status(400).json({ msg: "Token and new password are required" });
    return;
  }

  try {
    const decoded: any = jwt.verify(token, process.env.RESET_PASSWORD_SECRET!);
    const user = await userRepo.findOneBy({ id: decoded.userId });

    if (!user) {
      res.status(404).json({ msg: "Invalid token" });
      return;
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;

    await userRepo.save(user);
    res.json({ msg: "Password has been reset successfully." });
    return;
  } catch (error: any) {
    res.status(400).json({ msg: "Invalid or expired token." });
  }
};

const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ msg: "Email is required" });
    return;
  }

  try {
    const user = await userRepo.findOneBy({ email });
    if (!user) {
      res.status(404).json({ msg: "User not found" });
      return;
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.RESET_PASSWORD_SECRET!,
      { expiresIn: "15m" },
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendResetLinkEmail(email, resetLink);

    res.json({ msg: "Password reset link sent to your email." });
    return;
  } catch (error: any) {
    res.status(500).json({ msg: error.message });
    return;
  }
};

const signup = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email ) {
      res.status(400).json({ msg: "Missing required fields" });
      return;
    }

    const existing = await userRepo.findOneBy({ email });
    if (existing) {
      res.status(400).json({ msg: "Email already registered" });
      return;
    }

    // const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    const user = userRepo.create({
      email,
      // password: hashed,
      provider: "local",
      otp,
      verified: false,
    });

    await userRepo.save(user);
    await sendOTPEmail(email, otp);

    req.login(user, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ msg: "Signup successful, but login failed." });
      }
      res.json({ msg: "Signup successful. OTP sent via email.", user });
      return;
    });
  } catch (error: any) {
    res.status(500).json({ msg: error.message });
  }
};

const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ msg: "Email is required" });
      return;
    }

    const user = await userRepo.findOneBy({ email });
    if (!user) {
      res.status(404).json({ msg: "User not found" });
      return;
    }

    const otp = generateOTP();
    user.otp = otp;
    await userRepo.save(user);
    await sendOTPEmail(email, otp);

    res.json({ msg: "OTP resent successfully" });
    return;
  } catch (error: any) {
    res.status(500).json({ msg: error.message });
  }
};

const loginLocal = (req, res) => {
  delete req.user.password;
  res.json({ msg: "Logged in", user: req.user });
};

export {
  signup,
  loginLocal,
  resendOtp,
  resetPassword,
  requestPasswordReset,
  verifyOtp,
};
