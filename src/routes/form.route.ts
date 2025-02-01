import express from "express";
import { isAdmin, isAuth } from "../middlewares/auth";
import {
  createForm,
  deleteForm,
  getForm,
  getForms,
  updateForm,
  updateFormStatus,
} from "../controllers/form.controller";

export const formRouter = express.Router();

formRouter.post("/create", isAuth, isAdmin, createForm);
formRouter.delete("/delete/:id", isAuth, isAdmin, deleteForm);
formRouter.put("/updateStatus/:id", isAuth, isAdmin, updateFormStatus);
formRouter.put("/update/:id", isAuth, isAdmin, updateForm);
formRouter.get("/getAll", isAuth, getForms);
formRouter.get("/get/:id", isAuth, getForm);
