import express, { Application } from "express";
import dotenv, { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/userRoutes";
import authRouter from "./routes/authRoutes";

dotenv.config();
const app: Application = express();
const port = process.env.PORT || 8080;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
// app.use("/api/orders", orderRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
