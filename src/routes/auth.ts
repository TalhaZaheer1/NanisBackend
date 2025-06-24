import { Router } from "express";
import passport from "passport";
import {
  loginLocal,
  signup,
  requestPasswordReset,
  resetPassword,
  resendOtp,
  verifyOtp,
} from "../controllers/auth";

const router = Router();

router.post("/signup", signup);
router.post("/verify-otp",verifyOtp)
router.post("/resend-otp", resendOtp);

router.post("/login", passport.authenticate("local"), loginLocal);

router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard");
  },
);

router.get("/microsoft", passport.authenticate("microsoft"));

router.get(
  "/microsoft/callback",
  passport.authenticate("microsoft", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard");
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
