import express from "express";
import session from "express-session";
import passport from "passport";
import authRoutes from "./src/routes/auth";
import userRoutes from "./src/routes/user";
import "./src/config/passport";
import cors from "cors";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: "secret123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:"none"
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

export default app;
