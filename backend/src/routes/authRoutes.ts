import { Router } from "express";
import {
  forgotPassword,
  logout,
  resetPassword,
  signin,
  signup,
} from "../controller/authController";
import ensureAuthenticated from "../middleware/Auth";

const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/signin", signin);
authRouter.post("/logout", logout);
authRouter.post("/forgotPassword", forgotPassword);
authRouter.post("/resetPassword", resetPassword);

export default authRouter;
