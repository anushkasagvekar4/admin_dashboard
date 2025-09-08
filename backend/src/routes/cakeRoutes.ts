import { Router } from "express";

import {
  createCake,
  deleteCake,
  getAllCakes,
} from "../controller/cakesController";

const cakeRouter = Router();

cakeRouter.get("/createCake", createCake);
cakeRouter.get("/getAllCake", getAllCakes);
cakeRouter.get("/deleteCake", deleteCake);

export default cakeRouter;
