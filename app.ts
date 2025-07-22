import express from "express";
import session from "express-session";
import passport from "passport";
import authRoutes from "./src/routes/auth";
import userRoutes from "./src/routes/user";
import conversationRoutes from "./src/routes/conversation"
import "./src/config/passport";
import cors from "cors";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, 
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));
app.use(
  session({
    secret: "secret123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,              // Required for HTTPS (on Render)
      sameSite: "none",          // Required for cross-domain (Vercel -> Render)
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/conversation",conversationRoutes);

export default app;
