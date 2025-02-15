"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const notifications_controller_1 = require("../controllers/notifications.controller");
exports.notificationsRouter = express_1.default.Router();
exports.notificationsRouter.put("/markAsRead/:id?", auth_1.isAuth, notifications_controller_1.markAsRead);
exports.notificationsRouter.get("/get", auth_1.isAuth, notifications_controller_1.getNotifications);
