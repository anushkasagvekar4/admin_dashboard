import { Router } from "express";
import { logout, signin } from "../controller/authController";
import ensureAuthenticated from "../middleware/Auth";

const authRouter = Router();

authRouter.post("/signin", signin);
authRouter.post("/logout", logout);

export default authRouter;
