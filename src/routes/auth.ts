import { Router } from "express";
import passport from "passport";
import {
  loginLocal,
  signup,
  verifyForgotPasswordOtp,
  resetPassword,
  resendOtp,
  verifyOtp,
  checkEmail,
  getUser,
} from "../controllers/auth";
import { ensureAuthenticated } from "../middleware/protected";

const router = Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.get("/get-user",ensureAuthenticated,getUser)

router.post("/login", loginLocal);

router.post("/verify-otp-forgot-password", verifyForgotPasswordOtp);
router.post("/reset-password", resetPassword);
router.post("/check-email",checkEmail)

router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: `${process.env.FRONTEND_URL}/dashboard`,
    failureRedirect: `${process.env.FRONTEND_URL}`,
  }),
);

router.get("/microsoft", passport.authenticate("microsoft"));

router.get(
  "/microsoft/callback",
  passport.authenticate("microsoft", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/");
  },
);

router.get("/apple", passport.authenticate("apple"));
router.post(
  "/apple/callback",
  passport.authenticate("apple", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard");
  },
);

export default router;
