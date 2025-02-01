import express from "express";
import { isAuth } from "../middlewares/auth";
import { getNotifications, markAsRead } from "../controllers/notifications.controller";

export const notificationsRouter = express.Router();

notificationsRouter.put("/markAsRead/:id?", isAuth, markAsRead);
notificationsRouter.get("/get", isAuth, getNotifications);