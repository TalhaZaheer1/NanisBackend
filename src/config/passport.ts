import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import { Strategy as AppleStrategy } from "passport-apple";
import bcrypt from "bcrypt";
import { User } from "../entities/User";
import { AppDataSource } from "../config/data-source";
import { generateOTP } from "../controllers/auth";
import { sendOTPEmail } from "../utils/sendEmail";

const userRepo = AppDataSource.getRepository(User);

passport.serializeUser((user: any, done) => done(null, user.id));

passport.deserializeUser(async (id: number, done) => {
  const user = await userRepo.findOneBy({ id });
  done(null, user);
});

function hasTwoWeeksPassed(lastLoggedIn: Date | null | undefined): boolean {
  if (!lastLoggedIn) return true; // If no login recorded, treat as expired

  const now = new Date();
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000); // 14 days in ms

  return lastLoggedIn < twoWeeksAgo;
}

// Local Strategy
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      const user = await userRepo.findOneBy({ email });
      if (!user || !user.password)
        return done(null, false, { message: "Invalid credentials" });
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        if (hasTwoWeeksPassed(new Date(user.lastLoggedIn))) {
          const  otp =  generateOTP();
          await userRepo.update({id:user.id},{otp});
          await sendOTPEmail(email,otp);
          done(null, { ...user,step: "verify-login-otp" });
        } else {
          await userRepo.update({ id: user.id }, { lastLoggedIn: new Date() });
          done(null, { ...user, step: "dashboard" });
          return;
        }
      } else {
        done(null, false, { message: "Thats not the right password" });
        return;
      }
    },
  ),
);
// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      callbackURL: "/api/auth/google/callback",
    },
    async (_accessToken, _refreshToken, profile, done) => {
      const email = profile.emails?.[0].value;
      console.log({profile})
      let user = await userRepo.findOneBy({ email });
      if (!user) {
        user = userRepo.create({ email, provider: "google",name:profile.displayName });
        await userRepo.save(user);
      }
      return done(null, user);
    },
  ),
);

// Microsoft Strategy
passport.use(
  new MicrosoftStrategy(
    {
      clientID: process.env.MICROSOFT_ID!,
      clientSecret: process.env.MICROSOFT_SECRET!,
      callbackURL: "/auth/microsoft/callback",
      scope: ["user.read"],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      const email = profile.emails?.[0];
      let user = await userRepo.findOneBy({ email });
      if (!user) {
        user = userRepo.create({ email, provider: "microsoft" });
        await userRepo.save(user);
      }
      return done(null, user);
    },
  ),
);

// Apple Strategy
passport.use(
  new AppleStrategy(
    {
      clientID: process.env.APPLE_ID!,
      teamID: process.env.APPLE_TEAM_ID!,
      keyID: process.env.APPLE_KEY_ID!,
      privateKey: process.env.APPLE_PRIVATE_KEY!,
      callbackURL: "/auth/apple/callback",
    },
    async (_accessToken, _refreshToken, idToken, profile, done) => {
      const email = profile.email;
      let user = await userRepo.findOneBy({ email });
      if (!user) {
        user = userRepo.create({ email, provider: "apple" });
        await userRepo.save(user);
      }
      return done(null, user);
    },
  ),
);
