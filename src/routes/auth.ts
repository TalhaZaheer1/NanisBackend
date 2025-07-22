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


router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", (err, user, _info) => {
    if (err || !user) {
      return res.redirect(`${process.env.FRONTEND_URL}`);
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        return res.redirect(`${process.env.FRONTEND_URL}`);
      }

      // 🔥 Save the session manually before redirect
      req.session.save(() => {
        const redirectUrl = !user.name
          ? `${process.env.FRONTEND_URL}/onboarding?provider=google`
          : `${process.env.FRONTEND_URL}/dashboard`;

        return res.redirect(redirectUrl);
      });
    });
  })(req, res, next);
});

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
