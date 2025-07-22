import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { sendOTPEmail, sendResetLinkEmail } from "../utils/sendEmail";
import jwt from "jsonwebtoken";
import passport from "passport";

function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

const userRepo = AppDataSource.getRepository(User);

export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const getUser = async (req: Request, res: Response) => {
  res.json({ user: req.user });
};

const verifyForgotPasswordOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400).json({ msg: "This field is required" });
    return;
  }

  try {
    const user = await userRepo.findOneBy({ email });
    if (!user) {
      res.status(404).json({ msg: "User not found" });
      return;
    }

    if (user.otp !== otp) {
      res.status(400).json({ msg: "Wrong code. Try again" });
      return;
    }

    user.otp = "";

    await userRepo.save(user);

    const token = jwt.sign(
      { userId: user.id },
      process.env.RESET_PASSWORD_SECRET!,
      { expiresIn: "15m" },
    );

    res.json({ resetPasswordToken: token, msg: "OTP verified successfully" });
    return;
  } catch (error: any) {
    res.status(500).json({ msg: error.message });
    return;
  }
};

const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp, isLogin } = req.body;

  if (!email || !otp) {
    res.status(400).json({ msg: "This field is required" });
    return;
  }

  try {
    const user = await userRepo.findOneBy({ email });
    if (!user) {
      res.status(404).json({ msg: "User not found" });
      return;
    }

    if (user.otp !== otp) {
      res.status(400).json({ msg: "Wrong code. Try again" });
      return;
    }

    user.verified = true;
    user.otp = ""; // clear OTP after successful verification
    if (isLogin) user.lastLoggedIn = new Date();
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
    res.status(400).json({ msg: error.message || "Invalid or expired token." });
  }
};

// const requestPasswordReset = async (req: Request, res: Response) => {
//   const { email } = req.body;
//
//   if (!email) {
//     res.status(400).json({ msg: "Email is required" });
//     return;
//   }
//
//   try {
//     const user = await userRepo.findOneBy({ email });
//     if (!user) {
//       res.status(404).json({ msg: "User not found" });
//       return;
//     }
//
//     const token = jwt.sign(
//       { userId: user.id },
//       process.env.RESET_PASSWORD_SECRET!,
//       { expiresIn: "15m" },
//     );
//
//     const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
//     await sendResetLinkEmail(email, resetLink);
//
//     res.json({ msg: "Password reset link sent to your email." });
//     return;
//   } catch (error: any) {
//     res.status(500).json({ msg: error.message });
//     return;
//   }
// };

const checkEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new Error("Email is required");
    }

    const isFormatValid = isValidEmail(email);
    if (!isFormatValid) throw new Error("Email doesn't exist");

    const existing = await userRepo.findOneBy({ email });
    console.log({ existing });
    if (existing) {
      if (existing.provider !== "local") {
        res
          .status(500)
          .json({ msg: `Please sign-in through ${existing.provider}` });
        return;
      } else if (!existing.verified || !existing.password) {
        const otp = generateOTP();
        await userRepo.update({ email }, { otp });
        await sendOTPEmail(email, otp);
        req.login(existing, (err) => {
          if (err) {
            return res
              .status(500)
              .json({ msg: "Signup successful, but login failed." });
          }
          res.json({
            msg: "Signup successful. OTP sent via email.",
            user: existing,
            step: "signup-otp",
          });
          return;
        });
      } else {
        res.json({ msg: "Email is registered", step: "login-password" });
        return;
      }
    } else {
      const response = await fetch(
        `${process.env.EMAIL_VERIFICATION_URL}${email}`,
      );
      const isValid: any = await response.json();
      console.log({ isValid });
      if (isValid.smtpCheck === "false" && isValid.disposableCheck === "false")
        throw new Error("Email doesn't exist");

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
        res.json({
          msg: "Signup successful. OTP sent via email.",
          user,
          step: "signup-otp",
        });
        return;
      });
    }
  } catch (error: any) {
    res.status(500).json({ msg: error.message });
  }
};

const checkPassword = async (req: Request, res: Response) => {
  const email = req.body.email;
  try {
    if (!email) throw new Error("Email is required");
  } catch (error: any) {
    res.status(500).json({ msg: error.message });
  }
};

const signup = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
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

const loginLocal = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      // This will send JSON error when credentials are invalid
      return res.status(401).json({ msg: info?.message || "Login failed" });
    }
    // Log the user in manually
    req.logIn(user, (err) => {
      if (err) return next(err);
      const safeUser = { ...user };
      delete safeUser.password;
      return res.json({ msg: "Logged in", user: safeUser });
    });
  })(req, res, next);
};

export {
  signup,
  loginLocal,
  resendOtp,
  resetPassword,
  verifyForgotPasswordOtp,
  verifyOtp,
  checkEmail,
  getUser,
};
