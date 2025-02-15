"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const schedule_controller_1 = require("../controllers/schedule.controller");
exports.scheduleRouter = express_1.default.Router();
exports.scheduleRouter.get("/getDataOverview");
exports.scheduleRouter.post("/create", auth_1.isAuth, auth_1.isAdmin, schedule_controller_1.createSchedule);
exports.scheduleRouter.get("/get", schedule_controller_1.getSchedule);
exports.scheduleRouter.get("/avaliableDates", auth_1.isAuth, schedule_controller_1.getAvaliableDates);
