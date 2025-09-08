import { Router } from "express";
import {
  createUser,
  getAllUser,
  updateUserStatus,
} from "../controller/usersController";

const userRouter = Router();

userRouter.post("/createUser", createUser);
userRouter.put("/updateUserStatus/:id", updateUserStatus);
userRouter.get("/getAllUser", getAllUser);

export default userRouter;
