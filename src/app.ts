import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";
import { limiter } from "./middlewares/ratelimiter";
import healthRouter from "./routes/v1/health";
import authRouter from "./routes/v1/auth";

export const app = express();

//for middleware for expressjs
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(compression()); //for zip
app.use(limiter); //for create middlewars for ratelimiter.ts
app.use(express.static("public")); //link for style css input for upper page

app.use(healthRouter); //for create controller for healthcontroller.ts
app.use(authRouter);

//catch for error
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const status = error.status || 500;
  const message = error.message || "Server error..";
  const code = error.code || "Error code";
  res.status(status).json({ message, error: code });
});
