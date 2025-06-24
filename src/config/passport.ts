import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import { Strategy as AppleStrategy } from "passport-apple";
import bcrypt from "bcrypt";
import { User } from "../entities/User";
import { AppDataSource } from "../config/data-source";

const userRepo = AppDataSource.getRepository(User);

passport.serializeUser((user: any, done) => done(null, user.id));

passport.deserializeUser(async (id: number, done) => {
  const user = await userRepo.findOneBy({ id });
  done(null, user);
});

// Local Strategy
passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    const user = await userRepo.findOneBy({ email });
    if (!user || !user.password) return done(null, false, { message: "Invalid credentials" });
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? done(null, user) : done(null, false);
  })
);
// Google Strategy
passport.use(
  new GoogleStrategy({
    clientID: process.env.GOOGLE_ID!,
    clientSecret: process.env.GOOGLE_SECRET!,
    callbackURL: "/api/auth/google/callback"
  }, async (_accessToken, _refreshToken, profile, done) => {
    const email = profile.emails?.[0].value;
    let user = await userRepo.findOneBy({ email });
    if (!user) {
      user = userRepo.create({ email, provider: "google" });
      await userRepo.save(user);
    }
    return done(null, user);
  })
);

// Microsoft Strategy
passport.use(
  new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_ID!,
    clientSecret: process.env.MICROSOFT_SECRET!,
    callbackURL: "/auth/microsoft/callback",
    scope: ['user.read']
  }, async (_accessToken, _refreshToken, profile, done) => {
    const email = profile.emails?.[0];
    let user = await userRepo.findOneBy({ email });
    if (!user) {
      user = userRepo.create({ email, provider: "microsoft" });
      await userRepo.save(user);
    }
    return done(null, user);
  })
);

// Apple Strategy
passport.use(
  new AppleStrategy({
    clientID: process.env.APPLE_ID!,
    teamID: process.env.APPLE_TEAM_ID!,
    keyID: process.env.APPLE_KEY_ID!,
    privateKey: process.env.APPLE_PRIVATE_KEY!,
    callbackURL: "/auth/apple/callback"
  }, async (_accessToken, _refreshToken, idToken, profile, done) => {
    const email = profile.email;
    let user = await userRepo.findOneBy({ email });
    if (!user) {
      user = userRepo.create({ email, provider: "apple" });
      await userRepo.save(user);
    }
    return done(null, user);
  })
);
