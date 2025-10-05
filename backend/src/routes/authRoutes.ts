import { Router } from "express";
import { logout, signin, signup } from "../controller/authController";
import ensureAuthenticated from "../middleware/Auth";

const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/signin", signin);
authRouter.post("/logout", logout);

export default authRouter;
