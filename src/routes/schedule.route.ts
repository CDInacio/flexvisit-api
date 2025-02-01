import express from "express";
import {
  isAdmin,
  isAuth,
} from "../middlewares/auth";
import {
  createSchedule,
  getAvaliableDates,
  getSchedule,
} from "../controllers/schedule.controller";

export const scheduleRouter = express.Router();

scheduleRouter.get("/getDataOverview");
scheduleRouter.post("/create", isAuth, isAdmin, createSchedule);
scheduleRouter.get("/get", getSchedule);
scheduleRouter.get("/avaliableDates", isAuth, getAvaliableDates);
