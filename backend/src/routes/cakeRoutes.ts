import { Router } from "express";

import {
  createCake,
  deleteCake,
  getAllCakes,
  getCakeById,
  updateCake,
} from "../controller/cakesController";
import ensureAuthenticated from "../middleware/Auth";

const cakeRouter = Router();

cakeRouter.post("/createCake", ensureAuthenticated, createCake);
cakeRouter.get("/getAllCakes", ensureAuthenticated, getAllCakes);
cakeRouter.get("/getCakeById/:id", ensureAuthenticated, getCakeById);
cakeRouter.patch("/updateCake/:id", ensureAuthenticated, updateCake);
cakeRouter.delete("/deleteCake/:id", ensureAuthenticated, deleteCake);

export default cakeRouter;
