import express, { Application } from "express";
import dotenv, { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import customerRouter from "./routes/customerRoutes";
import authRouter from "./routes/authRoutes";
import cakeRouter from "./routes/cakeRoutes";
import shopRouter from "./routes/shopRoutes";
import enquiryRouter from "./routes/enquiryRouter";

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
app.use("/api/customers", customerRouter);
app.use("/api/cakes", cakeRouter);
app.use("/api/shops", shopRouter);
app.use("/api/enquiry", enquiryRouter);
// app.use("/api/orders", orderRouter);
console.log("DB Connection:", {
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
